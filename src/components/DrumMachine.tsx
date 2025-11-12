'use client';

import React, { useEffect, useState, useRef } from 'react';
import { DrumMachineConfig, AudioState, VisualizationState } from '@/types/drum-machine';
import { DrumMachineEngine } from '@/lib/drum-engine';
import { TypographyVisualizer } from './TypographyVisualizer';

interface DrumMachineProps {
  config: DrumMachineConfig;
  width?: number;
  height?: number;
}

export const DrumMachine: React.FC<DrumMachineProps> = ({
  config,
  width = 800,
  height = 500,
}) => {
  const engineRef = useRef<DrumMachineEngine | null>(null);
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    currentStep: 0,
    bpm: config.bpm,
  });
  const [visualState, setVisualState] = useState<VisualizationState>({
    activeInstruments: new Set(),
    stepProgress: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeEngine = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const engine = new DrumMachineEngine();
        engineRef.current = engine;

        // Set up step callback
        engine.onStep((step: number, activeInstruments: Set<string>) => {
          setAudioState(prev => ({ ...prev, currentStep: step }));
          setVisualState(prev => ({
            ...prev,
            activeInstruments,
            stepProgress: (step + 1) / config.pattern.steps,
          }));
        });

        await engine.loadConfig(config);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize drum machine:', err);
        setError(err instanceof Error ? err.message : 'Failed to load drum machine');
        setIsLoading(false);
      }
    };

    initializeEngine();

    return () => {
      if (engineRef.current) {
        engineRef.current.dispose();
      }
    };
  }, [config]);

  const handlePlay = async () => {
    if (!engineRef.current) return;

    try {
      // Ensure audio context is started (required for user gesture)
      const { start, getContext } = await import('tone');
      if (getContext().state !== 'running') {
        await start();
      }
      
      if (audioState.isPlaying) {
        engineRef.current.pause();
        setAudioState(prev => ({ ...prev, isPlaying: false }));
      } else {
        engineRef.current.play();
        setAudioState(prev => ({ ...prev, isPlaying: true }));
      }
    } catch (err) {
      console.error('Audio playback error:', err);
      setError('Failed to start audio. Please try again.');
    }
  };

  const handleStop = () => {
    if (!engineRef.current) return;
    
    engineRef.current.stop();
    setAudioState(prev => ({ ...prev, isPlaying: false, currentStep: 0 }));
    setVisualState(prev => ({ ...prev, activeInstruments: new Set(), stepProgress: 0 }));
  };

  const handleBPMChange = (newBpm: number) => {
    if (!engineRef.current) return;
    
    engineRef.current.setBPM(newBpm);
    setAudioState(prev => ({ ...prev, bpm: newBpm }));
  };

  if (error) {
    return (
      <div className="drum-machine error" style={{ width, height, padding: '20px' }}>
        <h3>Error loading drum machine: {config.name}</h3>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{ padding: '8px 16px', marginTop: '10px' }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="drum-machine loading" style={{ width, height, padding: '20px' }}>
        <h3>Loading {config.name}...</h3>
        <div>Loading samples and setting up audio engine...</div>
      </div>
    );
  }

  return (
    <div className="drum-machine" style={{ width, minHeight: height }}>
      <div className="drum-machine-header" style={{ 
        padding: '20px', 
        background: 'rgba(0,0,0,0.8)', 
        color: 'white',
        borderRadius: '8px 8px 0 0'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>{config.name}</h3>
        
        <div className="controls" style={{ 
          display: 'flex', 
          gap: '10px', 
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handlePlay}
            style={{
              padding: '8px 16px',
              backgroundColor: audioState.isPlaying ? '#ff6b6b' : '#51cf66',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {audioState.isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
          
          <button
            onClick={handleStop}
            style={{
              padding: '8px 16px',
              backgroundColor: '#868e96',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            ⏹️ Stop
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label>BPM:</label>
            <input
              type="range"
              min="60"
              max="180"
              value={audioState.bpm}
              onChange={(e) => handleBPMChange(parseInt(e.target.value))}
              style={{ width: '100px' }}
            />
            <span>{audioState.bpm}</span>
          </div>
          
          <div style={{ marginLeft: 'auto' }}>
            Step: {audioState.currentStep + 1}/{config.pattern.steps}
          </div>
        </div>
      </div>

      <div className="visualization-container">
        <TypographyVisualizer
          config={config.typography}
          state={visualState}
          width={width}
          height={height - 100} // Subtract header height
        />
      </div>
    </div>
  );
};