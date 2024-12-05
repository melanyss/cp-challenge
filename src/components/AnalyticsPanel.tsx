// Path: src\components\AnalyticsPanel.tsx
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDuration } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MetricsResponse } from '@/app/api/metrics/route';
import { Button } from './ui/button';
import { RefreshCcw } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

function MetricItem({
  title,
  value,
  alert = false,
  tooltip,
}: {
  title: string;
  value: string;
  alert?: boolean;
  tooltip: string;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="text-center p-4 bg-card rounded-lg transition-all duration-200 hover:shadow-md hover:scale-[1.02] border border-border cursor-help">
            <h3 className="text-sm text-muted-foreground mb-1">{title}</h3>
            <p
              className={`text-xl font-bold ${alert ? 'text-destructive' : ''}`}
            >
              {value}
            </p>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function AnalyticsPanel() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/metrics');
        const data = await response.json();

        if (response.status === 401) {
          router.push('/');
          return;
        }

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch metrics');
        }

        setMetrics(data);
        setError(null);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to fetch metrics';
        console.error('Error fetching metrics:', message);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, [mounted, router]);

  if (!mounted) return null;

  if (loading) {
    return (
      <Card className="mb-4">
        <CardContent className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-4">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const safeMetrics = metrics || {
    totalCalls: 0,
    failedCalls: 0,
    pendingCalls: 0,
    averageDuration: 0,
    maxDuration: 0,
    minDuration: 0,
    errorRate: 0,
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/metrics');
      const data = await response.json();

      if (response.status === 401) {
        router.push('/');
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch metrics');
      }

      setMetrics(data);
      setError(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch metrics';
      console.error('Error fetching metrics:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>
            <h2 className="text-2xl font-bold title-custom">Analytics</h2>
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
            className="h-8 w-8"
          >
            <RefreshCcw
              className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricItem
            title="Total Calls"
            value={safeMetrics.totalCalls.toString()}
            tooltip="Total number of calls processed"
          />
          <MetricItem
            title="Failed Calls"
            value={safeMetrics.failedCalls.toString()}
            alert={safeMetrics.failedCalls > 0}
            tooltip="Number of calls that failed to complete successfully"
          />
          <MetricItem
            title="Pending Calls"
            value={safeMetrics.pendingCalls.toString()}
            alert={safeMetrics.pendingCalls > 0}
            tooltip="Number of calls currently in progress"
          />
          <MetricItem
            title="Error Rate"
            value={`${safeMetrics.errorRate.toFixed(2)}%`}
            alert={safeMetrics.errorRate > 5}
            tooltip="Percentage of failed calls relative to total calls"
          />
          <MetricItem
            title="Avg Duration"
            value={formatDuration(safeMetrics.averageDuration)}
            tooltip="Average duration of all completed calls"
          />
          <MetricItem
            title="Max Duration"
            value={formatDuration(safeMetrics.maxDuration)}
            tooltip="Duration of the longest completed call"
          />
          <MetricItem
            title="Min Duration"
            value={formatDuration(safeMetrics.minDuration)}
            tooltip="Duration of the shortest completed call"
          />
        </CardContent>
      </Card>
    </div>
  );
}
