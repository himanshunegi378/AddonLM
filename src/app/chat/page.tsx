"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { useChat } from "./hooks/useChat";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useUser } from "@/stores/user/userSelectors";
import { useSearchParams, useRouter } from "next/navigation";
import {
  createConversation,
  getAllConversations,
} from "@/services/conversation.service";
import { getUserChatbots } from "@/services/chatbot.service";
import { createDefaultChatbot } from "@/services/chat.service";
import { Conversation, Chatbot } from "@prisma/client";
import Sidebar from "./components/Sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type ChatbotWithDetails = Chatbot & {
  plugins: {
    plugin: {
      id: number;
      name: string;
      code: string;
    };
    enabled: boolean;
  }[];
};

function ChatPage() {
  const [conversationId, setConversationId] = useState<number>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [chatbots, setChatbots] = useState<ChatbotWithDetails[]>([]);
  const [selectedChatbotId, setSelectedChatbotId] = useState<number | null>(
    null
  );
  const { messages, loading, sendMessage, title } = useChat(conversationId);
  const sendMessageRef = useRef(sendMessage);
  const { id: userId } = useUser();
  const [input, setInput] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  // Load chatbots
  const loadChatbots = useCallback(async () => {
    if (!userId) return;
    try {
      const userChatbots = await getUserChatbots({ userId });
      setChatbots(userChatbots as ChatbotWithDetails[]);

      // If no chatbots exist, create a default one
      if (userChatbots.length === 0) {
        const defaultChatbot = await createDefaultChatbot({ userId });
        setChatbots([defaultChatbot] as ChatbotWithDetails[]);
        setSelectedChatbotId(defaultChatbot.id);
      } else {
        // Set the selected chatbot from URL or use the first one
        const chatbotIdFromUrl = searchParams.get("chatbotId");
        if (chatbotIdFromUrl) {
          setSelectedChatbotId(parseInt(chatbotIdFromUrl));
        } else {
          setSelectedChatbotId(userChatbots[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load chatbots:", error);
      toast.error("Failed to load your chatbots");
    }
  }, [userId, searchParams]);

  const loadConversations = useCallback(async () => {
    if (!userId || !selectedChatbotId) return;
    try {
      const conversations = await getAllConversations({ userId });
      // Filter conversations by the selected chatbot
      const filteredConversations = conversations.filter(
        (conv) => conv.chatbotId === selectedChatbotId
      );
      setConversations(filteredConversations);
    } catch (error) {
      console.error("Failed to load conversations:", error);
      toast.error("Failed to load your conversations");
    }
  }, [userId, selectedChatbotId]);

  const newConversation = async () => {
    if (!userId || !selectedChatbotId) return;
    try {
      const conversation = await createConversation({
        userId,
        chatbotId: selectedChatbotId,
      });
      await loadConversations();
      setConversationId(conversation.id);
    } catch (error) {
      console.error("Failed to create conversation:", error);
      toast.error("Failed to create a new conversation");
    }
  };

  const handleChatbotChange = (chatbotId: string) => {
    const id = parseInt(chatbotId);
    setSelectedChatbotId(id);
    setConversationId(undefined); // Reset the current conversation

    // Update URL to include chatbot ID
    router.push(`/chat?chatbotId=${id}`);
  };

  useEffect(() => {
    loadChatbots();
  }, [loadChatbots]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Get the current chatbot
  const currentChatbot = chatbots.find(
    (chatbot) => chatbot.id === selectedChatbotId
  );

  return (
    <div className="flex h-screen">
      <Sidebar
        conversations={conversations.map((conversation) => ({
          ...conversation,
          title:
            conversation.id === conversationId ? title : conversation.title,
        }))}
        onConversationSelect={setConversationId}
        onCreateConversation={newConversation}
      />
      <div className="container mx-auto max-w-4xl h-[calc(100vh-5rem)] my-4 flex-1">
        <Card className="h-full flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h1 className="text-2xl font-bold">
              {title ?? "New conversation"}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Chatbot:</span>
              <Select
                value={selectedChatbotId?.toString()}
                onValueChange={handleChatbotChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a chatbot" />
                </SelectTrigger>
                <SelectContent>
                  {chatbots.map((chatbot) => (
                    <SelectItem key={chatbot.id} value={chatbot.id.toString()}>
                      {chatbot.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.id} + ${index}`}
                  className={`flex items-start gap-3 ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    {message.role === "assistant" && currentChatbot?.avatar && (
                      <img
                        src={currentChatbot.avatar}
                        alt={currentChatbot.name}
                      />
                    )}
                  </Avatar>
                  <div
                    className={`rounded-lg p-3 max-w-[70%] ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!input.trim()) return;
                if (!conversationId) {
                  await newConversation();
                  setTimeout(() => {
                    sendMessageRef.current(input);
                    setInput("");
                  }, 1000);
                  return;
                } else {
                  sendMessage(input);
                  setInput("");
                }
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <Button type="submit" disabled={loading}>
                Send
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function WithSuspense() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatPage />
    </Suspense>
  );
}
