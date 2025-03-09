"use server";
import { createModel } from "@/utils/createModel";
import prisma from "./prismaClient";
import { z } from "zod";
import { getUserApiKey } from "./apiKey.service";

export const getConversation = async ({
  conversationId,
}: {
  conversationId: number;
}) => {
  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
      chatbot: true,
    },
  });
  return conversation;
};

export const createConversation = async ({
  userId,
  chatbotId,
}: {
  userId: number;
  chatbotId: number;
}) => {
  const conversation = await prisma.conversation.create({
    data: {
      userId,
      chatbotId,
    },
  });
  return conversation;
};

export const addMessageToConversation = async ({
  conversationId,
  message,
  role,
}: {
  conversationId: number;
  message: string;
  role: "user" | "assistant";
}) => {
  const conversation = await prisma.conversation.update({
    where: {
      id: conversationId,
    },
    data: {
      messages: {
        create: {
          content: message,
          role: role,
        },
      },
      updatedAt: new Date(),
    },
  });
  return conversation;
};

export const getAllConversations = async ({ userId }: { userId: number }) => {
  const conversations = await prisma.conversation.findMany({
    where: {
      userId,
    },
    include: {
      chatbot: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
  return conversations;
};

export const getChatbotConversations = async ({
  userId,
  chatbotId,
}: {
  userId: number;
  chatbotId: number;
}) => {
  const conversations = await prisma.conversation.findMany({
    where: {
      userId,
      chatbotId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
  return conversations;
};

export const autoAddConversationTitle = async ({
  conversationId,
}: {
  conversationId: number;
}) => {
  const conversation = await getConversation({ conversationId });
  if (!conversation) throw new Error("Conversation not found");
  const apiKey = await getUserApiKey(conversation.userId);
  if (!apiKey) throw new Error("API key not found");
  const model = createModel({ apiKey });

  const response = await model
    .withStructuredOutput({
      name: "title",
      schema: z.object({ title: z.string() }),
    })
    .invoke([
      {
        role: "system",
        content:
          "You purpose it to suggest a suitable title for a conversation. title should be relevant to the chat history and concise.",
      },
      ...conversation.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      {
        role: "user",
        content: "Suggest a title for a conversation",
      },
    ]);

  if (!response) throw new Error("Failed to get title");
  const title = response.title as string;

  await prisma.conversation.update({
    where: {
      id: conversationId,
    },
    data: {
      title,
    },
  });

  return title;
};
