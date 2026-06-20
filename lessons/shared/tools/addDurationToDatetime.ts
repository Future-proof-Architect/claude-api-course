import Anthropic from "@anthropic-ai/sdk";
type Tool = Anthropic.Tool;

type DurationUnit =
  | "seconds"
  | "minutes"
  | "hours"
  | "days"
  | "weeks"
  | "months"
  | "years";

export function addDurationToDatetime(
  datetimeStr: string,
  duration: number = 0,
  unit: DurationUnit = "days"
): string {
  const date = new Date(datetimeStr);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid datetime string: ${datetimeStr}`);
  }

  const newDate = new Date(date);

  switch (unit) {
    case "seconds":
      newDate.setSeconds(newDate.getSeconds() + duration);
      break;
    case "minutes":
      newDate.setMinutes(newDate.getMinutes() + duration);
      break;
    case "hours":
      newDate.setHours(newDate.getHours() + duration);
      break;
    case "days":
      newDate.setDate(newDate.getDate() + duration);
      break;
    case "weeks":
      newDate.setDate(newDate.getDate() + duration * 7);
      break;
    case "months": {
      // Clamp the day to the last valid day of the target month so that adding
      // months never rolls over into the following month (e.g. Jan 31 + 1 month).
      const targetMonth = newDate.getMonth() + duration;
      const targetYear = newDate.getFullYear() + Math.floor(targetMonth / 12);
      const normalizedMonth = ((targetMonth % 12) + 12) % 12;
      const lastDayOfMonth = new Date(targetYear, normalizedMonth + 1, 0).getDate();
      newDate.setFullYear(targetYear, normalizedMonth, Math.min(newDate.getDate(), lastDayOfMonth));
      break;
    }
    case "years":
      newDate.setFullYear(newDate.getFullYear() + duration);
      break;
    default:
      throw new Error(`Unsupported time unit: ${unit}`);
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "medium",
  }).format(newDate);
}

// Prompt for tool schema:
/*
Write a valid JSON schema spec for the purposes of tool calling for this function.


```typescript
<paste typescript code here>
```

Follow the best practices listed in the documentation here: https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools.md
*/
export const addDurationToDatetimeSchema: Tool = {
  "name": "add_duration_to_datetime",
  "description": "Adds a specified duration to a datetime string and returns the resulting datetime in a detailed, human-readable format. This tool parses an input datetime string into a Date object, adds the specified duration in the requested unit, and returns a formatted string of the resulting datetime. It handles various time units including seconds, minutes, hours, days, weeks, months, and years, with special handling for month calculations to account for varying month lengths (e.g. adding one month to January 31 yields the last day of February rather than rolling into March). The output is always returned in a detailed format that includes the day of the week, month name, day, year, and time (e.g., 'Thursday, April 3, 2025 at 10:30:00 AM').",
  "input_schema": {
    "type": "object",
    "properties": {
      "datetimeStr": {
        "type": "string",
        "description": "The input datetime string to which the duration will be added. Should be a value parseable by the JavaScript Date constructor, such as an ISO 8601 string like '2050-01-01' or '2050-01-01T09:30:00'."
      },
      "duration": {
        "type": "number",
        "description": "The amount of time to add to the datetime. Can be positive (for future dates) or negative (for past dates). Defaults to 0 if not provided."
      },
      "unit": {
        "type": "string",
        "enum": ["seconds", "minutes", "hours", "days", "weeks", "months", "years"],
        "description": "The unit of time for the duration. Must be one of: 'seconds', 'minutes', 'hours', 'days', 'weeks', 'months', or 'years'. Defaults to 'days' if not provided."
      }
    },
    "required": ["datetimeStr"]
  },
  "input_examples": [
    {
      "datetimeStr": "2050-01-01",
      "duration": 177,
      "unit": "days"
    },
    {
      "datetimeStr": "2025-04-03T10:30:00",
      "duration": 2,
      "unit": "hours"
    },
    {
      "datetimeStr": "2025-01-31",
      "duration": 1,
      "unit": "months"
    }
  ]
};
