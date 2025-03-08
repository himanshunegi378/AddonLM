import { ChatbotWithPlugins } from "../types";
import { ChatbotCard } from "./ChatbotCard";
import { cn } from "@/lib/utils";

interface ChatbotListProps {
  readonly chatbots: readonly ChatbotWithPlugins[];
  readonly onEditClick: (chatbot: ChatbotWithPlugins) => void;
  readonly onManagePluginsClick: (chatbot: ChatbotWithPlugins) => void;
  readonly onChatClick: (chatbotId: number) => void;
  readonly viewMode?: "grid" | "list";
}

export function ChatbotList({
  chatbots,
  onEditClick,
  onManagePluginsClick,
  onChatClick,
  viewMode = "grid",
}: ChatbotListProps) {
  return (
    <div className={cn(
      "grid gap-6",
      viewMode === "grid" 
        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
        : "grid-cols-1"
    )}>
      {chatbots.map((chatbot) => (
        <ChatbotCard
          key={chatbot.id}
          chatbot={chatbot}
          onEditClick={onEditClick}
          onManagePluginsClick={onManagePluginsClick}
          onChatClick={onChatClick}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
}
