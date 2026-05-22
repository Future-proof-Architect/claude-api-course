import { DatasetGenerator } from "./DatasetGenerator.js";
import { PromptEvaluator } from "./PromptEvaluator.js";
import type { Grader } from "./graders.js";

export async function generateDataset(
  description: string,
  specs: Record<string, string>,
  outputFileName: string,
) {
  const generator = new DatasetGenerator();
  const dataset = await generator.generateDataset(
    description,
    specs,
    `output/${outputFileName}.json`,
    3,
  );

  console.log(dataset);
}

export async function runEval(
  runPromptFn: (inputs: Record<string, string>) => Promise<string>,
  grader: Grader<import("./DatasetGenerator.js").GenericTestCase>,
  datasetFile: string,
  outputFileName: string,
) {
  const evaluator = new PromptEvaluator({ concurrency: 1 });
  const results = await evaluator.evalFileAndReport(
    runPromptFn,
    datasetFile,
    grader,
    { jsonOutputFile: `output/${outputFileName}.json`, htmlOutputFile: `output/${outputFileName}.html` },
  );
  console.log(results);
}
