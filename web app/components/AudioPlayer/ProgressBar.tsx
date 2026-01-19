'use client';

import { useRef, useEffect } from 'react';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  isLoading?: boolean;
}

export const ProgressBar = ({ currentTime, duration, onSeek, isLoading }: ProgressBarProps) => {
  const progressRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || duration === 0) return;

    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    onSeek(newTime);
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full">
      <div
        ref={progressRef}
        onClick={handleClick}
        className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer group"
      >
        <div
          className="absolute h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-150"
          style={{ width: `${progressPercentage}%` }}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse" />
        )}
      </div>
      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

