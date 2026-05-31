import type { FromSchema } from "json-schema-to-ts";
import type Anthropic from "@anthropic-ai/sdk";

export type MessageParam = Anthropic.MessageParam;
export type Message = Anthropic.Message;
export type Tool = Anthropic.Tool;

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
