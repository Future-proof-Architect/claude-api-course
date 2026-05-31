import { client } from "./shared/settings.js";
import type { MessageParam } from "./shared/shared-types.js";
import { add_user_message, add_assistant_message } from "./shared/shared.js";

const model = "claude-sonnet-4-0";

async function chat(messages: MessageParam[], stop_sequences: string[] = []) {
  const message = await client.messages.create({
    model,
    max_tokens: 100,
    messages,
    stop_sequences
  });

  // console.log(message);
  const block = message.content[0];
  if (block.type !== "text") {
    throw new Error("Expected text content");
  }

  // console.log(block.text); // fully typed, no error
  return block.text;
}

// Start with an empty message list
let messages: MessageParam[] = [];

// Add the initial user question
add_user_message(messages, "Generate three different sample AWS CLI commands. Each should be very short.");
add_assistant_message(messages, "Here are all three commands in a single block without any comments:\n```bash");

// # Get Claude's response
const answer = await chat(messages, ["```"]);
console.log(answer.trim());
