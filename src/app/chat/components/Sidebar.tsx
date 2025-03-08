import { Conversation } from "@prisma/client";
import React from "react";
import { HiMiniPlus } from "react-icons/hi2";

interface SidebarProps {
  conversations: Conversation[];
  onConversationSelect: (id: number) => void;
  onCreateConversation: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  onConversationSelect,
  onCreateConversation,
}) => {
  return (
    <div className="w-64 bg-gray-800 text-white p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Conversations</h2>
        <button
          onClick={onCreateConversation}
          className="p-1 rounded hover:bg-gray-700"
        >
          <HiMiniPlus className="h-5 w-5" />
        </button>
      </div>
      <ul>
        {conversations.map((conversation) => (
          <li key={conversation.id} className="mb-2">
            <button onClick={() => onConversationSelect(conversation.id)}>
              {conversation.title ?? "New conversation"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
