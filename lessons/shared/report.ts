import type { GenericTestCase } from "./DatasetGenerator.js";

export type ReportResult = {
  output: string;
  test_case: GenericTestCase;
  score: number;
  reasoning: string;
};

export function generateReport(results: ReportResult[]): string {
  const total = results.length;
  const avg = results.reduce((sum, r) => sum + r.score, 0) / total;
  const passRate = (100 * results.filter((r) => r.score >= 7).length) / total;

  const rows = results
    .map((r) => {
      const promptInputsHtml = Object.entries(r.test_case.prompt_inputs)
        .map(([k, v]) => `<strong>${k}:</strong> ${v}`)
        .join("<br>");
      const criteriaHtml = "• " + r.test_case.solution_criteria.join("<br>• ");
      const scoreClass = r.score >= 8 ? "high" : r.score <= 5 ? "low" : "medium";
      return `
      <tr>
        <td>${r.test_case.scenario}</td>
        <td>${promptInputsHtml}</td>
        <td>${criteriaHtml}</td>
        <td><pre>${r.output}</pre></td>
        <td><span class="score ${scoreClass}">${r.score}</span></td>
        <td>${r.reasoning}</td>
      </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Prompt Evaluation Report</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
    .header { background: #f0f0f0; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
    .stats { display: flex; gap: 10px; flex-wrap: wrap; }
    .stat { background: #fff; border-radius: 5px; padding: 15px; box-shadow: 0 2px 5px rgba(0,0,0,.1); min-width: 180px; }
    .stat-value { font-size: 24px; font-weight: bold; margin-top: 5px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #4a4a4a; color: #fff; text-align: left; padding: 12px; }
    td { padding: 10px; border-bottom: 1px solid #ddd; vertical-align: top; }
    tr:nth-child(even) { background: #f9f9f9; }
    pre { background: #f5f5f5; border: 1px solid #ddd; border-radius: 4px; padding: 10px; white-space: pre-wrap; word-wrap: break-word; }
    .score { font-weight: bold; padding: 5px 10px; border-radius: 3px; display: inline-block; }
    .score.high { background: #c8e6c9; color: #2e7d32; }
    .score.medium { background: #fff9c4; color: #f57f17; }
    .score.low { background: #ffcdd2; color: #c62828; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Prompt Evaluation Report</h1>
    <div class="stats">
      <div class="stat"><div>Total Test Cases</div><div class="stat-value">${total}</div></div>
      <div class="stat"><div>Average Score</div><div class="stat-value">${avg.toFixed(1)} / 10</div></div>
      <div class="stat"><div>Pass Rate (≥7)</div><div class="stat-value">${passRate.toFixed(1)}%</div></div>
    </div>
  </div>
  <table>
    <thead>
      <tr><th>Scenario</th><th>Prompt Inputs</th><th>Solution Criteria</th><th>Output</th><th>Score</th><th>Reasoning</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;
}
