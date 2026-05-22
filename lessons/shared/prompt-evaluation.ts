import {
  add_user_message,
  chatStructured,
  chatText,
  Message,
  Task,
  evalResultSchema,
  EvalResult,
} from "./shared.js";

export async function grade_by_model(
  test_case: Task,
  output: string,
): Promise<EvalResult> {
  // Create evaluation prompt
  const eval_prompt = `
    You are an expert code reviewer. Evaluate this AI-generated solution.
    
    Original Task: 
    <task>
    ${test_case.task}
    </task>

    Solution to evaluate: 
    <solution>
    ${output}
    </solution>
    
    Criteria you should use to evaluate the solution:
    <criteria>
    ${test_case.solution_criteria}
    </criteria>

    Provide your evaluation as a structured JSON object with:
    - "strengths": An array of 1-3 key strengths
    - "weaknesses": An array of 1-3 key areas for improvement  
    - "reasoning": A concise explanation of your assessment
    - "score": A number between 1-10
    `;

  const messages: Message[] = [];
  add_user_message(messages, eval_prompt);
  const result = await chatStructured(messages, { evals: evalResultSchema });

  return result?.evals as EvalResult;
}

function validate_json(text: string): number {
  try {
    JSON.parse(text.trim());
    return 10;
  } catch {
    return 0;
  }
}

function validate_regex(text: string): number {
  try {
    new RegExp(text.trim());
    return 10;
  } catch {
    return 0;
  }
}

export async function grade_syntax(output: string, test_case: Task): Promise<number> {
  switch (test_case.format) {
    case "json":
      return validate_json(output);
    case "regex":
      return validate_regex(output);
    case "python":
      // TODO: call out to a Python subprocess, or use a third-party parser like @tree-sitter/python.
      return 10;
  }
}

export async function run_prompt(test_case: Task): Promise<string> {
  const prompt = `Please solve the following task: ${test_case.task}
  Provide only the code as your answer, without any explanations.`;

  const messages: Message[] = [];
  add_user_message(messages, prompt);
  const response = await chatStructured(messages, {
    solution: { type: "string" },
  });
  return (response?.solution as string) ?? "";
}

export async function run_test_case(test_case: Task) {
  const output = await run_prompt(test_case);

  // TODO - Grading
  // const score = 10;
  // const reasoning ="";

  // Grading by model
  const model_grade = await grade_by_model(test_case, output);
  const model_score = model_grade.score;
  const reasoning = model_grade.reasoning;

  const syntax_score = await grade_syntax(output, test_case);
  const score = (model_score + syntax_score) / 2; // score average

  return { output, test_case, score, reasoning };
}

export async function run_eval(dataset: Task[]) {
  const results = [];
  for (const test_case of dataset) {
    results.push(await run_test_case(test_case));
  }

  return results;
}
