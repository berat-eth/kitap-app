'use client';

import { Chapter } from '@/lib/types';

interface ChapterListProps {
  chapters: Chapter[];
  currentChapterId: string | null;
  onChapterSelect: (chapter: Chapter) => void;
}

export const ChapterList = ({
  chapters,
  currentChapterId,
  onChapterSelect,
}: ChapterListProps) => {
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Bölümler
      </h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {chapters.map((chapter) => (
          <button
            key={chapter.id}
            onClick={() => onChapterSelect(chapter)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              currentChapterId === chapter.id
                ? 'bg-blue-600 text-white dark:bg-blue-500'
                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">{chapter.title}</p>
                {chapter.duration && (
                  <p
                    className={`text-sm ${
                      currentChapterId === chapter.id
                        ? 'text-blue-100'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {formatDuration(chapter.duration)}
                  </p>
                )}
              </div>
              {currentChapterId === chapter.id && (
                <svg
                  className="w-5 h-5 ml-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

