import Anthropic from "@anthropic-ai/sdk";
import * as dotenv from "dotenv";

dotenv.config();

export const MODEL = "claude-haiku-4-5";
export const MAX_TOKENS = 1000;
export const client = new Anthropic();
