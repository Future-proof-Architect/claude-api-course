import { writeFileSync, mkdirSync } from "fs";
import { dirname } from "path";
import { client, MODEL, MAX_TOKENS } from "./settings.js";
import { jsonSchemaOutputFormat } from "@anthropic-ai/sdk/helpers/json-schema";
import type { FromSchema, JSONSchema } from "json-schema-to-ts";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export const taskSchema = {
  type: "object",
  properties: {
    task: { type: "string" },
    format: { type: "string", enum: ["python", "json", "regex"] },
    solution_criteria: { type: "string" },
  },
  required: ["task", "format", "solution_criteria"],
  additionalProperties: false,
} as const;

export type Task = FromSchema<typeof taskSchema>;

// The grading shape used by all model-based evals across lessons 06+.
// Course quiz answer: a good eval prompt asks for strengths/weaknesses/reasoning,
// not just a bare score — so we lock this shape in shared and reuse it everywhere.
export const evalResultSchema = {
  type: "object",
  properties: {
    strengths: { type: "array", items: { type: "string" } },
    weaknesses: { type: "array", items: { type: "string" } },
    reasoning: { type: "string" },
    score: { type: "number" },
  },
  required: ["strengths", "weaknesses", "reasoning", "score"],
} as const;

export type EvalResult = FromSchema<typeof evalResultSchema>;

export function add_user_message(messages: Message[], text: string) {
  messages.push({ role: "user", content: text });
}

export function add_assistant_message(messages: Message[], text: string) {
  messages.push({ role: "assistant", content: text });
}

export async function chatText(messages: Message[]): Promise<string> {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages,
  });

  const block = message.content[0];
  if (block.type !== "text") {
    throw new Error("Expected text content");
  }

  return block.text;
}

export async function chatStructured(
  messages: Message[],
  properties: Record<string, JSONSchema>,
  temperature = 1.0
): Promise<Record<string, unknown> | undefined> {
  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages,
    temperature,
    output_config: {
      format: jsonSchemaOutputFormat({
        type: "object",
        properties,
        required: Object.keys(properties),
        additionalProperties: false,
      }),
    },
  });

  return response.parsed_output as Record<string, unknown> | undefined;
}

export function writeOutput(filePath: string, data: string | unknown): void {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, typeof data === "string" ? data : JSON.stringify(data, null, 2), "utf-8");
}

export function render(template: string, variables: Record<string, string | number>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replaceAll(`{${key}}`, String(value));
  }
  return result.replaceAll("{{", "{").replaceAll("}}", "}");
}
