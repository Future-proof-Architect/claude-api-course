import { readFileSync } from "fs";
import { Task } from "./shared/shared.js";
import { run_eval, run_prompt, grade_syntax } from "./shared/prompt-evaluation.js";
import { PromptEvaluator } from "./shared/PromptEvaluator.js";
import { ModelGrader, CompositeGrader } from "./shared/graders.js";

const dataset = JSON.parse(readFileSync("output/05-dataset.json", "utf-8")) as Task[];

// Initial approach:
const results = await run_eval(dataset);

/*
Alternative using PromptEvaluator class:
- same prompt function and grading logic as run_eval above (model grade
  averaged with syntax score), but PromptEvaluator runs all test cases
  concurrently via Promise.all (with 3 test cases it runs faster than half time of the sequential approach).
- the grader is composed: ModelGrader does the model evaluation, and
  CompositeGrader averages its score with grade_syntax.
*/
// const evaluator = new PromptEvaluator();
// const grader = new CompositeGrader(new ModelGrader(), grade_syntax);
// const results = await evaluator.evalDataset(dataset, run_prompt, grader);

// Output results
console.log(results);
console.log("Average score:", results.reduce((sum, r) => sum + r.score, 0) / results.length);
