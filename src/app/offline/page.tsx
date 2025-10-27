/**
 * Offline page for RETINA CNN System
 * Displayed when user is offline or network is unavailable
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  WifiOff, Database, Brain, Image, History, 
  RefreshCw, CheckCircle, AlertCircle, Clock,
  Activity, BarChart3, Download, Upload
} from 'lucide-react';
import { useOfflineStorage } from '@/lib/offline-storage';
import Link from 'next/link';

export default function OfflinePage() {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const { 
    storageUsage, 
    refreshStorageUsage,
    getAllModels,
    getUnsyncedDetectionResults,
    getUnsyncedTrainingSessions
  } = useOfflineStorage();

  const [cachedModels, setCachedModels] = useState<any[]>([]);
  const [stats, setStats] = useState({
    models: 0,
    detections: 0,
    training: 0,
    storage: 0
  });

  useEffect(() => {
    loadOfflineData();
  }, []);

  const loadOfflineData = async () => {
    try {
      const [models, detections, training] = await Promise.all([
        getAllModels(),
        getUnsyncedDetectionResults(),
        getUnsyncedTrainingSessions()
      ]);

      setCachedModels(models);
      setStats({
        models: models.length,
        detections: detections.length,
        training: training.length,
        storage: Object.values(storageUsage).reduce((a, b) => a + b, 0)
      });
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  };

  const handleRetryConnection = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      // Try to fetch a small resource to test connectivity
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache'
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      // Still offline
      setTimeout(() => {
        setIsRetrying(false);
      }, 2000);
    }
  };

  const getRetryMessage = () => {
    if (retryCount === 0) return 'Check your internet connection and try again';
    if (retryCount < 3) return 'Still offline. Let\'s try again...';
    if (retryCount < 5) return 'Connection is taking longer than expected...';
    return 'You can continue using offline features while we keep trying';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-red-100 rounded-full">
              <WifiOff className="h-12 w-12 text-red-600" />
            </div>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">You're Offline</h1>
            <p className="text-gray-600 mt-2">
              RETINA is working offline. Some features may be limited.
            </p>
          </div>

          <Button
            onClick={handleRetryConnection}
            disabled={isRetrying}
            size="lg"
            className="bg-green-600 hover:bg-green-700"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Checking Connection...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Connection
              </>
            )}
          </Button>

          <p className="text-sm text-gray-500">
            {getRetryMessage()}
          </p>
        </div>

        {/* Offline Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Brain className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.models}</div>
              <p className="text-sm text-gray-600">Cached Models</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.detections}</div>
              <p className="text-sm text-gray-600">Pending Detections</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.training}</div>
              <p className="text-sm text-gray-600">Training Sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Database className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.storage}</div>
              <p className="text-sm text-gray-600">Cached Items</p>
            </CardContent>
          </Card>
        </div>

        {/* Available Offline Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Available Offline Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <Brain className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">CNN Detection</h4>
                  <p className="text-sm text-gray-600">
                    Use cached models to analyze retinal images
                  </p>
                  <Link href="/cnn-detection">
                    <Button variant="outline" size="sm" className="mt-2">
                      Open Detection
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <History className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">View History</h4>
                  <p className="text-sm text-gray-600">
                    Browse past detection results and training sessions
                  </p>
                  <Link href="/cnn-models">
                    <Button variant="outline" size="sm" className="mt-2">
                      View Models
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <Image className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Image Management</h4>
                  <p className="text-sm text-gray-600">
                    Manage and organize your retinal image library
                  </p>
                  <Button variant="outline" size="sm" className="mt-2" disabled>
                    Coming Soon
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <Download className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Model Training</h4>
                  <p className="text-sm text-gray-600">
                    Limited training capabilities available offline
                  </p>
                  <Button variant="outline" size="sm" className="mt-2" disabled>
                    Limited Offline
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cached Models */}
        {cachedModels.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                Cached CNN Models
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cachedModels.map((model) => (
                  <div key={model.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{model.name}</h4>
                      <p className="text-sm text-gray-600">
                        {model.diseaseType} • {model.metadata.accuracy?.toFixed(1)}% accuracy
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Cached</Badge>
                      <Button variant="outline" size="sm">
                        Use Model
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sync Status */}
        {(stats.detections > 0 || stats.training > 0) && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>
                  You have {stats.detections + stats.training} items that will sync automatically when you're back online.
                </span>
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm">Pending Sync</span>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Offline Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">What you can do:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Analyze retinal images with cached models</li>
                  <li>• View past detection results</li>
                  <li>• Browse your model library</li>
                  <li>• Manage local data and settings</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">What requires internet:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Downloading new models</li>
                  <li>• Full model training capabilities</li>
                  <li>• Cloud data synchronization</li>
                  <li>• Software updates</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}