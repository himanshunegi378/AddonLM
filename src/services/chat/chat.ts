"use server";

import { 
  addMessageToConversation, 
  getConversation 
} from "../conversation.service";
import { createModel } from "@/utils/createModel";
import { getChatbot } from "../chatbot.service";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { evaluatePluginCode } from "./evaluatePluginCode";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { BaseMessage, AIMessage, HumanMessage } from "@langchain/core/messages";
import { DynamicTool } from "@langchain/core/tools";

// Types for better code clarity
interface ChatInput {
  conversationId: number;
  input: string;
}

interface ChatMessage {
  content: string;
  role: string;
}

// Database-related interfaces
interface PluginData {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  developerId?: number;
}

interface ChatbotPluginData {
  enabled: boolean;
  plugin: PluginData;
}

interface MessageData {
  content: string;
  role: "user" | "assistant";
}

interface ConversationData {
  id: number;
  messages: MessageData[];
  chatbotId: number;
}

interface ChatbotData {
  id: number;
  name: string;
  plugins: ChatbotPluginData[];
}

/**
 * Processes a chat message within a conversation
 * 
 * This function handles the complete chat flow:
 * 1. Retrieves the conversation and associated chatbot
 * 2. Loads and evaluates enabled plugins
 * 3. Creates an agent with the model and tools
 * 4. Processes the user input and returns a response
 */
export const chat = async ({ conversationId, input }: ChatInput): Promise<string> => {
  // --- Step 1: Retrieve conversation and validate ---
  const conversation = await getConversation({ conversationId });
  if (!conversation) {
    throw new Error("Conversation not found");
  }

  // --- Step 2: Load chatbot and validate ---
  const chatbot = await getChatbot({ chatbotId: conversation.chatbotId });
  if (!chatbot) {
    throw new Error("Chatbot not found");
  }

  // --- Step 3: Process plugins ---
  const tools = await loadAndEvaluatePlugins(chatbot as ChatbotData);
  
  // --- Step 4: Create model and prepare message history ---
  const model = createModel({}) as BaseLanguageModel;
  const messages = prepareMessageHistory(conversation as ConversationData, input);

  // --- Step 5: Create agent and get response ---
  const response = await processWithAgent(model, tools, messages);
  
  // --- Step 6: Save conversation history ---
  await saveConversationHistory(conversationId, input, response);

  return response;
};

/**
 * Loads and evaluates all enabled plugins for a chatbot
 * @param chatbot The chatbot with its plugins
 * @returns Array of functional LangChain tools
 */
const loadAndEvaluatePlugins = async (chatbot: ChatbotData): Promise<DynamicTool[]> => {
  // Get active plugins for this chatbot
  const activePlugins = chatbot.plugins
    .filter((plugin: ChatbotPluginData) => plugin.enabled)
    .map((plugin: ChatbotPluginData) => plugin.plugin.code);

  // Evaluate each plugin code and filter out any that failed to evaluate
  const pluginTools = await Promise.all(
    activePlugins.map(evaluatePluginCode)
  );

  // Filter out any null tools
  return pluginTools.filter((tool): tool is DynamicTool => tool !== null);
};

/**
 * Prepares the message history including the new user input
 * @param conversation The conversation with its message history
 * @param input The new user input
 * @returns Array of chat messages
 */
const prepareMessageHistory = (conversation: ConversationData, input: string): ChatMessage[] => {
  let messages: ChatMessage[] = [];

  if (conversation?.messages) {
    messages = conversation.messages.map((message: MessageData) => ({
      content: message.content,
      role: message.role,
    }));
  }

  // Add the current user message
  messages.push({ content: input, role: "user" });
  
  return messages;
};

/**
 * Converts chat messages to LangChain BaseMessage format
 * @param messages Chat messages to convert
 * @returns LangChain-compatible message objects
 */
const convertToLangChainMessages = (messages: ChatMessage[]): BaseMessage[] => {
  return messages.map(message => {
    if (message.role === "user") {
      return new HumanMessage(message.content);
    } else {
      return new AIMessage(message.content);
    }
  });
};

/**
 * Processes the input with the LangChain agent and returns response
 * @param model The LLM model to use
 * @param tools Array of tools available to the agent
 * @param messages Chat message history
 * @returns The assistant's response
 */
const processWithAgent = async (
  model: BaseLanguageModel, 
  tools: DynamicTool[], 
  messages: ChatMessage[]
): Promise<string> => {
  // Create agent with dynamically loaded plugin tools
  const agent = createReactAgent({
    llm: model,
    tools,
  });

  // Convert messages to LangChain format
  const langChainMessages = convertToLangChainMessages(messages);

  // Process the messages through the agent
  const response = await agent.invoke({
    messages: langChainMessages,
  });
  
  // Extract and return the latest response content
  return response.messages.slice(-1)[0].content as string;
};

/**
 * Saves the user input and assistant response to conversation history
 * @param conversationId ID of the conversation
 * @param userInput User's message content
 * @param assistantResponse Assistant's response content
 */
const saveConversationHistory = async (
  conversationId: number, 
  userInput: string, 
  assistantResponse: string
): Promise<void> => {
  // Save user message
  await addMessageToConversation({
    conversationId,
    message: userInput,
    role: "user",
  });

  // Save assistant response
  await addMessageToConversation({
    conversationId,
    message: assistantResponse,
    role: "assistant",
  });
};
