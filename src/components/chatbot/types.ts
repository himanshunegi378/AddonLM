import { Chatbot, Plugin } from "@prisma/client";
import { z } from "zod";

// Extended types for our components
export type ChatbotWithPlugins = Chatbot & {
  plugins: {
    plugin: Plugin;
    enabled: boolean;
  }[];
};

// Define form validation schema
export const chatbotFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  avatar: z.string().optional(),
});

export type ChatbotFormValues = z.infer<typeof chatbotFormSchema>;
