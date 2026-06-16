import * as readline from "readline";
import type { ChatOptions, MessageParam } from "./shared/shared-types.js";
import { add_user_message, add_assistant_message, chatText } from "./shared/shared.js";

function prompt(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

let messages: MessageParam[] = [];
const options: ChatOptions =  { 
  // system: "Guide me to the right answer like you're a mama bear.",
  // temperature: 1.0 
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

while (true) {
  const input = await prompt("> ");
  if (input === "") break;

  // Uncomment the next line to reset the conversation history on each input for temperature testing
  // messages = []; 

  add_user_message(messages, input);
  const answer = await chatText(messages, options);
  add_assistant_message(messages, answer);
  console.log("Claude: ", answer);
}

rl.close();
