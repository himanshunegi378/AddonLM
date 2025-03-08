import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Bot, Puzzle, MessageSquare } from "lucide-react";
import { ChatbotWithPlugins } from "../types";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface ChatbotCardProps {
  chatbot: ChatbotWithPlugins;
  onEditClick: (chatbot: ChatbotWithPlugins) => void;
  onManagePluginsClick: (chatbot: ChatbotWithPlugins) => void;
  onChatClick: (chatbotId: number) => void;
  viewMode?: "grid" | "list";
}

export function ChatbotCard({
  chatbot,
  onEditClick,
  onManagePluginsClick,
  onChatClick,
  viewMode = "grid",
}: Readonly<ChatbotCardProps>) {
  const activePluginsCount = chatbot.plugins.filter(p => p.enabled).length;
  
  // Create plugin count text
  const getPluginCountText = (count: number, isCompact = false) => {
    if (count === 0) {
      return isCompact ? "No plugins" : "No active plugins";
    }
    const suffix = count !== 1 ? 's' : '';
    return isCompact 
      ? `${count} plugin${suffix}` 
      : `${count} active plugin${suffix}`;
  };
  
  // Grid view (default)
  if (viewMode === "grid") {
    return (
      <Card key={chatbot.id} className="overflow-hidden hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={chatbot.avatar ?? ""} alt={chatbot.name} />
            <AvatarFallback>
              <Bot className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{chatbot.name}</CardTitle>
            <CardDescription className="line-clamp-1">
              {chatbot.description ?? "No description"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center">
              <Puzzle className="h-4 w-4 mr-1.5" />
              <p>{getPluginCountText(activePluginsCount)}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onManagePluginsClick(chatbot)}
              className="mr-2"
            >
              <Puzzle className="h-4 w-4 mr-1" /> Manage
            </Button>
            <Link href={`/chatbot/${chatbot.id}/plugins`} passHref>
              <Button variant="secondary" size="sm">
                <Puzzle className="h-4 w-4 mr-1" /> Advanced
              </Button>
            </Link>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onEditClick(chatbot)}
              title="Edit chatbot"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onChatClick(chatbot.id)}
              title="Chat with this bot"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  }
  
  // List view
  return (
    <Card key={chatbot.id} className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center">
        <div className="flex items-center p-4 sm:w-1/3">
          <Avatar className="h-10 w-10 mr-4">
            <AvatarImage src={chatbot.avatar ?? ""} alt={chatbot.name} />
            <AvatarFallback>
              <Bot className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{chatbot.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {chatbot.description ?? "No description"}
            </p>
          </div>
        </div>
        
        <div className="px-4 py-2 sm:py-0 sm:w-1/3 flex items-center">
          <Badge variant={activePluginsCount > 0 ? "secondary" : "outline"} className="flex items-center">
            <Puzzle className="h-3 w-3 mr-1" />
            {getPluginCountText(activePluginsCount, true)}
          </Badge>
        </div>
        
        <div className="flex justify-end p-4 sm:w-1/3 space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onManagePluginsClick(chatbot)}
          >
            Manage
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onEditClick(chatbot)}
            title="Edit chatbot"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onChatClick(chatbot.id)}
            title="Chat with this bot"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
