"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser } from "@/stores/user/userSelectors";
import { setUserApiKey } from "@/services/apiKey.service";

export default function SettingsPage() {
  const { id } = useUser();
  const [apiKey, setApiKey] = useState("");

  const handleSaveApiKey = async () => {
    await setUserApiKey(id, apiKey);
    setApiKey("");
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>OpenAI API Key</CardTitle>
          <CardDescription>
            Add your OpenAI API key to use your own account for AI features.
            Your API key will be encrypted and stored securely.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="max-w-xl"
              />
              <p className="text-sm text-muted-foreground">
                Don&lsquo;t have an API key? Get one from your{" "}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  OpenAI account settings
                </a>
              </p>
            </div>
            <Button onClick={handleSaveApiKey}>Save API Key</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
