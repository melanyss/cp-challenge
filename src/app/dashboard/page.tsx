// Path: src\app\dashboard\page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { v4 as uuidv4 } from 'uuid';
import LogsPanel from '@/components/LogsPanel';
import ControlPanel from '@/components/ControlPanel';
import { isValidPhoneNumber } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import AnalyticsPanel from '@/components/AnalyticsPanel';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAnalytics } from '@/hooks/use-analytics';

export default function DashboardPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const [callId, setCallId] = useState('');
  const [fromNumber, setFromNumber] = useState('');
  const [toNumber, setToNumber] = useState('');
  const [generatedUUID, setGeneratedUUID] = useState('');
  const [callStartTime, setCallStartTime] = useState<string | null>(null);
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();

  const handleGenerateUUID = () => {
    const newUUID = uuidv4();
    setGeneratedUUID(newUUID);
    setCallId(newUUID);
    trackEvent('generate_uuid');
  };

  const handleCopyUUID = async () => {
    try {
      await navigator.clipboard.writeText(generatedUUID);
      setLogs((prev) => [...prev, 'UUID copied to clipboard']);
      trackEvent('copy_uuid_success');
    } catch (err) {
      setLogs((prev) => [...prev, 'Failed to copy UUID']);
      console.error('Failed to copy UUID:', err);
      trackEvent('copy_uuid_error', {
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  const handleApiRequest = async (type: 'call_started' | 'call_ended') => {
    if (!isValidPhoneNumber(fromNumber) || !isValidPhoneNumber(toNumber)) {
      setLogs((prev) => [
        ...prev,
        'Error: Invalid phone number format. Please check both numbers.',
      ]);
      trackEvent('invalid_phone_number', {
        from: fromNumber,
        to: toNumber,
      });
      return;
    }
    try {
      let payload;
      const timestamp = new Date().toISOString();

      if (type === 'call_started') {
        setCallStartTime(timestamp);
        payload = {
          call_id: callId,
          from: fromNumber,
          to: toNumber,
          started: timestamp,
          type,
        };
      } else {
        payload = {
          call_id: callId,
          from: fromNumber,
          to: toNumber,
          started: callStartTime,
          ended: timestamp,
          type,
        };
      }

      setLogs((prev) => [
        ...prev,
        `Sending ${type.toUpperCase()} payload: ${JSON.stringify(payload, null, 2)}`,
      ]);

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_SECRET_KEY || '',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.code === 'DUPLICATE_CALL_ID') {
          setLogs((prev) => [
            ...prev,
            `Error: ${result.error}`,
            `Hint: ${result.details}`,
          ]);
          trackEvent('duplicate_call_id', {
            call_id: callId,
          });
          handleGenerateUUID();
          return;
        }
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to process request',
        });
        trackEvent('api_error', {
          type,
          error: result.error,
          code: result.code,
        });
        throw new Error(result.error || 'Failed to process request');
      }

      toast({
        title: `Call ${type === 'call_started' ? 'started' : 'ended'} successfully`,
        description: result.message,
      });
      trackEvent('call_event_success', {
        type,
        duration:
          type === 'call_ended' && callStartTime
            ? new Date().getTime() - new Date(callStartTime).getTime()
            : undefined,
      });

      setLogs((prev) => [
        ...prev,
        `${type.toUpperCase()} Response: ${JSON.stringify(result, null, 2)}`,
      ]);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Unknown error occurred',
      });
      setLogs((prev) => [
        ...prev,
        `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
      ]);
      trackEvent('api_error', {
        type,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      trackEvent('user_logout_success');
      router.push('/');
      router.refresh();
    } catch (error) {
      trackEvent('user_logout_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      console.error('Error signing out:', error);
      setLogs((prev) => [
        ...prev,
        `Error signing out: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ]);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('Session check error:', error);
          router.replace('/');
          return;
        }

        if (!session) {
          router.replace('/');
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Session check error:', error);
        router.replace('/');
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.replace('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase.auth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 space-y-6 h-screen pt-6">
      <div className="flex flex-col items-center relative mb-6">
        <h1 className="text-4xl font-bold title-custom">Dashboard</h1>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="absolute top-0 right-0 text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      <AnalyticsPanel />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4">
          <LogsPanel logs={logs} onClearLogs={handleClearLogs} />
        </div>
        <div className="col-span-8">
          <ControlPanel
            callId={callId}
            fromNumber={fromNumber}
            toNumber={toNumber}
            generatedUUID={generatedUUID}
            onCallIdChange={setCallId}
            onFromNumberChange={setFromNumber}
            onToNumberChange={setToNumber}
            onGenerateUUID={handleGenerateUUID}
            onCopyUUID={handleCopyUUID}
            onCallStarted={() => handleApiRequest('call_started')}
            onCallEnded={() => handleApiRequest('call_ended')}
          />
        </div>
      </div>
    </div>
  );
}
