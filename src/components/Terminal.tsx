import React from 'react';
import {interpolate, useCurrentFrame, Easing} from 'remotion';

interface TerminalProps {
  width: number;
  height: number;
  x: number;
  y: number;
  startFrame: number; // 开始显示的帧数
  expandDuration?: number; // 展开动画时长（帧数）
}

export const Terminal: React.FC<TerminalProps> = ({
  width,
  height,
  x,
  y,
  startFrame,
  expandDuration = 24, // 400ms @ 60fps
}) => {
  const frame = useCurrentFrame();

  // 边框展开动画
  const progress = interpolate(
    frame,
    [startFrame, startFrame + expandDuration],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.ease),
    }
  );

  const currentWidth = width * progress;
  const currentHeight = height * progress;

  // 背景透明度
  const bgOpacity = interpolate(
    frame,
    [startFrame + expandDuration, startFrame + expandDuration + 12],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  if (frame < startFrame) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: x + (width - currentWidth) / 2,
        top: y + (height - currentHeight) / 2,
        width: currentWidth,
        height: currentHeight,
        border: '2px solid #FFFFFF',
        backgroundColor: `rgba(10, 10, 10, ${bgOpacity})`,
        boxSizing: 'border-box',
      }}
    >
      {/* 窗口标题栏 */}
      {progress > 0.5 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 40,
            borderBottom: '1px solid #FFFFFF',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 16,
            fontFamily: '"Courier New", monospace',
            fontSize: 16,
            color: '#FFFFFF',
            opacity: interpolate(progress, [0.5, 1], [0, 1]),
          }}
        >
          ─ Terminal ────────────────[_][□][×]─
        </div>
      )}
    </div>
  );
};
