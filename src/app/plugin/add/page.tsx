"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPlugin } from "@/services/plugin.service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser } from "@/stores/user/userSelectors";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { autocompletion } from "@codemirror/autocomplete";

export default function AddPluginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { id: userId } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (!name.trim()) {
      setError("Plugin name is required");
      setIsSubmitting(false);
      return;
    }

    if (!code.trim()) {
      setError("Plugin code is required");
      setIsSubmitting(false);
      return;
    }

    try {
      // Check that we have a valid user ID
      if (!userId || userId <= 0) {
        setError("User not authenticated properly");
        setIsSubmitting(false);
        return;
      }

      await createPlugin({
        userId,
        name,
        code,
      });

      // Navigate back to plugins listing after successful creation
      router.push("/plugin");
      router.refresh();
    } catch (err) {
      console.error("Error creating plugin:", err);
      setError("Failed to create plugin. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Add New Plugin</h1>
        <p className="text-gray-600 mb-6">
          Create a new plugin by providing a name and code
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Plugin Details</CardTitle>
          <CardDescription>Enter the plugin information below</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Plugin Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter plugin name"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Plugin Code</Label>
              <div className="border rounded-md overflow-hidden">
                <CodeMirror
                  value={code}
                  height="300px"
                  theme={vscodeDark}
                  onChange={(value) => setCode(value)}
                  extensions={[
                    javascript({ typescript: true }),
                    autocompletion(),
                  ]}
                  placeholder="Enter plugin code"
                  basicSetup={{
                    lineNumbers: true,
                    highlightActiveLine: true,
                    highlightSelectionMatches: true,
                    autocompletion: true,
                    foldGutter: true,
                    indentOnInput: true,
                  }}
                  className="font-mono text-sm"
                  readOnly={isSubmitting}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/plugin")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Plugin"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
