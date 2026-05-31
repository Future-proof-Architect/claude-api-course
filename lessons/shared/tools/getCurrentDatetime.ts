import Anthropic from "@anthropic-ai/sdk";
type Tool = Anthropic.Tool;

const DATE_STYLE_VALUES = ["full", "long", "medium", "short"] as const;
const TIME_STYLE_VALUES = ["full", "long", "medium", "short"] as const;

type DateStyle = (typeof DATE_STYLE_VALUES)[number];
type TimeStyle = (typeof TIME_STYLE_VALUES)[number];

interface DateTimeFormatOptions {
  dateStyle?: DateStyle;
  timeStyle?: TimeStyle;
}

export function getCurrentDatetime(
  options: DateTimeFormatOptions = { dateStyle: "short", timeStyle: "medium" },
  locale: string = "en-US"
): string {
  if (!options.dateStyle && !options.timeStyle) {
    throw new Error("Provide at least one of dateStyle or timeStyle.");
  }
  if (options.dateStyle && !DATE_STYLE_VALUES.includes(options.dateStyle)) {
    throw new Error(`Invalid dateStyle "${options.dateStyle}". Must be one of: ${DATE_STYLE_VALUES.join(", ")}`);
  }
  if (options.timeStyle && !TIME_STYLE_VALUES.includes(options.timeStyle)) {
    throw new Error(`Invalid timeStyle "${options.timeStyle}". Must be one of: ${TIME_STYLE_VALUES.join(", ")}`);
  }
  return new Intl.DateTimeFormat(locale, options).format(new Date());
}

// Prompt for tool schema:
/*
Write a valid JSON schema spec for the purposes of tool calling for this function.


```typescript
<paste typescript code here>
```

Follow the best practices listed in the documentation here: https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools.md
*/
export const getCurrentDatetimeSchema: Tool = {
  "name": "get_current_datetime",
  "description": "Returns the current date and time formatted according to specified locale and formatting options. At least one of dateStyle or timeStyle must be provided; if neither is specified, the tool will throw an error. The tool uses the Intl.DateTimeFormat API to format dates and times according to locale-specific conventions (e.g., MM/DD/YYYY for en-US vs DD/MM/YYYY for en-GB). Use this tool whenever you need to display the current date, time, or both in a human-readable, locale-aware format. Each style option offers different verbosity levels: 'full' provides the most detail (e.g., 'Friday, May 29, 2026 at 2:30:00 PM UTC'), 'long' is detailed (e.g., 'May 29, 2026 at 2:30:00 PM'), 'medium' is standard (e.g., 'May 29, 2026, 2:30:00 PM'), and 'short' is compact (e.g., '5/29/26, 2:30 PM'). The locale parameter controls regional formatting conventions.",
  "input_schema": {
    "type": "object",
    "properties": {
      "dateStyle": {
        "type": "string",
        "enum": ["full", "long", "medium", "short"],
        "description": "Verbosity level for the date portion. 'full' includes weekday and full date, 'long' includes full date, 'medium' is standard formatting, 'short' is compact numeric format. Omit this parameter if only time formatting is needed."
      },
      "timeStyle": {
        "type": "string",
        "enum": ["full", "long", "medium", "short"],
        "description": "Verbosity level for the time portion. 'full' includes timezone info, 'long' and 'medium' include seconds, 'short' shows only hours and minutes. Omit this parameter if only date formatting is needed."
      },
      "locale": {
        "type": "string",
        "description": "BCP 47 language tag for locale-specific formatting (e.g., 'en-US', 'en-GB', 'de-DE', 'fr-FR', 'ja-JP'). Determines how dates and times are displayed according to regional conventions. Defaults to 'en-US' if not provided."
      }
    },
    "required": []
  },
  "input_examples": [
    {
      "dateStyle": "short",
      "timeStyle": "medium"
    },
    {
      "dateStyle": "long",
      "timeStyle": "long"
    },
    {
      "dateStyle": "medium"
    },
    {
      "timeStyle": "short",
      "locale": "de-DE"
    },
    {
      "dateStyle": "full",
      "timeStyle": "full",
      "locale": "fr-FR"
    }
  ]
};
