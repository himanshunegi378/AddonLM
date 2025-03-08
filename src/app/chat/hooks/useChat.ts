import { useCallback, useEffect, useState } from "react";
import { Message } from "../chat.types";
import { chat } from "@/services/chat.service";
import {
  autoAddConversationTitle,
  getConversation,
} from "@/services/conversation.service";

export const useChat = (conversationId?: number) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [title, setTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const isConversationIdValid = typeof conversationId === "number";

  const loadConversation = useCallback(async () => {
    if (!isConversationIdValid) return;
    const conversation = await getConversation({ conversationId });
    if (!conversation) return;
    setMessages(
      conversation?.messages.map((m) => ({
        id: m.id,
        content: m.content,
        role: m.role,
        timestamp: m.createdAt,
      }))
    );
    setTitle(conversation.title);
  }, [conversationId, isConversationIdValid]);

  const updateConversationTitle = useCallback(async () => {
    if (!isConversationIdValid) return;
    const title = await autoAddConversationTitle({ conversationId });
    setTitle(title);
  }, [conversationId, isConversationIdValid]);

  const clearChat = () => setMessages([]);

  useEffect(() => {
    if (!isConversationIdValid) {
      clearChat();
      return;
    }
    loadConversation();
  }, [conversationId, isConversationIdValid, loadConversation]);

  const createUserMessage = (content: string, index: number): Message => ({
    id: index + 1,
    content,
    role: "user",
    timestamp: new Date(),
  });

  const createAssistantMessage = (content: string, index: number): Message => ({
    id: index + 1,
    content,
    role: "assistant",
    timestamp: new Date(),
  });

  const createErrorMessage = (index: number, error: string): Message => ({
    id: index + 1,
    content: error,
    role: "assistant",
    timestamp: new Date(),
  });

  const addAssistantMessage = (content: string) => {
    const newMessage = createAssistantMessage(content, messages.length);
    setMessages((prev) => [...prev, newMessage]);
  };

  const addUserMessage = (content: string) => {
    const newMessage = createUserMessage(content, messages.length);
    setMessages((prev) => [...prev, newMessage]);
  };

  const addErrorMessage = (error: string) => {
    const newMessage = createErrorMessage(messages.length, error);
    setMessages((prev) => [...prev, newMessage]);
  };

  const validateMessage = (input: string) =>
    input.trim().length > 0 && !input.startsWith("/");

  const sendMessage = async (inputMessage: string) => {
    if (!validateMessage(inputMessage) || !isConversationIdValid) return;

    addUserMessage(inputMessage);
    setLoading(true);

    try {
      const response = await chat({
        conversationId,
        input: inputMessage,
      });

      addAssistantMessage(response);

      if (!title) {
        await updateConversationTitle();
      }
    } catch (err) {
      addErrorMessage((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return { title, messages, sendMessage, loading };
};
