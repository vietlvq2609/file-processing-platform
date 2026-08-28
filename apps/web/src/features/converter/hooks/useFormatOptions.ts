const FORMAT_MAP: Record<string, string[]> = {
  'image/': ['PNG', 'JPEG', 'WEBP'],
  'application/pdf': ['DOCX', 'PNG', 'TXT'],
  'video/': ['MP4', 'WEBM', 'GIF', 'MP3'],
  'audio/': ['MP3', 'WAV', 'OGG', 'FLAC'],
};

export function getFormatOptions(mimeType: string): string[] {
  for (const [prefix, formats] of Object.entries(FORMAT_MAP)) {
    if (mimeType.startsWith(prefix)) return formats;
  }
  return [];
}

export function useFormatOptions(mimeType: string): string[] {
  return getFormatOptions(mimeType);
}
