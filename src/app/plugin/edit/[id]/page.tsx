"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ArrowLeft, Save, History } from "lucide-react";
import { getPlugin, updatePlugin } from "@/services/plugin.service";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VersionHistory from "./history";

interface Plugin {
  id: number;
  name: string;
  code: string;
  version: number;
  developerId: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function EditPluginPage() {
  const router = useRouter();
  const params = useParams();
  const pluginId = Number(params!.id);

  const [plugin, setPlugin] = useState<Plugin | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("edit");

  const loadPlugin = useCallback(async () => {
    if (!pluginId) return;

    try {
      setIsLoading(true);
      const pluginData = await getPlugin({ pluginId });
      if (pluginData) {
        setPlugin(pluginData);
        setName(pluginData.name);
        setCode(pluginData.code);
      } else {
        setError("Plugin not found");
      }
    } catch (err) {
      console.error("Failed to load plugin:", err);
      setError("Failed to load plugin");
    } finally {
      setIsLoading(false);
    }
  }, [pluginId]);

  useEffect(() => {
    loadPlugin();
  }, [pluginId, loadPlugin]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Plugin name is required");
      return;
    }

    if (!code.trim()) {
      setError("Plugin code is required");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const updatedPlugin = await updatePlugin({
        pluginId,
        name,
        code,
      });

      setPlugin(updatedPlugin);
      setSuccessMessage(
        `Plugin updated successfully to version ${updatedPlugin.version}`
      );

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Failed to save plugin:", err);
      setError("Failed to save plugin");
    } finally {
      setIsSaving(false);
    }
  };

  // Render content based on loading and error states
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-10">
          <p>Loading plugin...</p>
        </div>
      );
    }

    if (error && !plugin) {
      return (
        <div className="text-center py-10 text-red-500">
          <p>{error}</p>
          <Button className="mt-4" onClick={() => router.push("/plugin")}>
            Return to Plugins
          </Button>
        </div>
      );
    }

    return (
      <Tabs defaultValue="edit" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="edit" className="flex items-center gap-1">
            <Save className="h-4 w-4" /> Edit Plugin
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1">
            <History className="h-4 w-4" /> Version History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-4">
          {error && (
            <div className="bg-red-50 p-4 rounded-md text-red-500 mb-4">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 p-4 rounded-md text-green-600 mb-4">
              {successMessage}
            </div>
          )}

          <div>
            <label
              htmlFor="plugin-name"
              className="block text-sm font-medium mb-1"
            >
              Plugin Name
            </label>
            <Input
              id="plugin-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter plugin name"
            />
          </div>

          <div>
            <label
              htmlFor="plugin-code"
              className="block text-sm font-medium mb-1"
            >
              Plugin Code
            </label>
            <Textarea
              id="plugin-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="font-mono h-80"
              placeholder="function run(input) { /* Your plugin code here */ }"
            />
          </div>

          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              className="mr-2"
              onClick={() => router.push("/plugin")}
            >
              Cancel
            </Button>
            <Button
              disabled={isLoading || isSaving}
              onClick={handleSave}
              className="flex items-center"
            >
              {isSaving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="history">
          {Boolean(pluginId) && (
            <VersionHistory
              pluginId={pluginId}
              onVersionRestore={() => {
                setActiveTab("edit");
                loadPlugin();
                setSuccessMessage(
                  "Plugin restored to previous version successfully"
                );
              }}
            />
          )}
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.push("/plugin")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Plugins
      </Button>

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Edit Plugin</CardTitle>
              <CardDescription>Make changes to your plugin</CardDescription>
            </div>
            {plugin && (
              <Badge variant="outline" className="text-sm">
                Version {plugin.version}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>
    </div>
  );
}
