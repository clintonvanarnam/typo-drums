'use client';

import React, { useState, useRef, useEffect } from 'react';

type StepValue = 0 | 1 | 2 | 3; // 0 = empty, 1 = kick, 2 = snare, 3 = hi-hat

export default function TypoDrums01() {
  const [isPlayingQuarter, setIsPlayingQuarter] = useState(false);
  const [isPlayingEighth, setIsPlayingEighth] = useState(false);
  const [isPlayingSixteenth, setIsPlayingSixteenth] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [currentStepQuarter, setCurrentStepQuarter] = useState(0);
  const [currentStepEighth, setCurrentStepEighth] = useState(0);
  const [currentStepSixteenth, setCurrentStepSixteenth] = useState(0);
  const [numColumns, setNumColumns] = useState(5);
  const [numRows, setNumRows] = useState(1);
  const masterIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sixteenthNoteCountRef = useRef(0); // Master counter for 16th notes (smallest division)
  const lastQuarterTickRef = useRef(-1); // Track last quarter note tick played
  const lastEighthTickRef = useRef(-1); // Track last eighth note tick played
  const lastSixteenthTickRef = useRef(-1); // Track last sixteenth note tick played
  const audioContextRef = useRef<AudioContext | null>(null);
  const patternRef = useRef<StepValue[]>([]);
  const totalStepsRef = useRef<number>(5);

  const totalSteps = numColumns * numRows;

  // Pattern now uses 0, 1, or 2
  const [pattern, setPattern] = useState<StepValue[]>([1, 0, 0, 0, 0]);
  // Track last non-zero value for each step to preserve display
  const [lastValues, setLastValues] = useState<StepValue[]>([1, 1, 1, 1, 1]);

  // Keep totalSteps ref in sync
  useEffect(() => {
    totalStepsRef.current = totalSteps;
  }, [totalSteps]);

  // Initialize pattern when total steps changes
  useEffect(() => {
    setPattern(prev => {
      const newPattern = Array.from({ length: totalSteps }, (_, i) => {
        // Keep existing pattern values if they exist
        if (i < prev.length) return prev[i];
        // New steps default to 0 (empty)
        return 0 as StepValue;
      });
      return newPattern;
    });
    setLastValues(prev => {
      const newLastValues = Array.from({ length: totalSteps }, (_, i) => {
        if (i < prev.length) return prev[i];
        return 1 as StepValue; // Default to kick
      });
      return newLastValues;
    });
  }, [totalSteps]);

  // Keep ref in sync with state
  useEffect(() => {
    patternRef.current = pattern;
  }, [pattern]);

  const setStepValue = (stepIndex: number, value: StepValue) => {
    setPattern(prev => {
      const newPattern = [...prev];
      newPattern[stepIndex] = value;
      return newPattern;
    });
    // Update last value if setting to non-zero
    if (value !== 0) {
      setLastValues(prev => {
        const newLastValues = [...prev];
        newLastValues[stepIndex] = value;
        return newLastValues;
      });
    }
  };

  const addColumn = () => {
    setNumColumns(prev => prev + 1);
  };

  const removeColumn = () => {
    if (numColumns > 1) {
      setNumColumns(prev => prev - 1);
    }
  };

  const addRow = () => {
    setNumRows(prev => prev + 1);
  };

  const removeRow = () => {
    if (numRows > 1) {
      setNumRows(prev => prev - 1);
    }
  };

  useEffect(() => {
    // Initialize audio context
    audioContextRef.current = new AudioContext();
    
    return () => {
      if (masterIntervalRef.current) clearInterval(masterIntervalRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const playKick = () => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    
    // Create a simple synthetic kick drum
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Kick drum frequency envelope (high to low)
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
    
    // Amplitude envelope
    gain.gain.setValueAtTime(1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    osc.start(now);
    osc.stop(now + 0.5);
  };

  const playSnare = () => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    
    // Create snare with noise and tone
    const noise = ctx.createBufferSource();
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    noise.buffer = noiseBuffer;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(1000, now);
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(1, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    
    noise.start(now);
    noise.stop(now + 0.2);
    
    // Add a tone component
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.frequency.setValueAtTime(200, now);
    oscGain.gain.setValueAtTime(0.5, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.1);
  };

  const playHiHat = () => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    
    // Hi-hat is all high-frequency noise
    const noise = ctx.createBufferSource();
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    noise.buffer = noiseBuffer;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(7000, now);
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    
    noise.start(now);
    noise.stop(now + 0.05);
  };

  const playSound = (stepValue: StepValue) => {
    if (stepValue === 1) {
      playKick();
    } else if (stepValue === 2) {
      playSnare();
    } else if (stepValue === 3) {
      playHiHat();
    }
  };

  // Master clock runs continuously based on BPM
  useEffect(() => {
    if (!isPlayingQuarter && !isPlayingEighth && !isPlayingSixteenth) {
      // Nothing playing, stop master clock
      if (masterIntervalRef.current) {
        clearInterval(masterIntervalRef.current);
        masterIntervalRef.current = null;
      }
      sixteenthNoteCountRef.current = 0;
      return;
    }

    // Start master clock if not already running
    if (!masterIntervalRef.current) {
      const interval = (60 / bpm) * 1000 / 4; // 16th notes (smallest division)
      
      masterIntervalRef.current = setInterval(() => {
        sixteenthNoteCountRef.current++;
      }, interval);
    }

    return () => {
      if (masterIntervalRef.current) {
        clearInterval(masterIntervalRef.current);
        masterIntervalRef.current = null;
      }
    };
  }, [isPlayingQuarter, isPlayingEighth, isPlayingSixteenth, bpm]);

  // Quarter note sequencer - triggers on every 4th sixteenth note tick
  useEffect(() => {
    if (!isPlayingQuarter) {
      setCurrentStepQuarter(0);
      lastQuarterTickRef.current = -1;
      return;
    }

    const checkQuarterNote = setInterval(async () => {
      // Resume audio context on user gesture
      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const count = sixteenthNoteCountRef.current;
      if (count % 4 === 0 && count !== lastQuarterTickRef.current) {
        lastQuarterTickRef.current = count;
        const step = Math.floor(count / 4) % totalStepsRef.current;
        setCurrentStepQuarter(step);
        const stepValue = patternRef.current[step];
        if (stepValue !== 0) {
          playSound(stepValue);
        }
      }
    }, 10); // Check frequently

    return () => clearInterval(checkQuarterNote);
  }, [isPlayingQuarter]);

  // Eighth note sequencer - triggers on every 2nd sixteenth note tick
  useEffect(() => {
    if (!isPlayingEighth) {
      setCurrentStepEighth(0);
      lastEighthTickRef.current = -1;
      return;
    }

    const checkEighthNote = setInterval(async () => {
      // Resume audio context on user gesture
      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const count = sixteenthNoteCountRef.current;
      if (count % 2 === 0 && count !== lastEighthTickRef.current) {
        lastEighthTickRef.current = count;
        const step = Math.floor(count / 2) % totalStepsRef.current;
        setCurrentStepEighth(step);
        const stepValue = patternRef.current[step];
        if (stepValue !== 0) {
          playSound(stepValue);
        }
      }
    }, 10); // Check frequently

    return () => clearInterval(checkEighthNote);
  }, [isPlayingEighth]);

  // Sixteenth note sequencer - triggers on every sixteenth note tick
  useEffect(() => {
    if (!isPlayingSixteenth) {
      setCurrentStepSixteenth(0);
      lastSixteenthTickRef.current = -1;
      return;
    }

    const checkSixteenthNote = setInterval(async () => {
      // Resume audio context on user gesture
      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const count = sixteenthNoteCountRef.current;
      if (count !== lastSixteenthTickRef.current) {
        lastSixteenthTickRef.current = count;
        const step = count % totalStepsRef.current;
        setCurrentStepSixteenth(step);
        const stepValue = patternRef.current[step];
        if (stepValue !== 0) {
          playSound(stepValue);
        }
      }
    }, 10); // Check frequently

    return () => clearInterval(checkSixteenthNote);
  }, [isPlayingSixteenth]);

  const handlePlayPauseQuarter = () => {
    setIsPlayingQuarter(prev => !prev);
  };

  const handlePlayPauseEighth = () => {
    setIsPlayingEighth(prev => !prev);
  };

  const handlePlayPauseSixteenth = () => {
    setIsPlayingSixteenth(prev => !prev);
  };

  const handleBpmChange = (newBpm: number) => {
    setBpm(newBpm);
    // Master clock will restart automatically via useEffect dependency
  };

  return (
    <main style={{ 
      width: '100vw', 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      {/* Typography Pattern Display - Dynamic Grid */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: `repeat(${numColumns}, 1fr)`,
        gridTemplateRows: `repeat(${numRows}, 1fr)`,
        gap: `${Math.max(0.5, 2 / numColumns)}vw`,
        alignContent: 'start',
        justifyContent: 'center',
        overflow: 'auto',
        padding: '2vh 2vw',
      }}>
        {Array.from({ length: totalSteps }).map((_, stepIndex) => {
          const isCurrentStepQuarter = isPlayingQuarter && currentStepQuarter === stepIndex;
          const isCurrentStepEighth = isPlayingEighth && currentStepEighth === stepIndex;
          const isCurrentStepSixteenth = isPlayingSixteenth && currentStepSixteenth === stepIndex;
          const isCurrentStep = isCurrentStepQuarter || isCurrentStepEighth || isCurrentStepSixteenth;
          const stepValue = pattern[stepIndex];
          
          // Determine color based on state
          const color = stepValue !== 0 ? '#000' : 'transparent';
          const stroke = stepValue !== 0 ? 'none' : '3px #000';
          const opacity = isCurrentStep ? 0.3 : 1;
          
          // Calculate font size - scale based on rows and columns, with safer limits
          // Account for button row (50px) and ensure font fits in grid cell
          const fontSizeVh = Math.min(50, 150 / numRows);
          const fontSizeVw = Math.min(40, 170 / numColumns);
          const fontSize = `clamp(2rem, min(${fontSizeVh}vh, ${fontSizeVw}vw), 70rem)`;
          
          const handleClick = () => {
            // Toggle between active and rest
            if (stepValue === 0) {
              setStepValue(stepIndex, lastValues[stepIndex]);
            } else {
              setStepValue(stepIndex, 0);
            }
          };
          
          const handleKeyPress = (e: React.KeyboardEvent) => {
            if (e.key === '1') {
              setStepValue(stepIndex, 1);
            } else if (e.key === '2') {
              setStepValue(stepIndex, 2);
            } else if (e.key === '3') {
              setStepValue(stepIndex, 3);
            } else if (e.key === '0' || e.key === 'Backspace' || e.key === 'Delete') {
              setStepValue(stepIndex, 0);
            }
          };
          
          return (
            <div
              key={stepIndex}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                height: '100%',
                width: '100%',
              }}
            >
              <div
                onClick={handleClick}
                onKeyDown={handleKeyPress}
                tabIndex={0}
                style={{
                  fontSize,
                  fontWeight: '900',
                  color,
                  WebkitTextStroke: stroke,
                  opacity,
                  transition: 'color 0.05s ease, -webkit-text-stroke 0.05s ease, opacity 0.05s ease',
                  lineHeight: 1,
                  textAlign: 'center',
                  cursor: 'pointer',
                  outline: 'none',
                  userSelect: 'none',
                  pointerEvents: 'auto',
                }}
              >
                {stepValue === 0 ? lastValues[stepIndex] : stepValue}
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '5px', 
                fontSize: '14px',
                position: 'relative',
                zIndex: 2,
              }}>
                <button onClick={(e) => { e.stopPropagation(); setStepValue(stepIndex, 1); }}>
                  1
                </button>
                <button onClick={(e) => { e.stopPropagation(); setStepValue(stepIndex, 2); }}>
                  2
                </button>
                <button onClick={(e) => { e.stopPropagation(); setStepValue(stepIndex, 3); }}>
                  3
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls - Fixed at bottom */}
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '30px',
        padding: '20px',
        flexShrink: 0,
      }}>
        <button onClick={handlePlayPauseQuarter}>
          {isPlayingQuarter ? 'PAUSE ♩' : 'PLAY ♩'}
        </button>

        <button onClick={handlePlayPauseEighth}>
          {isPlayingEighth ? 'PAUSE ♪' : 'PLAY ♪'}
        </button>

        <button onClick={handlePlayPauseSixteenth}>
          {isPlayingSixteenth ? 'PAUSE ♬' : 'PLAY ♬'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <label>BPM: {bpm}</label>
          <input
            type="range"
            min="60"
            max="200"
            value={bpm}
            onChange={(e) => handleBpmChange(parseInt(e.target.value))}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={removeColumn} disabled={numColumns <= 1}>
            -
          </button>
          <span>Columns: {numColumns}</span>
          <button onClick={addColumn}>
            +
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={removeRow} disabled={numRows <= 1}>
            -
          </button>
          <span>Rows: {numRows}</span>
          <button onClick={addRow}>
            +
          </button>
        </div>
      </div>
    </main>
  );
}
