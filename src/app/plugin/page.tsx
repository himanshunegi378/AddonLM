'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Plus, Trash, Edit } from 'lucide-react';
import { getDeveloperPlugins, getOrCreateDeveloper } from '@/services/plugin.service';
import { useUserStore } from '@/stores/user/userStore';
import Link from 'next/link';

interface Plugin {
  id: number;
  name: string;
  code: string;
  version: number;
  developerId: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function PluginPage() {
  const router = useRouter();
  const { id: userId } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [developerId, setDeveloperId] = useState<number | null>(null);

  useEffect(() => {
    async function initializeDeveloper() {
      if (userId && userId > 0) {
        try {
          const developer = await getOrCreateDeveloper(userId);
          setDeveloperId(developer.id);
        } catch (error) {
          console.error('Failed to initialize developer:', error);
        }
      }
    }

    initializeDeveloper();
  }, [userId]);

  useEffect(() => {
    async function loadPlugins() {
      if (developerId) {
        try {
          setIsLoading(true);
          const userPlugins = await getDeveloperPlugins({ 
            developerId 
          });
          setPlugins(userPlugins);
        } catch (error) {
          console.error('Failed to load plugins:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }

    if (developerId) {
      loadPlugins();
    }
  }, [developerId]);

  const filteredPlugins = plugins.filter(plugin =>
    plugin.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">My Plugins</h1>
        <p className="text-gray-600 mb-6">
          Create and manage your custom plugins
        </p>
        <div className="flex justify-between items-center gap-4">
          <Input
            type="text"
            placeholder="Search my plugins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
          <Button 
            onClick={() => router.push('/plugin/add')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Create New Plugin
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <p>Loading your plugins...</p>
        </div>
      ) : (
        <>
          {plugins.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium mb-2">No plugins created yet</h3>
              <p className="text-gray-600 mb-4">Create your first plugin to get started</p>
              <Button onClick={() => router.push('/plugin/add')}>
                Create a Plugin
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlugins.map((plugin) => (
                <Card key={plugin.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle>{plugin.name}</CardTitle>
                    <CardDescription>
                      Created: {new Date(plugin.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">Last updated: {new Date(plugin.updatedAt).toLocaleDateString()}</p>
                    <p className="text-sm font-medium mt-2">Version: {plugin.version}</p>
                  </CardContent>
                  <CardFooter className="mt-auto flex gap-2">
                    <Link href={`/plugin/edit/${plugin.id}`} className="flex-1">
                      <Button variant="secondary" className="w-full flex items-center gap-2">
                        <Edit className="h-4 w-4" /> Edit
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      className="flex items-center gap-2"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this plugin?')) {
                          // Logic to delete the plugin will be implemented here
                          console.log('Delete plugin:', plugin.id);
                        }
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
