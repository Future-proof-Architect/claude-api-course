import type { MessageParam } from "./shared/shared-types.js";
import { add_user_message, chatStructured } from "./shared/shared.js";

// Start with an empty message list
let messages: MessageParam[] = [];

// Add the initial user question
add_user_message(
  messages,
  "Generate three different sample AWS CLI commands. Each should be very short.",
);

// # Get Claude's response
const result = await chatStructured(
  messages,
  {
    commands: {
      type: "array",
      items: { type: "string" },
      minItems: 3,
      maxItems: 3,
    },
  },
  1.0,
);

// console.log(result);
const answer = ((result?.commands as string[]) ?? []).join("\n");
console.log(answer.trim());
