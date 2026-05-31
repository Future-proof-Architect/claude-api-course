import type { MessageParam, Task, EvalResult } from "./shared-types.js";
import { evalResultSchema } from "./shared-types.js";
import { add_user_message, chatStructured, render } from "./shared.js";
import { grade_by_model } from "./prompt-evaluation.js";
import type { GenericTestCase } from "./DatasetGenerator.js";

// A Grader decides HOW a (testCase, output) pair becomes an EvalResult.
// PromptEvaluator orchestrates run → grade → collect, but delegates the
// grading strategy to whichever Grader is passed in. Each lesson can
// instantiate the variant it needs.
export interface Grader<T> {
  grade(testCase: T, output: string): Promise<EvalResult>;
}

// ================================================================
// ModelGrader — Lesson 06 equivalent
// Delegates to grade_by_model in prompt-evaluation.ts — single source
// of truth for the lesson-06 grading prompt.
// ================================================================

export class ModelGrader implements Grader<Task> {
  async grade(testCase: Task, output: string): Promise<EvalResult> {
    return grade_by_model(testCase, output);
  }
}

// ================================================================
// CompositeGrader — wraps another grader and a syntax-check function,
// returns their score average. Used by lesson 06 to combine model
// grading with format-specific syntax validation.
// ================================================================

export class CompositeGrader<T> implements Grader<T> {
  constructor(
    private modelGrader: Grader<T>,
    private syntaxScoreFn: (output: string, testCase: T) => Promise<number>,
  ) {}

  async grade(testCase: T, output: string): Promise<EvalResult> {
    const modelGrade = await this.modelGrader.grade(testCase, output);
    const syntaxScore = await this.syntaxScoreFn(output, testCase);
    const score = (modelGrade.score + syntaxScore) / 2;
    return { ...modelGrade, score };
  }
}

// ================================================================
// StrictModelGrader — Lesson 07+ equivalent
// The "improved" eval prompt with mandatory criteria and detailed
// scoring guidelines. Operates on GenericTestCase (prompt_inputs dict
// + array criteria).
// ================================================================

export class StrictModelGrader implements Grader<GenericTestCase> {
  constructor(private extraCriteria?: string) {}

  async grade(testCase: GenericTestCase, output: string): Promise<EvalResult> {
    const promptInputs = Object.entries(testCase.prompt_inputs)
      .map(([k, v]) => `"${k}":"${v.replaceAll("\n", "\\n")}"`)
      .join(",\n");

    const extraCriteriaSection = this.extraCriteria
      ? render(
          `Mandatory Requirements - ANY VIOLATION MEANS AUTOMATIC FAILURE (score of 3 or lower):
<extra_important_criteria>
{extraCriteria}
</extra_important_criteria>`,
          { extraCriteria: this.extraCriteria },
        )
      : "";

    const evalPrompt = render(
      `Your task is to evaluate the following AI-generated solution with EXTREME RIGOR.

Original task description:
<task_description>
{taskDescription}
</task_description>

Original task inputs:
<task_inputs>
{{ {promptInputs} }}
</task_inputs>

Solution to Evaluate:
<solution>
{output}
</solution>

Criteria you should use to evaluate the solution:
<criteria>
{solutionCriteria}
</criteria>

{extraCriteriaSection}

Scoring Guidelines:
* Score 1-3: Solution fails to meet one or more MANDATORY requirements
* Score 4-6: Meets mandatory requirements but has significant deficiencies
* Score 7-8: Meets mandatory requirements and most secondary criteria
* Score 9-10: Meets all mandatory and secondary criteria

IMPORTANT: Grade ONLY on the listed criteria. ANY violation of a mandatory requirement MUST result in a score of 3 or lower.
`,
      {
        taskDescription: testCase.task_description,
        promptInputs,
        output,
        solutionCriteria: testCase.solution_criteria.join("\n"),
        extraCriteriaSection,
      },
    );

    const messages: MessageParam[] = [];
    add_user_message(messages, evalPrompt);
    const result = await chatStructured(
      messages,
      { evals: evalResultSchema },
      0.0,
    );
    return result?.evals as EvalResult;
  }
}
