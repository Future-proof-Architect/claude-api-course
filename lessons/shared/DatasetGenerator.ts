import pLimit from "p-limit";
import { Message, add_user_message, chatStructured, render, writeOutput } from "./shared.js";

export class DatasetGenerator {
  private concurrency: number;

  constructor({ concurrency = 3 }: { concurrency?: number } = {}) {
    this.concurrency = concurrency;
  }

  // Generates diverse scenario ideas before creating full test cases.
  async generateUniqueIdeas(
    taskDescription: string,
    promptInputsSpec: Record<string, string>,
    numCases: number,
  ): Promise<string[]> {
    const promptInputsStr = Object.entries(promptInputsSpec)
      .map(([key, value]) => `"${key}": str # ${value.replaceAll("\n", "\\n")}`)
      .join(",");

    const prompt = render(
      `Generate {numCases} unique, diverse ideas for testing a prompt that accomplishes this task:

<task_description>
{taskDescription}
</task_description>

The prompt will receive the following inputs:
<prompt_inputs>
{promptInputsStr}
</prompt_inputs>

Each idea should represent a distinct scenario that tests different aspects of the task.
Ensure each idea is distinct, relevant, specific, and solvable in under 400 tokens.
Remember: only generate {numCases} unique ideas.`,
      { numCases, taskDescription, promptInputsStr },
    );

    const messages: Message[] = [];
    add_user_message(messages, prompt);
    const result = await chatStructured(
      messages,
      { ideas: { type: "array", items: { type: "string" } } },
      1.0,
    );
    return (result?.ideas as string[]) ?? [];
  }

  // Generates a single detailed test case from a scenario idea.
  async generateTestCase(
    taskDescription: string,
    idea: string,
    promptInputsSpec: Record<string, string> = {},
  ): Promise<GenericTestCase> {
    const examplePromptInputs = Object.entries(promptInputsSpec)
      .map(([key, value]) => `"${key}": "EXAMPLE_VALUE", // ${value.replaceAll("\n", "\\n")}`)
      .join("\n");
    const allowedKeys = Object.keys(promptInputsSpec).map((k) => `"${k}"`).join(", ");

    const prompt = render(
      `Generate a single detailed test case based on:

<task_description>
{taskDescription}
</task_description>

<specific_idea>
{idea}
</specific_idea>

<allowed_input_keys>
{allowedKeys}
</allowed_input_keys>

Example prompt_inputs shape (use realistic values, not placeholders):
{examplePromptInputs}

IMPORTANT: Only use the exact input keys listed in allowed_input_keys. Include 1-4 concise, measurable criteria.`,
      { taskDescription, idea, allowedKeys, examplePromptInputs },
    );

    const messages: Message[] = [];
    add_user_message(messages, prompt);
    const inputProperties = Object.fromEntries(
      Object.keys(promptInputsSpec).map((k) => [k, { type: "string" as const }]),
    );
    const result = await chatStructured(
      messages,
      {
        prompt_inputs: {
          type: "object",
          properties: inputProperties,
          required: Object.keys(promptInputsSpec),
          additionalProperties: false,
        },
        solution_criteria: { type: "array", items: { type: "string" } },
      },
      0.7,
    );
    const testCase = (result as unknown) as GenericTestCase;
    testCase.task_description = taskDescription;
    testCase.scenario = idea;
    return testCase;
  }

  // Orchestrates the full pipeline: generate ideas → generate test cases → write file.
  async generateDataset(
    taskDescription: string,
    promptInputsSpec: Record<string, string> = {},
    outputFile = "output/dataset.json",
    numCases = 3,
  ): Promise<GenericTestCase[]> {
    const limit = pLimit(this.concurrency);
    const ideas = await this.generateUniqueIdeas(taskDescription, promptInputsSpec, numCases);
    const dataset = await Promise.all(
      ideas.map((idea) => limit(() => this.generateTestCase(taskDescription, idea, promptInputsSpec))),
    );
    writeOutput(outputFile, dataset);
    return dataset;
  }
}

export type GenericTestCase = {
  scenario: string;
  task_description: string;
  prompt_inputs: Record<string, string>;
  solution_criteria: string[];
};
