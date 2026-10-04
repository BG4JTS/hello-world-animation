import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';

interface CursorProps {
  x: number;
  y: number;
  blinkInterval?: number; // 闪烁周期（帧数）
  size?: number;
  color?: string;
  visible?: boolean;
}

export const Cursor: React.FC<CursorProps> = ({
  x,
  y,
  blinkInterval = 36, // 默认600ms @ 60fps
  size = 24,
  color = '#FFFFFF',
  visible = true,
}) => {
  const frame = useCurrentFrame();

  // 闪烁动画：0 → 1 → 0
  const opacity = interpolate(
    frame % blinkInterval,
    [0, blinkInterval / 2, blinkInterval],
    [0, 1, 0]
  );

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size * 2,
        backgroundColor: color,
        opacity,
      }}
    />
  );
};
