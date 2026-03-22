import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { ApiError, probeAudioDurationSeconds, uploadAsset } from '../lib/api';

type Props = {
  accept: string;
  label: string;
  disabled?: boolean;
  variant: 'audio' | 'image';
  /** Bölüm sesi: dosya uploads/books/<kitap>__/audio/ altına gider */
  bookId?: string;
  onUploaded: (url: string) => void;
  onAudioDuration?: (seconds: number | null) => void;
  onError?: (message: string) => void;
  buttonClassName?: string;
};

export default function MediaUploadButton({
  accept,
  label,
  disabled,
  variant,
  bookId,
  onUploaded,
  onAudioDuration,
  onError,
  buttonClassName,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || disabled || busy) return;
    setBusy(true);
    try {
      if (variant === 'audio' && onAudioDuration) {
        void probeAudioDurationSeconds(file).then(onAudioDuration);
      }
      const url = await uploadAsset(file, variant === 'audio' && bookId ? { bookId } : undefined);
      onUploaded(url);
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Yükleme başarısız';
      onError?.(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(ev) => void onChange(ev)}
        disabled={disabled || busy}
      />
      <button
        type="button"
        disabled={disabled || busy}
        onClick={() => inputRef.current?.click()}
        className={
          buttonClassName ||
          'inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300 hover:border-accent/40 hover:text-white disabled:opacity-50'
        }
      >
        <Upload className="h-3.5 w-3.5 shrink-0" />
        {busy ? 'Yükleniyor…' : label}
      </button>
    </>
  );
}
