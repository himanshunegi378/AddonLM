'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getChatbot, updateChatbot } from '@/services/chatbot.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Settings, MessageSquare, Puzzle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ChatbotPlugin {
  chatbotId: number;
  pluginId: number;
  enabled: boolean;
}

interface Chatbot {
  id: number;
  name: string;
  description?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  plugins: ChatbotPlugin[];
}

export default function ChatbotDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const chatbotId = parseInt(params.id);
  
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchChatbot = async () => {
      try {
        setIsLoading(true);
        const chatbotData = await getChatbot({ chatbotId });
        setChatbot(chatbotData);
      } catch (err) {
        console.error('Error fetching chatbot:', err);
        setError('Failed to load chatbot data');
      } finally {
        setIsLoading(false);
      }
    };

    if (chatbotId && !isNaN(chatbotId)) {
      fetchChatbot();
    } else {
      setError('Invalid chatbot ID');
      setIsLoading(false);
    }
  }, [chatbotId]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Loading chatbot details...</p>
      </div>
    );
  }

  if (error && !chatbot) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button 
          className="mt-4" 
          onClick={() => router.push('/chatbot')}
        >
          Back to Chatbots
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">{chatbot?.name}</h1>
          <p className="text-gray-600">
            {chatbot?.description || 'No description provided'}
          </p>
        </div>
        <div>
          <Button 
            variant="outline" 
            onClick={() => router.push('/chatbot')}
            className="mr-2"
          >
            Back
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push(`/chatbot/${chatbotId}/settings`)}
            className="mr-2"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                <h3 className="text-lg font-medium">Conversations</h3>
              </div>
              <Button 
                variant="outline"
                onClick={() => router.push(`/chat?chatbotId=${chatbotId}`)}
              >
                Chat Now
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Puzzle className="h-5 w-5 mr-2 text-primary" />
                <h3 className="text-lg font-medium">Plugins</h3>
              </div>
              <Button 
                variant="outline"
                onClick={() => router.push(`/chatbot/${chatbotId}/plugins`)}
              >
                Manage Plugins
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {chatbot?.plugins?.length || 0} plugins installed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-primary" />
                <h3 className="text-lg font-medium">Configuration</h3>
              </div>
              <Button 
                variant="outline"
                onClick={() => router.push(`/chatbot/${chatbotId}/settings`)}
              >
                Edit Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Chatbot Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium">Name</h3>
            <p>{chatbot?.name}</p>
          </div>
          <div>
            <h3 className="font-medium">Created</h3>
            <p>{new Date(chatbot?.createdAt || '').toLocaleDateString()}</p>
          </div>
          <div>
            <h3 className="font-medium">Description</h3>
            <p>{chatbot?.description || 'No description provided'}</p>
          </div>
          <div>
            <h3 className="font-medium">Last Updated</h3>
            <p>{new Date(chatbot?.updatedAt || '').toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
