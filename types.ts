
export type SpeedWPM = 300 | 500 | 700 | 900;

export interface WordInfo {
  text: string;
  prefix: string;
  pivot: string;
  suffix: string;
}

export interface ReadingState {
  words: WordInfo[];
  currentIndex: number;
  isPlaying: boolean;
  speed: SpeedWPM;
}
