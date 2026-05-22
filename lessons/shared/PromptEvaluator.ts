import { readFileSync } from "fs";
import pLimit from "p-limit";
import { writeOutput } from "./shared.js";
import type { Grader } from "./graders.js";
import type { GenericTestCase } from "./DatasetGenerator.js";
import { generateReport } from "./report.js";

// PromptEvaluator orchestrates run → grade → collect over a dataset.
// All grading strategy is delegated to an injected Grader (see graders.ts),
// so the class itself has no opinion on HOW to grade — only on the pipeline.
//
// - evalDataset: generic over T, runs concurrently across the dataset via Promise.all.
//                Returns results in memory. This is what lesson 06's alternative uses.
// - evalFileAndReport: thin wrapper around evalDataset that adds dataset-file reading
//                and JSON + HTML report writing. Used from lesson 07+.

export class PromptEvaluator {
  private concurrency: number;

  constructor({ concurrency = 3 }: { concurrency?: number } = {}) {
    this.concurrency = concurrency;
  }

  // Runs the prompt + grader against every test case concurrently.
  async evalDataset<T>(
    dataset: T[],
    runPromptFn: (tc: T) => Promise<string>,
    grader: Grader<T>,
  ) {
    const limit = pLimit(this.concurrency);
    return Promise.all(
      dataset.map((testCase, i) =>
        limit(async () => {
          console.log(`Evaluating test case ${i + 1}/${dataset.length}...`);
          const output = await runPromptFn(testCase);
          const { score, reasoning } = await grader.grade(testCase, output);
          return { output, test_case: testCase, score, reasoning };
        }),
      ),
    );
  }

  // File-I/O wrapper: reads dataset file → evalDataset → writes JSON + HTML report.
  async evalFileAndReport(
    runPromptFn: (inputs: Record<string, string>) => Promise<string>,
    datasetFile: string,
    grader: Grader<GenericTestCase>,
    options: {
      jsonOutputFile?: string;
      htmlOutputFile?: string;
    } = {},
  ) {
    const { jsonOutputFile = "output/output.json", htmlOutputFile = "output/output.html" } = options;
    const dataset = JSON.parse(readFileSync(datasetFile, "utf-8")) as GenericTestCase[];

    const results = await this.evalDataset(
      dataset,
      (tc) => runPromptFn(tc.prompt_inputs),
      grader,
    );

    const avg = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    console.log(`Average score: ${avg.toFixed(1)}`);

    writeOutput(jsonOutputFile, results);
    writeOutput(htmlOutputFile, generateReport(results));

    return results;
  }
}
