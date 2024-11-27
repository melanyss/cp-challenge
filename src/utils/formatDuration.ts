// Path: src\utils\formatDuration.ts
export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '0s';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }

  parts.push(`${remainingSeconds}s`);

  return parts.join(' ');
}
