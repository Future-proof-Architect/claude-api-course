// // Step 1: generate dataset (run first, then switch to Step 2)
// import { generateDataset } from "./shared/prompt-engineering";
// generateDataset(
//   "Extract topics out of a passage of text from a scholarly article into a JSON array of strings",
//   {
//     "content": "One paragraph of text from a scholarly journal written in English"
//   },
//   "09-dataset",
// );

// Step 2: evaluate
import { StrictModelGrader } from "./shared/graders";
import { add_user_message, chatText, Message } from "./shared/shared";
import { runEval } from "./shared/prompt-engineering";

async function run_prompt(inputs: Record<string, string>): Promise<string> {
  // This is the prompt you want to improve.
  const prompt = `
    What topics are in here?

    ${inputs["content"]}
    `;

    // Add incremental improvements discussed in the course towards something like this:
    /*
      Extract key topics mentioned from a passage of text from a scholarly journal into a JSON array of strings.
      
      <text>
      ${inputs["content"]}
      </text>
      
      Follow these steps:
      1. Closely examine the provided text
      2. Identify each topic mentioned
      3. Add each topic to a JSON array
      4. Respond with the JSON array. 
    */
    // Keep in mind that "Nothing but JSON" instruction from the official course 
    // has been removed as it may penalise evaluations for having markdown around JSON

  const messages: Message[] = [];
  add_user_message(messages, prompt);
  return chatText(messages);
}

const grader = new StrictModelGrader(`
- Contains a JSON array of strings, containing each topic mentioned in the article.
- The strings should contain only a topic without any extra commentary
- Response should contain the JSON array and nothing else
`);

runEval(run_prompt, grader, "output/09-dataset.json", "09-output");
