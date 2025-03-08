"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Bot, SortDesc, Grid, List } from "lucide-react";
import { useUser } from "@/stores/user/userSelectors";
import { Plugin } from "@prisma/client";
import {
  ChatbotFormValues,
  ChatbotWithPlugins,
  chatbotFormSchema,
} from "../types";
import { ChatbotList } from "../presentation/ChatbotList";
import { CreateEditChatbotDialog } from "../presentation/CreateEditChatbotDialog";
import { ManagePluginsDialog } from "../presentation/ManagePluginsDialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Import the chatbot and plugin services
import {
  createChatbot,
  getUserChatbots,
  updateChatbot,
  getChatbot,
  addPluginToChatbot,
  toggleChatbotPlugin,
  getAvailablePlugins,
} from "@/services/chatbot.service";

export function ChatbotContainer() {
  const { id: userId } = useUser();
  const router = useRouter();
  const [chatbots, setChatbots] = useState<ChatbotWithPlugins[]>([]);
  const [filteredChatbots, setFilteredChatbots] = useState<ChatbotWithPlugins[]>([]);
  const [availablePlugins, setAvailablePlugins] = useState<Plugin[]>([]);
  const [selectedChatbot, setSelectedChatbot] =
    useState<ChatbotWithPlugins | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isManagingPlugins, setIsManagingPlugins] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "recent">("recent");
  const [activeTab, setActiveTab] = useState("all");

  // Form setup
  const form = useForm<ChatbotFormValues>({
    resolver: zodResolver(chatbotFormSchema),
    defaultValues: {
      name: "",
      description: "",
      avatar: "",
    },
  });

  // Load chatbots and plugins
  const loadData = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const userChatbots = await getUserChatbots({ userId });
      setChatbots(userChatbots as ChatbotWithPlugins[]);
      setFilteredChatbots(userChatbots as ChatbotWithPlugins[]);

      const plugins = await getAvailablePlugins();
      setAvailablePlugins(plugins);
    } catch (error) {
      console.error("Failed to load data:", error);
      setError("Failed to load chatbots and plugins. Please try again later.");
      toast.error("Failed to load chatbots and plugins");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter chatbots based on search query and active tab
  useEffect(() => {
    let result = [...chatbots];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (chatbot) =>
          chatbot.name.toLowerCase().includes(query) ||
          (chatbot.description && chatbot.description.toLowerCase().includes(query))
      );
    }
    
    // Apply tab filter
    if (activeTab === "with-plugins") {
      result = result.filter((chatbot) => 
        chatbot.plugins.some(plugin => plugin.enabled)
      );
    } else if (activeTab === "without-plugins") {
      result = result.filter((chatbot) => 
        !chatbot.plugins.some(plugin => plugin.enabled)
      );
    }
    
    // Apply sorting
    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Sort by most recently created/updated (assuming there's a createdAt or updatedAt field)
      // If these fields don't exist, this will maintain the original order
      result.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0);
        const dateB = new Date(b.updatedAt || b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });
    }
    
    setFilteredChatbots(result);
  }, [chatbots, searchQuery, activeTab, sortBy]);

  // Create a new chatbot
  const handleCreateChatbot = async (data: ChatbotFormValues) => {
    if (!userId) return;

    try {
      await createChatbot({
        userId,
        name: data.name,
        description: data.description,
        avatar: data.avatar,
      });

      toast.success("Chatbot created successfully");
      form.reset();
      setIsCreating(false);
      loadData();
    } catch (error) {
      console.error("Failed to create chatbot:", error);
      toast.error("Failed to create chatbot");
    }
  };

  // Update an existing chatbot
  const handleUpdateChatbot = async (data: ChatbotFormValues) => {
    if (!selectedChatbot) return;

    try {
      await updateChatbot({
        chatbotId: selectedChatbot.id,
        name: data.name,
        description: data.description,
        avatar: data.avatar,
      });

      toast.success("Chatbot updated successfully");
      form.reset();
      setIsEditing(false);
      loadData();
    } catch (error) {
      console.error("Failed to update chatbot:", error);
      toast.error("Failed to update chatbot");
    }
  };

  // Open the edit dialog
  const openEditDialog = (chatbot: ChatbotWithPlugins) => {
    setSelectedChatbot(chatbot);
    form.reset({
      name: chatbot.name,
      description: chatbot.description || "",
      avatar: chatbot.avatar || "",
    });
    setIsEditing(true);
  };

  // Open the plugin management dialog
  const openPluginDialog = (chatbot: ChatbotWithPlugins) => {
    setSelectedChatbot(chatbot);
    setIsManagingPlugins(true);
  };

  // Toggle a plugin for a chatbot
  const handleTogglePlugin = async (pluginId: number, enabled: boolean) => {
    if (!selectedChatbot) return;

    try {
      // Check if the plugin is already added to the chatbot
      const existingPlugin = selectedChatbot.plugins.find(
        (p) => p.plugin.id === pluginId
      );

      if (existingPlugin) {
        // Toggle existing plugin
        await toggleChatbotPlugin({
          chatbotId: selectedChatbot.id,
          pluginId,
          enabled,
        });
      } else {
        // Add new plugin
        await addPluginToChatbot({
          chatbotId: selectedChatbot.id,
          pluginId,
          enabled,
        });
      }

      // Refresh data
      const updatedChatbot = await getChatbot({
        chatbotId: selectedChatbot.id,
      });
      setSelectedChatbot(updatedChatbot as ChatbotWithPlugins);
      loadData();
    } catch (error) {
      console.error("Failed to toggle plugin:", error);
      toast.error("Failed to update plugin");
    }
  };

  // Check if a plugin is enabled for the selected chatbot
  const isPluginEnabled = (pluginId: number) => {
    if (!selectedChatbot) return false;
    const plugin = selectedChatbot.plugins.find(
      (p) => p.plugin.id === pluginId
    );
    return plugin?.enabled || false;
  };

  // Navigate to chat with selected chatbot
  const handleChatClick = (chatbotId: number) => {
    router.push(`/chat?chatbotId=${chatbotId}`);
  };

  // Render loading skeletons
  const renderSkeletons = () => {
    return Array(3)
      .fill(0)
      .map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-3 w-[200px]" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-3 w-[100px] mb-2" />
          </CardContent>
          <div className="border-t p-4">
            <div className="flex justify-between">
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-20" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </div>
        </Card>
      ));
  };

  // Render empty state
  const renderEmptyState = () => {
    return (
      <Card className="col-span-full py-10">
        <CardContent className="flex flex-col items-center justify-center text-center">
          <Bot className="h-16 w-16 text-muted-foreground mb-4" />
          <CardTitle className="text-xl mb-2">No chatbots found</CardTitle>
          <CardDescription className="max-w-md mb-6">
            {searchQuery
              ? "No chatbots match your search criteria. Try a different search term."
              : "You haven't created any chatbots yet. Create your first chatbot to get started."}
          </CardDescription>
          <Button onClick={() => {
            form.reset();
            setIsCreating(true);
          }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Your First Chatbot
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Chatbots</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your custom chatbots with plugins
          </p>
        </div>
        <Button
          onClick={() => {
            form.reset();
            setIsCreating(true);
          }}
          className="shrink-0"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Chatbot
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chatbots..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <SortDesc className="h-4 w-4" />
                <span className="hidden sm:inline">Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy("recent")}>
                Most Recent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("name")}>
                Alphabetical
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? (
              <List className="h-4 w-4" />
            ) : (
              <Grid className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">
            All
            <Badge variant="secondary" className="ml-2">
              {chatbots.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="with-plugins">
            With Plugins
            <Badge variant="secondary" className="ml-2">
              {chatbots.filter(c => c.plugins.some(p => p.enabled)).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="without-plugins">
            Without Plugins
            <Badge variant="secondary" className="ml-2">
              {chatbots.filter(c => !c.plugins.some(p => p.enabled)).length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${viewMode === "list" ? "!grid-cols-1" : ""}`}>
              {renderSkeletons()}
            </div>
          ) : filteredChatbots.length === 0 ? (
            renderEmptyState()
          ) : (
            <ChatbotList
              chatbots={filteredChatbots}
              onEditClick={openEditDialog}
              onManagePluginsClick={openPluginDialog}
              onChatClick={handleChatClick}
              viewMode={viewMode}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateEditChatbotDialog
        isOpen={isCreating}
        onOpenChange={setIsCreating}
        form={form}
        onSubmit={handleCreateChatbot}
        mode="create"
      />

      <CreateEditChatbotDialog
        isOpen={isEditing}
        onOpenChange={setIsEditing}
        form={form}
        onSubmit={handleUpdateChatbot}
        mode="edit"
      />

      <ManagePluginsDialog
        isOpen={isManagingPlugins}
        onOpenChange={setIsManagingPlugins}
        chatbot={selectedChatbot}
        availablePlugins={availablePlugins}
        onTogglePlugin={handleTogglePlugin}
        isPluginEnabled={isPluginEnabled}
      />
    </div>
  );
}
