import { Message, add_user_message, add_assistant_message, chatText } from "./shared/shared.js";

// Start with an empty message list
let messages: Message[] = [];

// Add the initial user question
add_user_message(messages, "Define quantum computing in one sentence");
console.log(messages);

// # Get Claude's response
const answer = await chatText(messages);
console.log(answer);

// # Add Claude's response to the conversation history
add_assistant_message(messages, answer);

// Add a follow-up question
add_user_message(messages, "Write another sentence");
console.log(messages);

// Get the follow-up response with full context
const final_answer = await chatText(messages);
console.log(final_answer);
