'use client';

import React, { useEffect, useState } from 'react';
import { TypographyConfig, VisualizationState } from '@/types/drum-machine';

interface TypographyVisualizerProps {
  config: TypographyConfig;
  state: VisualizationState;
  width?: number;
  height?: number;
}

export const TypographyVisualizer: React.FC<TypographyVisualizerProps> = ({
  config,
  state,
  width = 800,
  height = 400,
}) => {
  const [animationStates, setAnimationStates] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    // Update animation states based on active instruments
    const newAnimationStates = new Map(animationStates);
    
    state.activeInstruments.forEach(instrument => {
      newAnimationStates.set(instrument, Date.now());
    });
    
    setAnimationStates(newAnimationStates);
  }, [state.activeInstruments]);

  const getTextTransform = (instrument: string, index: number) => {
    const animation = config.animations[instrument as keyof typeof config.animations];
    const animationTime = animationStates.get(instrument);
    
    if (!animation || !animationTime) {
      return '';
    }

    const elapsed = Date.now() - animationTime;
    const progress = Math.max(0, 1 - elapsed / animation.duration);
    
    if (progress <= 0) {
      return '';
    }

    const intensity = animation.intensity * progress;
    const baseX = (width / config.text.length) * index + (width / config.text.length) / 2;
    const baseY = height / 2;

    switch (animation.type) {
      case 'scale':
        return `translate(${baseX}, ${baseY}) scale(${1 + intensity})`;
      
      case 'rotate':
        return `translate(${baseX}, ${baseY}) rotate(${intensity * 360})`;
      
      case 'translate':
        return `translate(${baseX + intensity * 50}, ${baseY + intensity * 50})`;
      
      default:
        return `translate(${baseX}, ${baseY})`;
    }
  };

  const getTextColor = (instrument: string) => {
    const color = config.colors[instrument as keyof typeof config.colors];
    const animationTime = animationStates.get(instrument);
    
    if (!animationTime) {
      return color || '#ffffff';
    }

    const elapsed = Date.now() - animationTime;
    const animation = config.animations[instrument as keyof typeof config.animations];
    
    if (!animation || elapsed > animation.duration) {
      return color || '#ffffff';
    }

    const progress = Math.max(0, 1 - elapsed / animation.duration);
    
    if (animation.type === 'color') {
      // Brighten the color based on animation intensity
      const intensity = animation.intensity * progress;
      return adjustColorBrightness(color || '#ffffff', intensity);
    }

    return color || '#ffffff';
  };

  const getTextOpacity = (instrument: string) => {
    const animationTime = animationStates.get(instrument);
    
    if (!animationTime) {
      return 1;
    }

    const elapsed = Date.now() - animationTime;
    const animation = config.animations[instrument as keyof typeof config.animations];
    
    if (!animation || elapsed > animation.duration) {
      return 1;
    }

    const progress = Math.max(0, 1 - elapsed / animation.duration);
    
    if (animation.type === 'opacity') {
      return Math.max(0.3, 1 - animation.intensity * progress);
    }

    return 1;
  };

  return (
    <svg
      width={width}
      height={height}
      style={{ backgroundColor: config.colors.background }}
      className="typography-visualizer"
    >
      {config.text.map((letter, index) => {
        // Find which instrument should animate this letter
        const instrumentKeys = Object.keys(config.animations);
        const instrument = instrumentKeys[index % instrumentKeys.length];
        
        return (
          <text
            key={index}
            x="0"
            y="0"
            fontSize={config.fontSize}
            fontFamily={config.fontFamily}
            textAnchor="middle"
            dominantBaseline="central"
            fill={getTextColor(instrument)}
            opacity={getTextOpacity(instrument)}
            transform={getTextTransform(instrument, index)}
            style={{
              transition: 'all 0.1s ease-out',
              fontWeight: state.activeInstruments.has(instrument) ? 'bold' : 'normal',
            }}
          >
            {letter}
          </text>
        );
      })}
      
      {/* Step progress indicator */}
      <rect
        x={0}
        y={height - 4}
        width={width * state.stepProgress}
        height={4}
        fill="rgba(255, 255, 255, 0.3)"
      />
    </svg>
  );
};

// Helper function to adjust color brightness
function adjustColorBrightness(hex: string, intensity: number): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Increase brightness
  const factor = 1 + intensity;
  const newR = Math.min(255, Math.floor(r * factor));
  const newG = Math.min(255, Math.floor(g * factor));
  const newB = Math.min(255, Math.floor(b * factor));
  
  // Convert back to hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}