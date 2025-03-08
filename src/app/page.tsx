import Link from "next/link";
import { ArrowRight, ChevronRight, Command, Layout, Puzzle, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Hero Section */}
      <div className="container px-4 py-16 md:py-24 mx-auto">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="inline-block p-2 bg-primary/10 rounded-xl mb-4">
            <Command className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Next-Generation <span className="text-primary">Tool Addons</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Create, manage, and deploy powerful plugin extensions with our intuitive platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button asChild size="lg">
              <Link href="/plugin">
                Get Started
                <ArrowRight className="ml-1" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/chat">
                Try Demo
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container px-4 py-16 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold">Powerful Features</h2>
          <p className="text-muted-foreground mt-2">Everything you need to build and manage your tools</p>
          <Separator className="mt-8 max-w-[120px] mx-auto" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <Card>
            <CardHeader className="flex flex-col items-center text-center">
              <div className="p-3 rounded-full bg-primary/10 mb-4">
                <Puzzle className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Plugin Management</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription>
                Create, edit and organize your plugins with our intuitive interface
              </CardDescription>
            </CardContent>
          </Card>
          
          {/* Feature 2 */}
          <Card>
            <CardHeader className="flex flex-col items-center text-center">
              <div className="p-3 rounded-full bg-primary/10 mb-4">
                <Layout className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Custom Dashboards</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription>
                Monitor and analyze your plugin performance with real-time data
              </CardDescription>
            </CardContent>
          </Card>
          
          {/* Feature 3 */}
          <Card>
            <CardHeader className="flex flex-col items-center text-center">
              <div className="p-3 rounded-full bg-primary/10 mb-4">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Advanced Configuration</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription>
                Fine-tune your plugins with powerful customization options
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container px-4 py-16 md:py-24 mx-auto">
        <Card className="border-border p-2">
          <CardContent className="p-6 md:p-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">Ready to enhance your workflow?</h2>
                <p className="text-muted-foreground max-w-xl">
                  Start creating and managing your custom tools today and transform how you work
                </p>
              </div>
              <Button asChild size="lg">
                <Link href="/plugin">
                  Get Started
                  <ChevronRight className="ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="container px-4 py-8 mx-auto border-t border-border">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <Command className="w-6 h-6 mr-2 text-primary" />
            <span className="font-semibold">Tool Addon Platform</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {new Date().getFullYear()} Tool Addon. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Button asChild variant="link" size="sm" className="h-auto p-0">
              <Link href="/chatbot">Chat</Link>
            </Button>
            <Button asChild variant="link" size="sm" className="h-auto p-0">
              <Link href="/plugin">Plugins</Link>
            </Button>
            <Button asChild variant="link" size="sm" className="h-auto p-0">
              <Link href="/plugin">Documentation</Link>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
