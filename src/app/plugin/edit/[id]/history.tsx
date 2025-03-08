import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Clock, RotateCcw, Eye } from 'lucide-react';
import { getPluginVersions, restorePluginVersion } from '@/services/plugin.service';

interface PluginVersion {
  id: number;
  pluginId: number;
  versionNumber: number;
  name: string;
  code: string;
  createdAt: Date;
  isCurrent: boolean;
}

interface VersionHistoryProps {
  readonly pluginId: number;
  readonly onVersionRestore: () => void;
}

export default function VersionHistory({ pluginId, onVersionRestore }: VersionHistoryProps) {
  const [versions, setVersions] = useState<PluginVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<PluginVersion | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    async function loadVersions() {
      if (!pluginId) return;
      
      try {
        setIsLoading(true);
        const versionsData = await getPluginVersions({ pluginId });
        setVersions(versionsData);
      } catch (err) {
        console.error('Failed to load plugin versions:', err);
        setError('Failed to load version history');
      } finally {
        setIsLoading(false);
      }
    }

    loadVersions();
  }, [pluginId]);

  const handleViewVersion = (version: PluginVersion) => {
    setSelectedVersion(version);
    setIsDialogOpen(true);
  };

  const handleRestoreVersion = async () => {
    if (!selectedVersion || selectedVersion.isCurrent) return;
    
    try {
      setIsRestoring(true);
      await restorePluginVersion({
        pluginId,
        versionNumber: selectedVersion.versionNumber,
      });
      
      setIsDialogOpen(false);
      onVersionRestore();
    } catch (err) {
      console.error('Failed to restore version:', err);
      setError('Failed to restore version');
    } finally {
      setIsRestoring(false);
    }
  };

  // Render loading state
  const renderLoadingState = () => (
    <div className="text-center py-6">
      <p>Loading version history...</p>
    </div>
  );

  // Render error state
  const renderErrorState = () => (
    <div className="text-center py-6 text-red-500">
      <p>{error}</p>
    </div>
  );

  // Render empty state
  const renderEmptyState = () => (
    <div className="text-center py-6 text-gray-500">
      <p>No version history available</p>
    </div>
  );

  // Render version list
  const renderVersionList = () => (
    <ScrollArea className="h-60 rounded-md border">
      <div className="p-4 space-y-2">
        {versions.map((version) => (
          <Card key={`${version.pluginId}-${version.versionNumber}`} className="p-0 overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 flex items-center justify-between bg-slate-50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Version {version.versionNumber}</span>
                    {version.isCurrent && (
                      <Badge variant="outline" className="bg-green-50 text-green-600 hover:bg-green-50">
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" /> 
                    {new Date(version.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleViewVersion(version)}
                  >
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                  
                  {!version.isCurrent && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewVersion(version)}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" /> Restore
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Version History</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            // Refresh version history
            setIsLoading(true);
            getPluginVersions({ pluginId })
              .then(setVersions)
              .catch(err => {
                console.error(err);
                setError('Failed to refresh version history');
              })
              .finally(() => setIsLoading(false));
          }}
        >
          Refresh
        </Button>
      </div>

      {/* Conditional rendering based on state */}
      {(() => {
        if (isLoading) {
          return renderLoadingState();
        }
        if (error) {
          return renderErrorState();
        }
        if (versions.length === 0) {
          return renderEmptyState();
        }
        return renderVersionList();
      })()}

      {selectedVersion && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                Version {selectedVersion.versionNumber}
                {selectedVersion.isCurrent && (
                  <span className="ml-2 inline-block">
                    <Badge variant="outline" className="bg-green-50 text-green-600">
                      Current
                    </Badge>
                  </span>
                )}
              </DialogTitle>
              <DialogDescription>
                Created on {new Date(selectedVersion.createdAt).toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Name</h4>
                <div className="p-2 bg-slate-50 rounded">{selectedVersion.name}</div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Code</h4>
                <ScrollArea className="h-60 w-full rounded-md border">
                  <pre className="p-4 whitespace-pre-wrap break-words overflow-auto font-mono text-sm">
                    {selectedVersion.code}
                  </pre>
                </ScrollArea>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Close
              </Button>
              
              {!selectedVersion.isCurrent && (
                <Button
                  onClick={handleRestoreVersion}
                  disabled={isRestoring}
                >
                  {isRestoring ? 'Restoring...' : 'Restore This Version'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
