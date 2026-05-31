import { client, MODEL, MAX_TOKENS } from "./shared/settings.js";
import type { MessageParam } from "./shared/shared-types.js";
import { add_user_message } from "./shared/shared.js";

let messages: MessageParam[] = [];
add_user_message(messages, "Write a 1 sentence description of a fake database");

/*
// Manual stream events handling
const stream = await client.messages.create({
  model: MODEL,
  max_tokens: MAX_TOKENS,
  messages,
  stream: true,
});

for await (const event of stream) {
  switch (event.type) {
    case "content_block_delta":
      const delta = event.delta;
      process.stdout.write(delta.type === "text_delta" ? delta.text : "[non-text content]");
      break;
    case "message_stop":
      console.log("\nDone.");
      break;
  }
}
*/

// Using the textStream helper for easier text streaming
const stream = client.messages.stream({
  model: MODEL,
  max_tokens: MAX_TOKENS,
  messages,
});

stream.on("text", (text) => {
  process.stdout.write(text);
});

const finalText = await stream.finalText();

// it has to come after await finalText() since stream.on() is async
console.log("\nDone.");

console.log(finalText);
