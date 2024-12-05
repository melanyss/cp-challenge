// Path: src\types\types.ts
export type Database = {
  public: {
    Tables: {
      calls: {
        Row: {
          id: string;
          from_number: string;
          to_number: string;
          started: string;
          ended?: string;
          duration?: number;
          status: 'started' | 'ended' | 'failed';
        };
        Insert: {
          id: string;
          from_number: string;
          to_number: string;
          started: string;
          ended?: string;
          duration?: number;
          status: 'started' | 'ended' | 'failed';
        };
        Update: {
          id?: string;
          from_number?: string;
          to_number?: string;
          started?: string;
          ended?: string;
          duration?: number;
          status?: 'started' | 'ended' | 'failed';
        };
      };
    };
  };
};

export interface Call {
  id: string;
  from_number: string;
  to_number: string;
  started: string;
  ended?: string;
  duration?: number;
  status: 'started' | 'ended' | 'failed';
}

export interface LogsPanelProps {
  logs: string[];
  onClearLogs: () => void;
}

export interface ControlPanelProps {
  callId: string;
  fromNumber: string;
  toNumber: string;
  generatedUUID: string;
  onCallIdChange: (value: string) => void;
  onFromNumberChange: (value: string) => void;
  onToNumberChange: (value: string) => void;
  onGenerateUUID: () => void;
  onCopyUUID: () => void;
  onCallStarted: () => void;
  onCallEnded: () => void;
}

export interface Metrics {
  totalCalls: number;
  failedCalls: number;
  pendingCalls: number;
  averageDuration: number;
  maxDuration: number;
  minDuration: number;
  errorRate: number;
}
