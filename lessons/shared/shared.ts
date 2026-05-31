import { writeFileSync, mkdirSync } from "fs";
import { dirname } from "path";
import { client, MODEL, MAX_TOKENS } from "./settings.js";
import { jsonSchemaOutputFormat } from "@anthropic-ai/sdk/helpers/json-schema";
import type { JSONSchema } from "json-schema-to-ts";
import type { Message, MessageParam, Tool } from "./shared-types.js";

type MessageInput = string | Message;

function toContent(input: MessageInput): MessageParam["content"] {
  return typeof input === "string" ? input : input.content;
}

function text_from_message(message: Message): string {
  return message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}

export function add_user_message(messages: MessageParam[], input: MessageInput) {
  messages.push({ role: "user", content: toContent(input) });
}

export function add_assistant_message(messages: MessageParam[], input: MessageInput) {
  messages.push({ role: "assistant", content: toContent(input) });
}

export async function chat(messages: MessageParam[], tools?: Tool[]): Promise<Message> {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages,
    tools,
  });

  return message;
}

export async function chatText(messages: MessageParam[], tools?: Tool[]): Promise<string> {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages,
    tools,
  });

  return text_from_message(message);
}

export async function chatStructured(
  messages: MessageParam[],
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
