import { ChatOpenAI, ChatOpenAICallOptions } from "@langchain/openai";
import ModelNames from "@/constants/modelNames";

export const createModel = (
  options: Omit<ChatOpenAICallOptions, "model"> & { apiKey: string }
) => {
  return new ChatOpenAI({
    model: ModelNames["gpt-4o-mini"],
    ...options,
  });
};
