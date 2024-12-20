// Path: src\app\components\LogsPanel.tsx
import { LogsPanelProps } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export default function LogsPanel({ logs, onClearLogs }: LogsPanelProps) {
  return (
    <div className="h-full bg-card p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold title-custom">Logs</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearLogs}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Delete Logs
        </Button>
      </div>
      <div className="overflow-auto h-[300px] border rounded-lg bg-background p-4">
        {logs.map((log, idx) => (
          <p key={idx} className="text-sm text-muted-foreground mb-2">
            {log}
          </p>
        ))}
      </div>
    </div>
  );
}
