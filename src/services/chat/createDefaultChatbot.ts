"use server";

/**
 * Create default chatbot for a user if they don't have any
 */
export const createDefaultChatbot = async ({ userId }: { userId: number }) => {
  const { createChatbot } = await import("../chatbot.service");

  return await createChatbot({
    userId,
    name: "Assistant",
    description: "Your default AI assistant",
    avatar: "/default-avatar.png",
  });
};
