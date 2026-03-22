import { useCallback, useState } from 'react';
import { Headphones } from 'lucide-react';
import { ApiError, probeAudioDurationSeconds, uploadAsset } from '../lib/api';
import MediaUploadButton from './MediaUploadButton';

const AUDIO_EXT = /\.(mp3|m4a|aac|wav|ogg|oga|opus|webm|flac)$/i;

function looksLikeAudioFile(file: File): boolean {
  if (file.type.startsWith('audio/')) return true;
  return AUDIO_EXT.test(file.name);
}

type Props = {
  disabled?: boolean;
  bookId?: string;
  onUploaded: (url: string) => void;
  onAudioDuration?: (seconds: number | null) => void;
  onError?: (message: string) => void;
  /** Yükleme sonrası gösterilecek kısa metin */
  statusHint?: string;
};

export default function AudioUploadField({
  disabled,
  bookId,
  onUploaded,
  onAudioDuration,
  onError,
  statusHint,
}: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      if (!looksLikeAudioFile(file)) {
        onError?.('Lütfen ses dosyası seçin (MP3, M4A, WAV, OGG, FLAC…)');
        return;
      }
      setBusy(true);
      try {
        if (onAudioDuration) {
          void probeAudioDurationSeconds(file).then(onAudioDuration);
        }
        const url = await uploadAsset(file, bookId ? { bookId } : undefined);
        onUploaded(url);
      } catch (err) {
        const msg =
          err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Yükleme başarısız';
        onError?.(msg);
      } finally {
        setBusy(false);
      }
    },
    [bookId, onAudioDuration, onError, onUploaded]
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        <Headphones className="h-4 w-4 text-accent" aria-hidden />
        Ses dosyası
      </div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled && !busy) setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file && !disabled && !busy) void processFile(file);
        }}
        className={`rounded-xl border-2 border-dashed p-4 transition-colors ${
          dragOver
            ? 'border-accent bg-accent/15'
            : 'border-accent/30 bg-accent/[0.07] hover:border-accent/50'
        }`}
      >
        <p className="mb-3 text-sm text-zinc-300">
          MP3, M4A, AAC, WAV, OGG, Opus, WebM (ses), FLAC
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <MediaUploadButton
            variant="audio"
            bookId={bookId}
            accept="audio/*,.mp3,.m4a,.aac,.wav,.ogg,.opus,.webm,.flac"
            label={busy ? 'Yükleniyor…' : 'Dosya seç ve yükle'}
            disabled={disabled || busy}
            onUploaded={onUploaded}
            onAudioDuration={onAudioDuration}
            onError={onError}
            buttonClassName="inline-flex items-center gap-2 rounded-xl border border-accent/50 bg-accent/20 px-4 py-2.5 text-sm font-semibold text-accent-glow hover:bg-accent/30 disabled:opacity-50"
          />
          <span className="text-xs text-zinc-500">veya dosyayı buraya sürükleyin</span>
        </div>
        {statusHint ? (
          <p className="mt-3 truncate text-xs text-emerald-400/90" title={statusHint}>
            {statusHint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
