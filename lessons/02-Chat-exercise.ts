import * as readline from "readline";
import type { MessageParam } from "./shared/shared-types.js";
import { add_user_message, add_assistant_message, chatText } from "./shared/shared.js";

function prompt(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
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
  const answer = await chatText(messages, { system });
  add_assistant_message(messages, answer);
  console.log("Claude: ", answer);
}

rl.close();
