import Anthropic from "@anthropic-ai/sdk";
type Tool = Anthropic.Tool;

type DateTimeStyle = "full" | "long" | "medium" | "short";

export function getCurrentDatetime(
  style: DateTimeStyle = "medium",
  locale: string = "en-US"
): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: style,
    timeStyle: style,
  }).format(new Date());
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
  "description": "Returns the current date and time formatted according to a specified verbosity level and locale. The tool uses the Intl.DateTimeFormat API to format dates and times according to locale-specific conventions (e.g., MM/DD/YYYY for en-US vs DD/MM/YYYY for en-GB). Use this tool whenever you need to display the current date and time in a human-readable, locale-aware format. The style option offers different verbosity levels: 'full' provides the most detail (e.g., 'Friday, May 29, 2026 at 2:30:00 PM UTC'), 'long' is detailed (e.g., 'May 29, 2026 at 2:30:00 PM'), 'medium' is standard (e.g., 'May 29, 2026, 2:30:00 PM'), and 'short' is compact (e.g., '5/29/26, 2:30 PM'). The locale parameter controls regional formatting conventions.",
  "input_schema": {
    "type": "object",
    "properties": {
      "style": {
        "type": "string",
        "enum": ["full", "long", "medium", "short"],
        "description": "Verbosity level applied to both the date and time. 'full' includes weekday and timezone, 'long' is detailed, 'medium' is standard formatting, 'short' is a compact numeric format. Defaults to 'medium' if not provided."
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
      "style": "short"
    },
    {
      "style": "long"
    },
    {
      "style": "short",
      "locale": "de-DE"
    },
    {
      "style": "full",
      "locale": "fr-FR"
    }
  ]
};
