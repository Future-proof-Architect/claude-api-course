import * as readline from "readline";
import { client, MODEL, MAX_TOKENS } from "./shared/settings.js";
import type { MessageParam } from "./shared/shared-types.js";
import { add_user_message, add_assistant_message } from "./shared/shared.js";

function prompt(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function chat(messages: MessageParam[], system: string | undefined = undefined, temperature = 0.0): Promise<string> {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages,
    system,
    temperature,
  });

  const block = message.content[0];
  if (block.type !== "text") {
    throw new Error("Expected text content");
  }

  const answer = block.text;
  add_assistant_message(messages, answer);
  return answer;
}

let messages: MessageParam[] = [];
const system = undefined; // "Guide me to the right answer like you're a mama bear.";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

while (true) {
  const input = await prompt("> ");
  if (input === "") break;

  add_user_message(messages, input);
  const answer = await chat(messages, system);
  console.log("Claude: ", answer);
}

rl.close();
