"use server";
import prisma from "./prismaClient";

/**
 * Creates a new chatbot for a user
 */
export const createChatbot = async ({
  userId,
  name,
  description,
  avatar,
}: {
  userId: number;
  name: string;
  description?: string;
  avatar?: string;
}) => {
  const chatbot = await prisma.chatbot.create({
    data: {
      userId,
      name,
      description,
      avatar,
    },
  });
  return chatbot;
};

/**
 * Gets all chatbots for a user
 */
export const getUserChatbots = async ({ userId }: { userId: number }) => {
  const chatbots = await prisma.chatbot.findMany({
    where: {
      userId,
    },
    include: {
      plugins: {
        include: {
          plugin: true,
        },
      },
    },
  });
  return chatbots;
};

/**
 * Gets a specific chatbot by ID
 */
export const getChatbot = async ({ chatbotId }: { chatbotId: number }) => {
  const chatbot = await prisma.chatbot.findUnique({
    where: {
      id: chatbotId,
    },
    include: {
      plugins: {
        include: {
          plugin: true,
        },
      },
    },
  });
  return chatbot;
};

/**
 * Gets all plugins available to use with chatbots
 */
export const getAvailablePlugins = async () => {
  const plugins = await prisma.plugin.findMany();
  return plugins;
};

/**
 * Adds a plugin to a chatbot
 */
export const addPluginToChatbot = async ({
  chatbotId,
  pluginId,
  enabled = true,
}: {
  chatbotId: number;
  pluginId: number;
  enabled?: boolean;
}) => {
  const chatbotPlugin = await prisma.chatbotPlugins.create({
    data: {
      chatbotId,
      pluginId,
      enabled,
    },
  });
  return chatbotPlugin;
};

/**
 * Removes a plugin from a chatbot
 */
export const removePluginFromChatbot = async ({
  chatbotId,
  pluginId,
}: {
  chatbotId: number;
  pluginId: number;
}) => {
  await prisma.chatbotPlugins.delete({
    where: {
      chatbotId_pluginId: {
        chatbotId,
        pluginId,
      },
    },
  });
  return true;
};

/**
 * Updates a chatbot's settings
 */
export const updateChatbot = async ({
  chatbotId,
  name,
  description,
  avatar,
}: {
  chatbotId: number;
  name?: string;
  description?: string;
  avatar?: string;
}) => {
  const chatbot = await prisma.chatbot.update({
    where: {
      id: chatbotId,
    },
    data: {
      name,
      description,
      avatar,
    },
  });
  return chatbot;
};

/**
 * Toggle a plugin's enabled status for a chatbot
 */
export const toggleChatbotPlugin = async ({
  chatbotId,
  pluginId,
  enabled,
}: {
  chatbotId: number;
  pluginId: number;
  enabled: boolean;
}) => {
  const chatbotPlugin = await prisma.chatbotPlugins.update({
    where: {
      chatbotId_pluginId: {
        chatbotId,
        pluginId,
      },
    },
    data: {
      enabled,
    },
  });
  return chatbotPlugin;
};
