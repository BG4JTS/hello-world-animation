import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';

interface ASCIITextProps {
  text: string;
  x: number;
  y: number;
  fontSize?: number;
  color?: string;
  opacity?: number;
  delay?: number; // 延迟显示（帧数）
  duration?: number; // 淡入时长（帧数）
}

export const ASCIIText: React.FC<ASCIITextProps> = ({
  text,
  x,
  y,
  fontSize = 32,
  color = '#FFFFFF',
  opacity: finalOpacity = 1,
  delay = 0,
  duration = 18, // 300ms @ 60fps
}) => {
  const frame = useCurrentFrame();

  // 淡入动画
  const opacity = interpolate(
    frame,
    [delay, delay + duration],
    [0, finalOpacity],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        fontFamily: '"Courier New", monospace',
        fontSize,
        color,
        opacity,
        whiteSpace: 'pre',
        lineHeight: 1,
      }}
    >
      {text}
    </div>
  );
};
