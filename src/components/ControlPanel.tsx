// Path: src\app\components\ControlPanel.tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ControlPanelProps } from '@/types/types';

export default function ControlPanel({
  callId,
  fromNumber,
  toNumber,
  generatedUUID,
  onCallIdChange,
  onFromNumberChange,
  onToNumberChange,
  onGenerateUUID,
  onCopyUUID,
  onCallStarted,
  onCallEnded,
  onLogout,
}: ControlPanelProps) {
  return (
    <div className="w-2/3 p-6">
      <div className="mb-6 flex justify-end">
        <Button
          onClick={onLogout}
          variant="outline"
          className="text-muted-foreground hover:text-destructive"
        >
          Sign Out
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Mock API Tester</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button onClick={onGenerateUUID} variant="secondary">
                Generate UUID
              </Button>
              {generatedUUID && (
                <Button onClick={onCopyUUID} variant="outline">
                  Copy UUID
                </Button>
              )}
            </div>
          </div>

          <Input
            placeholder="Call ID"
            value={callId}
            onChange={(e) => onCallIdChange(e.target.value)}
          />
          <Input
            placeholder="From Number"
            value={fromNumber}
            onChange={(e) => onFromNumberChange(e.target.value)}
          />
          <Input
            placeholder="To Number"
            value={toNumber}
            onChange={(e) => onToNumberChange(e.target.value)}
          />

          <div className="flex gap-4">
            <Button
              onClick={onCallStarted}
              className="flex-1"
              variant="default"
            >
              Send &quot;Call Started&quot;
            </Button>
            <Button
              onClick={onCallEnded}
              className="flex-1"
              variant="secondary"
            >
              Send &quot;Call Ended&quot;
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
