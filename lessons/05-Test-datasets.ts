import { Message, Task, taskSchema, add_user_message, chatStructured, writeOutput } from "./shared/shared.js";

const prompt = `Generate an evaluation dataset for a prompt evaluation. The dataset will be used to evaluate prompts that generate Python, JSON, or Regex specifically for AWS-related tasks.

* Focus on tasks that can be solved by writing a single Python function, a single JSON object, or a single regex
* Focus on tasks that do not require writing much code
* with each task, include a "solution_criteria" attribute describing a key criteria for evaluating the solution.
Please generate 3 objects.`;

// Initial approach:
let messages: Message[] = [];
add_user_message(messages, prompt);

const result = await chatStructured(messages, {
  tasks: {
    type: "array",
    items: taskSchema,
    minItems: 3,
    maxItems: 3,
  },
});
// console.log(result);
const dataset = (result?.tasks as Task[]) ?? [];


console.log(dataset);
writeOutput("output/05-dataset.json", dataset);
