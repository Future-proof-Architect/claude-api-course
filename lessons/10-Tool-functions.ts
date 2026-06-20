import Anthropic from "@anthropic-ai/sdk";
import { getCurrentDatetime, getCurrentDatetimeSchema } from "./shared/tools/getCurrentDatetime";
import { add_assistant_message, add_user_message, chat, text_from_message } from "./shared/shared";
import type { Message, MessageParam } from "./shared/shared-types";
import { addDurationToDatetime, addDurationToDatetimeSchema } from "./shared/tools/addDurationToDatetime";
import { setReminder, setReminderSchema } from "./shared/tools/setReminder";

type ToolUseBlock = Anthropic.ToolUseBlock;
type ToolResultBlockParam = Anthropic.ToolResultBlockParam;

function run_tool(tool_name: string, tool_input: any): unknown {
  const input = tool_input ?? {};

  switch (tool_name) {
    case "get_current_datetime": {
      const { style, locale } = input;
      return getCurrentDatetime(style, locale);
    }
    case "add_duration_to_datetime": {
      const { datetimeStr, duration, unit } = input;
      return addDurationToDatetime(datetimeStr, duration, unit);
    }
    case "set_reminder": {
      const { content, timestamp } = input;
      return setReminder(content, timestamp);
    }
    default:
      throw new Error(`Unknown tool: ${tool_name}`);
  }
}

function run_tools(message: Message): ToolResultBlockParam[] {
  const tool_requests = message.content.filter(
    (block): block is ToolUseBlock => block.type === "tool_use"
  );

  const tool_result_blocks: ToolResultBlockParam[] = [];

  for (const tool_request of tool_requests) {
    let content: string;
    let is_error: boolean;

    try {
      const tool_output = run_tool(tool_request.name, tool_request.input);
      content = JSON.stringify(tool_output);
      is_error = false;
    } catch (e) {
      content = `Error: ${e instanceof Error ? e.message : String(e)}`;
      is_error = true;
    }

    tool_result_blocks.push({
      type: "tool_result",
      tool_use_id: tool_request.id,
      content,
      is_error,
    });
  }

  return tool_result_blocks;
}

export async function run_conversation(messages: MessageParam[]): Promise<MessageParam[]> {
  while (true) {
    const response = await chat(messages, { tools: [getCurrentDatetimeSchema, addDurationToDatetimeSchema, setReminderSchema] });

    add_assistant_message(messages, response.content);
    console.log(text_from_message(response));

    if (response.stop_reason !== "tool_use") {
      break;
    }

    const tool_results = run_tools(response);
    add_user_message(messages, tool_results);
  }

  return messages;
}


let messages: MessageParam[] = [];
add_user_message(messages, "What is the current time (retrieve time only)? What is the date today (use full date-time format)? Add 177 days to that date and set a reminder for my doctor's appointment.");
await run_conversation(messages)

console.log(JSON.stringify(messages, null, 2));
