import { StrictModelGrader } from "./shared/graders";
import type { MessageParam } from "./shared/shared-types.js";
import { add_user_message, chatText } from "./shared/shared";
import { runEval } from "./shared/prompt-engineering";

async function run_prompt(inputs: Record<string, string>): Promise<string> {
  // As you progress through the course 
  // you update instructions, add guidelines,
  // and add XML tags like <athlete_information> or <guidelines>.
  const instructions =
    // initial instructions, pretty poor:
    "What should this person eat?";
    // Clear and direct instructions:
    // "Generate a one-day meal plan for an athlete that meets their dietary restrictions.";

    const guidelines =
    "";
    // `<guidelines>
    // Guidelines:
    // 1. Include accurate daily calorie amount
    // 2. Show protein, fat, and carb amounts
    // 3. Specify when to eat each meal
    // 4. Use only foods that fit restrictions
    // 5. List all portion sizes in grams
    // 6. Keep budget-friendly if mentioned
    // </guidelines>`;

    const prompt = `${instructions}

- Height: ${inputs["height"]}
- Weight: ${inputs["weight"]}
- Goal: ${inputs["goal"]}
- Dietary restrictions: ${inputs["restrictions"]}

${guidelines}

Avoid using markdown, provide the output in plain text instead.`;

  const messages: MessageParam[] = [];
  add_user_message(messages, prompt);
  return chatText(messages);
}

const grader = new StrictModelGrader(`
The output should include:
- Daily caloric total
- Macronutrient breakdown
- Meals with exact foods, portions, and timing
`);

runEval(run_prompt, grader, "output/07-dataset.json", "08-output");
