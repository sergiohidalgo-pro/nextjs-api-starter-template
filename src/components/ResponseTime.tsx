'use client';

interface ResponseTimeProps {
  responseTime?: number;
  className?: string;
}

export function ResponseTime({ responseTime, className = '' }: ResponseTimeProps) {
  if (responseTime === undefined || responseTime === null) {
    return null;
  }

  const formatTime = (ms: number): string => {
    if (ms < 1000) {
      return `${ms.toFixed(0)}ms`;
    } else if (ms < 10000) {
      return `${(ms / 1000).toFixed(2)}s`;
    } else {
      return `${(ms / 1000).toFixed(1)}s`;
    }
  };

  const getTimeColor = (ms: number): string => {
    if (ms < 100) return 'text-green-600 dark:text-green-400';
    if (ms < 500) return 'text-yellow-600 dark:text-yellow-400';
    if (ms < 1000) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getTimeIcon = (ms: number): string => {
    if (ms < 100) return '🚀';
    if (ms < 500) return '⚡';
    if (ms < 1000) return '⏱️';
    return '🐌';
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="text-xs">{getTimeIcon(responseTime)}</span>
      <span className={`text-xs font-mono font-medium ${getTimeColor(responseTime)}`}>
        {formatTime(responseTime)}
      </span>
    </div>
  );
}