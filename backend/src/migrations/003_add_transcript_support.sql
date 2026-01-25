-- Add transcript support to chapters table

USE audiobook_db;

-- Add transcript columns to chapters table
ALTER TABLE chapters
ADD COLUMN transcript_file_url VARCHAR(500) NULL AFTER audio_file_size,
ADD COLUMN transcript_file_size BIGINT NULL AFTER transcript_file_url;

-- Add index for transcript file URL (optional, for faster lookups)
CREATE INDEX idx_transcript_file_url ON chapters(transcript_file_url) WHERE transcript_file_url IS NOT NULL;
