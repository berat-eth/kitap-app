'use client';

interface SpeedControlProps {
  playbackRate: number;
  onSpeedChange: (rate: number) => void;
}

const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export const SpeedControl = ({ playbackRate, onSpeedChange }: SpeedControlProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 dark:text-gray-400">Hız:</span>
      <select
        value={playbackRate}
        onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
        className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {speedOptions.map((speed) => (
          <option key={speed} value={speed}>
            {speed}x
          </option>
        ))}
      </select>
    </div>
  );
};

