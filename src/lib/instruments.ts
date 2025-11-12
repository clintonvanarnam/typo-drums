import TypoDrums01 from '@/components/instruments/TypoDrums01';

export interface Instrument {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType;
}

export const instruments: Instrument[] = [
  {
    id: 'typo-drums-01',
    name: 'Typo Drums 01',
    description: 'A typographic drum machine with kick, snare, and hi-hat',
    component: TypoDrums01,
  },
  // Add more instruments here as they are created
];

export function getInstrumentById(id: string): Instrument | undefined {
  return instruments.find(instrument => instrument.id === id);
}
