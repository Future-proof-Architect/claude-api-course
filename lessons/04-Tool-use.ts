import { client, MODEL, MAX_TOKENS } from "./shared/settings.js";
import type { MessageParam } from "./shared/shared-types.js";
import { add_user_message } from "./shared/shared.js";

async function chat(messages: MessageParam[]): Promise<string> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages,
    tools: [
      {
        name: "output_commands",
        description: "Output the generated AWS CLI commands",
        input_schema: {
          type: "object" as const,
          properties: {
            commands: {
              type: "array",
              items: { type: "string" },
              minItems: 3,
              maxItems: 3,
            },
          },
          required: ["commands"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "output_commands" },
  });

  // console.log(response);

  let text = "";
  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (toolUse?.type === "tool_use") {
    const { commands } = toolUse.input as { commands: string[] };
    commands.forEach((cmd) => text += cmd + "\n");
  }

  return text;
}

// Start with an empty message list
let messages: MessageParam[] = [];

// Add the initial user question
add_user_message(
  messages,
  "Generate three different sample AWS CLI commands. Each should be very short.",
);


// # Get Claude's response
const answer = await chat(messages);
console.log(answer.trim());
