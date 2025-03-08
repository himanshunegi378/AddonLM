import { ChatOpenAI, ChatOpenAICallOptions } from "@langchain/openai";
import { env } from "../utils/env";
import ModelNames from "@/constants/modelNames";

export const createModel = (
  options: Omit<ChatOpenAICallOptions, "model" | "apiKey"> = {}
) => {
  return new ChatOpenAI({
    apiKey: env.OPENAI_API_KEY,
    model: ModelNames["gpt-4o-mini"],
    ...options,
  });
};
