// Path: src\components\PhoneNumberInput.tsx
import { Input } from '@/components/ui/input';
import { isValidPhoneNumber } from '@/lib/utils';
import { useState } from 'react';

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export function PhoneNumberInput({
  value,
  onChange,
  placeholder,
}: PhoneNumberInputProps) {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (newValue && !isValidPhoneNumber(newValue)) {
      setError('Please enter a valid phone number');
    } else {
      setError(null);
    }
  };

  return (
    <div className="space-y-2">
      <Input
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={error ? 'border-destructive' : ''}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
