/**
 * Subtitle and Video Layout Templates
 */

export interface SubtitlePreset {
  id: string;
  name: string;
  fontSize: number;
  fontFamily: string;
  fontColor: string;
  highlightColor: string;
  strokeColor: string;
  strokeWidth: number;
  shadowColor: string;
  shadowBlur: number;
  backgroundColor?: string;
  position: 'bottom' | 'middle' | 'top';
  maxWordsPerLine: number;
  maxLines: number;
  uppercase: boolean;
}

export const SUBTITLE_PRESETS: Record<string, SubtitlePreset> = {
  'Bold Creator': {
    id: 'bold_creator',
    name: 'Bold Creator',
    fontSize: 54,
    fontFamily: 'Montserrat Black, Impact, sans-serif',
    fontColor: '#FFFFFF',
    highlightColor: '#FFE600',
    strokeColor: '#000000',
    strokeWidth: 8,
    shadowColor: 'rgba(0,0,0,0.85)',
    shadowBlur: 10,
    position: 'middle',
    maxWordsPerLine: 4,
    maxLines: 2,
    uppercase: true
  },
  'Clean Minimal': {
    id: 'clean_minimal',
    name: 'Clean Minimal',
    fontSize: 42,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontColor: '#FFFFFF',
    highlightColor: '#60A5FA',
    strokeColor: 'rgba(0,0,0,0.5)',
    strokeWidth: 3,
    shadowColor: 'rgba(0,0,0,0.5)',
    shadowBlur: 6,
    position: 'bottom',
    maxWordsPerLine: 6,
    maxLines: 2,
    uppercase: false
  },
  'Documentary': {
    id: 'documentary',
    name: 'Documentary Subtitle',
    fontSize: 38,
    fontFamily: 'Georgia, serif',
    fontColor: '#F3F4F6',
    highlightColor: '#FBBF24',
    strokeColor: '#111827',
    strokeWidth: 4,
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowBlur: 8,
    position: 'bottom',
    maxWordsPerLine: 7,
    maxLines: 2,
    uppercase: false
  },
  'Karaoke Highlight': {
    id: 'karaoke_highlight',
    name: 'Karaoke Highlight',
    fontSize: 52,
    fontFamily: 'Arial Black, sans-serif',
    fontColor: '#E2E8F0',
    highlightColor: '#22C55E',
    strokeColor: '#0F172A',
    strokeWidth: 7,
    shadowColor: 'rgba(0,0,0,0.8)',
    shadowBlur: 12,
    position: 'middle',
    maxWordsPerLine: 4,
    maxLines: 1,
    uppercase: true
  }
};

/**
 * Generate ASS (Advanced SubStation Alpha) subtitle file content from word timestamps
 */
export function generateAssSubtitles(
  words: { word: string; start: number; end: number }[],
  preset: SubtitlePreset,
  videoWidth: number = 1080,
  videoHeight: number = 1920
): string {
  const marginV = preset.position === 'bottom' ? 180 : preset.position === 'middle' ? 900 : 200;

  const header = `[Script Info]
Title: Generated Captions
ScriptType: v4.00+
PlayResX: ${videoWidth}
PlayResY: ${videoHeight}
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${preset.fontFamily.split(',')[0].trim()},${preset.fontSize},&H00FFFFFF,&H0000E6FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,${preset.strokeWidth},2,${preset.position === 'middle' ? 5 : 2},40,40,${marginV},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  function formatTime(sec: number): string {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    const cs = Math.floor((sec % 1) * 100);
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  }

  // Group words into short punchy groups (e.g. 3-4 words)
  const chunks: { words: { word: string; start: number; end: number }[]; start: number; end: number }[] = [];
  const chunkSize = preset.maxWordsPerLine;

  for (let i = 0; i < words.length; i += chunkSize) {
    const slice = words.slice(i, i + chunkSize);
    if (slice.length > 0) {
      chunks.push({
        words: slice,
        start: slice[0].start,
        end: slice[slice.length - 1].end
      });
    }
  }

  const events = chunks.map((chunk) => {
    const startStr = formatTime(chunk.start);
    const endStr = formatTime(chunk.end);
    let text = chunk.words.map((w) => (preset.uppercase ? w.word.toUpperCase() : w.word)).join(' ');
    // Highlight first word or active word
    return `Dialogue: 0,${startStr},${endStr},Default,,0,0,0,,${text}`;
  });

  return header + events.join('\n');
}
