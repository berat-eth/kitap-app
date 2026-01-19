'use client';

import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { Chapter } from '@/lib/types';
import { Controls } from './Controls';
import { ProgressBar } from './ProgressBar';
import { SpeedControl } from './SpeedControl';

interface AudioPlayerProps {
  bookId: string;
  chapter: Chapter;
  chapters: Chapter[];
  onChapterChange?: (chapter: Chapter) => void;
}

export const AudioPlayer = ({
  bookId,
  chapter,
  chapters,
  onChapterChange,
}: AudioPlayerProps) => {
  const {
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    isLoading,
    togglePlayPause,
    seek,
    setSpeed,
    loadChapter,
  } = useAudioPlayer(bookId, chapter);

  const currentIndex = chapters.findIndex((c) => c.id === chapter.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < chapters.length - 1;

  const handlePrevious = () => {
    if (hasPrevious) {
      const prevChapter = chapters[currentIndex - 1];
      loadChapter(prevChapter);
      onChapterChange?.(prevChapter);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      const nextChapter = chapters[currentIndex + 1];
      loadChapter(nextChapter);
      onChapterChange?.(nextChapter);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-4xl mx-auto">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {chapter.title}
          </h3>
        </div>

        <ProgressBar
          currentTime={currentTime}
          duration={duration}
          onSeek={seek}
          isLoading={isLoading}
        />

        <Controls
          isPlaying={isPlaying}
          onPlayPause={togglePlayPause}
          onPrevious={hasPrevious ? handlePrevious : undefined}
          onNext={hasNext ? handleNext : undefined}
          isLoading={isLoading}
        />

        <div className="flex justify-center">
          <SpeedControl playbackRate={playbackRate} onSpeedChange={setSpeed} />
        </div>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Bölüm {currentIndex + 1} / {chapters.length}
        </div>
      </div>
    </div>
  );
};

