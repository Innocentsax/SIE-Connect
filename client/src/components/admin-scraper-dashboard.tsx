import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Play, Square, RefreshCw, Clock, CheckCircle, XCircle, AlertTriangle, Brain, Zap } from 'lucide-react';
import { IntelligentScraperDashboard } from './intelligent-scraper-dashboard';

interface ScraperStatus {
  running: boolean;
  enabled: boolean;
  lastRun: string | null;
  nextRun: string | null;
  interval: number;
  config: {
    scrapeInterval: number;
    enabled: boolean;
    maxRetries: number;
    retryDelay: number;
  };
}

interface ImportResult {
  startups: number;
  opportunities: number;
  errors: string[];
}

export function AdminScraperDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isManualScraping, setIsManualScraping] = useState(false);

  // Fetch scraper status
  const { data: status, isLoading, error } = useQuery({
    queryKey: ['admin', 'scraper', 'status'],
    queryFn: () => api.get<ScraperStatus>('/api/admin/scraper/status'),
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  // Start scheduler mutation
  const startMutation = useMutation({
    mutationFn: () => api.post('/api/admin/scraper/start'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'scraper', 'status'] });
      toast({
        title: 'Scheduler Started',
        description: 'Automatic data scraping has been enabled',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Stop scheduler mutation
  const stopMutation = useMutation({
    mutationFn: () => api.post('/api/admin/scraper/stop'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'scraper', 'status'] });
      toast({
        title: 'Scheduler Stopped',
        description: 'Automatic data scraping has been disabled',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Manual trigger mutation
  const triggerMutation = useMutation({
    mutationFn: () => api.post<{ imported: ImportResult }>('/api/admin/scraper/trigger'),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'scraper', 'status'] });
      toast({
        title: 'Manual Scraping Completed',
        description: `Imported ${data.imported.startups} startups and ${data.imported.opportunities} opportunities`,
      });
      setIsManualScraping(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Scraping Failed',
        description: error.message,
        variant: 'destructive',
      });
      setIsManualScraping(false);
    },
  });

  const handleManualTrigger = () => {
    setIsManualScraping(true);
    triggerMutation.mutate();
  };

  const formatInterval = (ms: number): string => {
    const hours = ms / (1000 * 60 * 60);
    if (hours >= 24) {
      return `${Math.floor(hours / 24)} days`;
    }
    return `${Math.floor(hours)} hours`;
  };

  const formatDateTime = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Loading Scraper Status...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="w-4 h-4" />
        <AlertDescription>
          Failed to load scraper status. You may need admin permissions.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Data Intelligence Center</h2>
          <p className="text-muted-foreground">
            AI-powered ecosystem data collection and traditional scheduled scraping
          </p>
        </div>
        <Badge variant={status?.running ? 'default' : 'secondary'} className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Scheduler: {status?.running ? 'Running' : 'Stopped'}
        </Badge>
      </div>

      <Tabs defaultValue="ai-powered" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ai-powered" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Intelligence
          </TabsTrigger>
          <TabsTrigger value="scheduler" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Automated Scheduler
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-powered">
          <IntelligentScraperDashboard />
        </TabsContent>

        <TabsContent value="scheduler" className="space-y-6">
          {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {status?.running ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-2xl font-bold">
                {status?.running ? 'Active' : 'Inactive'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Interval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-2xl font-bold">
                {status ? formatInterval(status.interval) : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Run</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {formatDateTime(status?.lastRun || null)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Next Run</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {formatDateTime(status?.nextRun || null)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduler Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button
              onClick={() => startMutation.mutate()}
              disabled={status?.running || startMutation.isPending}
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Start Scheduler
            </Button>

            <Button
              variant="outline"
              onClick={() => stopMutation.mutate()}
              disabled={!status?.running || stopMutation.isPending}
              className="flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              Stop Scheduler
            </Button>

            <Button
              variant="secondary"
              onClick={handleManualTrigger}
              disabled={isManualScraping || triggerMutation.isPending}
              className="flex items-center gap-2"
            >
              {isManualScraping ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Manual Scrape
            </Button>
          </div>

          {(startMutation.isPending || stopMutation.isPending || isManualScraping) && (
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                {startMutation.isPending && 'Starting scheduler...'}
                {stopMutation.isPending && 'Stopping scheduler...'}
                {isManualScraping && 'Running manual data scraping...'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Configuration Details */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Scheduler Settings</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Enabled:</span>
                  <Badge variant={status?.config.enabled ? 'default' : 'secondary'}>
                    {status?.config.enabled ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Scrape Interval:</span>
                  <span>{status ? formatInterval(status.config.scrapeInterval) : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Retries:</span>
                  <span>{status?.config.maxRetries || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Retry Delay:</span>
                  <span>{status ? `${status.config.retryDelay / 1000 / 60} min` : 'N/A'}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Data Sources</h4>
              <div className="space-y-1 text-sm">
                <div>• Cradle Fund Malaysia</div>
                <div>• MDEC Digital Economy</div>
                <div>• MAVCAP Ventures</div>
                <div>• Government Agencies</div>
                <div>• SME Corporation Malaysia</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Alert>
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>
          <strong>Production Note:</strong> The webscraper currently requires proper API keys 
          and external service credentials to fetch real data from Malaysian ecosystem sources. 
          Contact system administrator to configure production data sources.
        </AlertDescription>
      </Alert>
        
        </TabsContent>
      </Tabs>
    </div>
  );
}