import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChatbotWithPlugins } from "../types";
import { Plugin } from "@prisma/client";

interface ManagePluginsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  chatbot: ChatbotWithPlugins | null;
  availablePlugins: Plugin[];
  onTogglePlugin: (pluginId: number, enabled: boolean) => void;
  isPluginEnabled: (pluginId: number) => boolean;
}

export function ManagePluginsDialog({
  isOpen,
  onOpenChange,
  chatbot,
  availablePlugins,
  onTogglePlugin,
  isPluginEnabled,
}: ManagePluginsDialogProps) {
  if (!chatbot) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Plugins for {chatbot.name}</DialogTitle>
          <DialogDescription>
            Enable or disable plugins for this chatbot
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {availablePlugins.map((plugin) => (
              <div key={plugin.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <h3 className="font-medium">{plugin.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {plugin.code.substring(0, 50)}...
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={isPluginEnabled(plugin.id)}
                    onCheckedChange={(checked) => onTogglePlugin(plugin.id, checked)}
                  />
                  <Label>{isPluginEnabled(plugin.id) ? "Enabled" : "Disabled"}</Label>
                </div>
              </div>
            ))}
            {availablePlugins.length === 0 && (
              <p className="text-center text-muted-foreground">No plugins available</p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
