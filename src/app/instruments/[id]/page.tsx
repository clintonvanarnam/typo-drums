import { notFound } from 'next/navigation';
import { getInstrumentById } from '@/lib/instruments';

interface InstrumentPageProps {
  params: {
    id: string;
  };
}

export default function InstrumentPage({ params }: InstrumentPageProps) {
  const instrument = getInstrumentById(params.id);

  if (!instrument) {
    notFound();
  }

  const InstrumentComponent = instrument.component;

  return <InstrumentComponent />;
}
