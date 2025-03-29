"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getChatbot,
  getAvailablePlugins,
  addPluginToChatbot,
  removePluginFromChatbot,
  toggleChatbotPlugin,
} from "@/services/chatbot.service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Plugin {
  id: number;
  name: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  developerId: number;
}

interface ChatbotPlugin {
  chatbotId: number;
  pluginId: number;
  enabled: boolean;
  plugin: Plugin;
}

interface Chatbot {
  id: number;
  name: string;
  description: string | null;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  plugins: ChatbotPlugin[];
}

export default function ChatbotPluginsClientPage() {
  const router = useRouter();
  const params = useParams();
  const chatbotId = parseInt(params!.id as string);

  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [availablePlugins, setAvailablePlugins] = useState<Plugin[]>([]);
  const [selectedPlugins, setSelectedPlugins] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingPlugins, setIsAddingPlugins] = useState(false);
  const [error, setError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch chatbot and available plugins data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [chatbotData, pluginsData] = await Promise.all([
          getChatbot({ chatbotId }),
          getAvailablePlugins(),
        ]);

        if (!chatbotData) {
          setError("Chatbot not found");
          setIsLoading(false);
          return;
        }

        setChatbot(chatbotData);

        // Filter out plugins that are already added to the chatbot
        const chatbotPluginIds = new Set(
          chatbotData.plugins.map((p) => p.pluginId)
        );
        const filteredPlugins = pluginsData.filter(
          (plugin) => !chatbotPluginIds.has(plugin.id)
        );
        setAvailablePlugins(filteredPlugins);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load chatbot or plugins data");
      } finally {
        setIsLoading(false);
      }
    };

    if (chatbotId && !isNaN(chatbotId)) {
      fetchData();
    } else {
      setError("Invalid chatbot ID");
      setIsLoading(false);
    }
  }, [chatbotId]);

  const handleTogglePlugin = async (pluginId: number, enabled: boolean) => {
    try {
      await toggleChatbotPlugin({
        chatbotId,
        pluginId,
        enabled,
      });

      // Update local state
      setChatbot((prevChatbot) => {
        if (!prevChatbot) return null;

        return {
          ...prevChatbot,
          plugins: prevChatbot.plugins.map((plugin) =>
            plugin.pluginId === pluginId ? { ...plugin, enabled } : plugin
          ),
        };
      });
    } catch (err) {
      console.error("Error toggling plugin:", err);
      setError("Failed to update plugin status");
    }
  };

  const handleRemovePlugin = async (pluginId: number) => {
    if (!confirm("Are you sure you want to remove this plugin?")) return;

    try {
      await removePluginFromChatbot({
        chatbotId,
        pluginId,
      });

      // Update local state
      setChatbot((prevChatbot) => {
        if (!prevChatbot) return null;

        return {
          ...prevChatbot,
          plugins: prevChatbot.plugins.filter(
            (plugin) => plugin.pluginId !== pluginId
          ),
        };
      });

      // Add the removed plugin back to available plugins
      const removedPlugin = chatbot?.plugins.find(
        (plugin) => plugin.pluginId === pluginId
      )?.plugin;
      if (removedPlugin) {
        setAvailablePlugins((prev) => [...prev, removedPlugin]);
      }
    } catch (err) {
      console.error("Error removing plugin:", err);
      setError("Failed to remove plugin");
    }
  };

  const handleAddPlugins = async () => {
    if (selectedPlugins.length === 0) {
      setError("No plugins selected");
      return;
    }

    setIsAddingPlugins(true);
    setError("");

    try {
      // Add each selected plugin
      const addPromises = selectedPlugins.map((pluginId) =>
        addPluginToChatbot({
          chatbotId,
          pluginId,
          enabled: true,
        })
      );

      await Promise.all(addPromises);

      // Refresh chatbot data
      const updatedChatbot = await getChatbot({ chatbotId });
      setChatbot(updatedChatbot);

      // Update available plugins
      const addedPluginIds = new Set(selectedPlugins);
      setAvailablePlugins((prev) =>
        prev.filter((plugin) => !addedPluginIds.has(plugin.id))
      );

      // Reset selected plugins
      setSelectedPlugins([]);
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Error adding plugins:", err);
      setError("Failed to add plugins to chatbot");
    } finally {
      setIsAddingPlugins(false);
    }
  };

  const handlePluginSelectionChange = (
    pluginId: number,
    isChecked: boolean
  ) => {
    if (isChecked) {
      setSelectedPlugins((prev) => [...prev, pluginId]);
    } else {
      setSelectedPlugins((prev) => prev.filter((id) => id !== pluginId));
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Loading Chatbot Plugins...</h1>
      </div>
    );
  }

  if (error && !chatbot) {
    return (
      <div className="container py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  if (!chatbot) {
    return (
      <div className="container py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>
            Chatbot not found or you don&lsquo;t have access to it.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/chatbot")}>
          Back to Chatbots
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{chatbot.name} Plugins</h1>
          <p className="text-muted-foreground">
            {chatbot.description ?? "Manage the plugins for this chatbot"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.back()} variant="outline">
            Back
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={availablePlugins.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                Add Plugins
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Plugins to Chatbot</DialogTitle>
                <DialogDescription>
                  Select the plugins you want to add to this chatbot.
                </DialogDescription>
              </DialogHeader>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {availablePlugins.length === 0 ? (
                <div className="py-6 text-center text-muted-foreground">
                  No more plugins available to add.
                </div>
              ) : (
                <div className="grid gap-4 py-4">
                  {availablePlugins.map((plugin) => (
                    <div key={plugin.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={`plugin-${plugin.id}`}
                        checked={selectedPlugins.includes(plugin.id)}
                        onCheckedChange={(checked) =>
                          handlePluginSelectionChange(
                            plugin.id,
                            checked === true
                          )
                        }
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor={`plugin-${plugin.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {plugin.name}
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <DialogFooter className="sm:justify-start">
                <Button
                  type="submit"
                  onClick={handleAddPlugins}
                  disabled={selectedPlugins.length === 0 || isAddingPlugins}
                >
                  {isAddingPlugins ? "Adding..." : "Add Selected Plugins"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {chatbot.plugins.length === 0 ? (
        <div className="bg-muted p-8 rounded-lg text-center">
          <h2 className="text-xl font-medium mb-2">No Plugins Added</h2>
          <p className="text-muted-foreground mb-4">
            Add plugins to enhance your chatbot&lsquo;s capabilities.
          </p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={availablePlugins.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Plugin
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {chatbot.plugins.map((chatbotPlugin) => (
            <Card key={chatbotPlugin.pluginId}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{chatbotPlugin.plugin.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={chatbotPlugin.enabled}
                      onCheckedChange={(checked) =>
                        handleTogglePlugin(chatbotPlugin.pluginId, checked)
                      }
                    />
                  </div>
                </div>
                <CardDescription>
                  Status: {chatbotPlugin.enabled ? "Enabled" : "Disabled"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-sm">
                  Added functionality to your chatbot
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                  onClick={() => handleRemovePlugin(chatbotPlugin.pluginId)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
