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

  const handleGenerateUUID = () => {
    const newUUID = uuidv4();
    setGeneratedUUID(newUUID);
    setCallId(newUUID);
  };

  const handleCopyUUID = async () => {
    try {
      await navigator.clipboard.writeText(generatedUUID);
      setLogs((prev) => [...prev, 'UUID copied to clipboard']);
    } catch (err) {
      setLogs((prev) => [...prev, 'Failed to copy UUID']);
      console.error('Failed to copy UUID:', err);
    }
  };

  const handleApiRequest = async (type: 'call_started' | 'call_ended') => {
    if (!isValidPhoneNumber(fromNumber) || !isValidPhoneNumber(toNumber)) {
      setLogs((prev) => [
        ...prev,
        'Error: Invalid phone number format. Please check both numbers.',
      ]);
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
        // Handling duplicate call ID
        if (result.code === 'DUPLICATE_CALL_ID') {
          setLogs((prev) => [
            ...prev,
            `Error: ${result.error}`,
            `Hint: ${result.details}`,
          ]);
          // new UUID generated automatically
          handleGenerateUUID();
          return;
        }
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to process request',
        });
        throw new Error(result.error || 'Failed to process request');
      }

      toast({
        title: `Call ${type === 'call_started' ? 'started' : 'ended'} successfully`,
        description: result.message,
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
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Redirect to main page with log in form if no session is found
      if (!session) {
        router.push('/');
      } else {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [supabase, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
      setLogs((prev) => [
        ...prev,
        `Error signing out: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ]);
    }
  };

  return (
    <div className="flex min-h-screen bg-background p-4 gap-4">
      <LogsPanel logs={logs} onClearLogs={handleClearLogs} />
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
        onLogout={handleLogout}
      />
    </div>
  );
}
