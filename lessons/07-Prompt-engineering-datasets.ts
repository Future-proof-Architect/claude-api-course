import { generateDataset } from "./shared/prompt-engineering";

generateDataset(
  "Write a compact, concise 1 day meal plan for a single athlete",
  {
    height: "Athlete's height in cm",
    weight: "Athlete's weight in kg",
    goal: "Goal of the athlete",
    restrictions: "Dietary restrictions of the athlete",
  },
  "07-dataset",
);
