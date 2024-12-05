// Path: src\app\components\ControlPanel.tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ControlPanelProps } from '@/types/types';
import { PhoneNumberInput } from '@/components/PhoneNumberInput';
import { isValidPhoneNumber } from '@/lib/utils';

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
}: ControlPanelProps) {
  const isFormValid = () => {
    return (
      callId && isValidPhoneNumber(fromNumber) && isValidPhoneNumber(toNumber)
    );
  };

  return (
    <div className="h-full bg-card p-6 rounded-lg shadow-md">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>
            <h2 className="text-2xl font-bold mb-4 title-custom">
              Mock API Tester
            </h2>
          </CardTitle>
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
          <PhoneNumberInput
            value={fromNumber}
            onChange={onFromNumberChange}
            placeholder="From Number"
          />
          <PhoneNumberInput
            value={toNumber}
            onChange={onToNumberChange}
            placeholder="To Number"
          />

          <div className="flex gap-4">
            <Button
              onClick={onCallStarted}
              className="flex-1"
              variant="default"
              disabled={!isFormValid()}
            >
              Send &quot;Call Started&quot;
            </Button>
            <Button
              onClick={onCallEnded}
              className="flex-1"
              variant="secondary"
              disabled={!isFormValid()}
            >
              Send &quot;Call Ended&quot;
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
