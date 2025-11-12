export interface DrumMachineConfig {
  id: string;
  name: string;
  bpm: number;
  kit: DrumKit;
  pattern: DrumPattern;
  typography: TypographyConfig;
}

export interface DrumKit {
  kick: string;
  snare: string;
  hihat: string;
  openhat?: string;
  clap?: string;
  crash?: string;
}

export interface DrumPattern {
  steps: number;
  tracks: {
    kick: boolean[];
    snare: boolean[];
    hihat: boolean[];
    openhat?: boolean[];
    clap?: boolean[];
    crash?: boolean[];
  };
}

export interface TypographyConfig {
  fontFamily: string;
  fontSize: string;
  text: string[];
  colors: {
    kick: string;
    snare: string;
    hihat: string;
    openhat?: string;
    clap?: string;
    crash?: string;
    background: string;
  };
  animations: {
    kick: TypographyAnimation;
    snare: TypographyAnimation;
    hihat: TypographyAnimation;
    openhat?: TypographyAnimation;
    clap?: TypographyAnimation;
    crash?: TypographyAnimation;
  };
}

export interface TypographyAnimation {
  type: 'scale' | 'rotate' | 'translate' | 'color' | 'opacity';
  intensity: number;
  duration: number;
  easing?: string;
}

export interface AudioState {
  isPlaying: boolean;
  currentStep: number;
  bpm: number;
}

export interface VisualizationState {
  activeInstruments: Set<string>;
  stepProgress: number;
}