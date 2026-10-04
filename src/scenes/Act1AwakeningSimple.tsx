// 修复版第一幕 - 解决组件重叠和动画问题
import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
} from 'remotion';
import {Cursor} from '../components/Cursor';
import {ASCIIText} from '../components/ASCIIText';
import {Terminal} from '../components/Terminal';

export const Act1AwakeningSimple: React.FC = () => {
  const frame = useCurrentFrame();

  const BLACK = '#000000';
  const WHITE = '#FFFFFF';
  const GREEN = '#00FF41';

  // === 阶段定义 ===
  // 0-180:   觉醒（光标闪烁）
  // 180-300: 输入第一个字符 'a'
  // 300-480: 短暂探索
  // 480-720: 更多尝试
  // 720-960: 发现边界/终端
  // 960-1080: 跳跃
  // 1080-1200: 新世界

  // === 光标位置计算（修复版）===
  const getCursorPosition = () => {
    // 阶段1: 觉醒 (0-180) - 中心位置
    if (frame < 180) {
      return {x: 960, y: 540};
    }

    // 阶段2: 输入'a' (180-300) - 保持中心
    if (frame < 300) {
      return {x: 960, y: 540};
    }

    // 阶段3: 向右移动 (300-480)
    if (frame < 480) {
      const progress = interpolate(
        frame,
        [300, 480],
        [0, 1],
        {easing: Easing.inOut(Easing.ease)}
      );
      return {
        x: 960 + progress * 150,
        y: 540,
      };
    }

    // 阶段4: 探索移动 (480-720) - 小范围晃动
    if (frame < 720) {
      const baseX = 1110; // 300-480移动后的位置
      const wobbleProgress = (frame - 480) / 240;
      const wobbleX = Math.sin(wobbleProgress * Math.PI * 4) * 30;
      const wobbleY = Math.cos(wobbleProgress * Math.PI * 3) * 20;

      return {
        x: baseX + wobbleX,
        y: 540 + wobbleY,
      };
    }

    // 阶段5: 移动到边界 (720-900)
    if (frame < 900) {
      const progress = interpolate(
        frame,
        [720, 900],
        [0, 1],
        {easing: Easing.out(Easing.cubic)}
      );

      return {
        x: 1110 + progress * 200, // 从探索位置移动到右边界
        y: 540,
      };
    }

    // 阶段6: 碰壁后退 (900-960)
    if (frame < 960) {
      const bounceProgress = interpolate(
        frame,
        [900, 930, 960],
        [0, -20, 0],
        {easing: Easing.elastic(0.5)}
      );

      return {
        x: 1310 + bounceProgress,
        y: 540,
      };
    }

    // 阶段7: 跳跃 (960-1080)
    if (frame < 1080) {
      const jumpProgress = interpolate(
        frame,
        [960, 1020, 1080],
        [0, 1, 0],
        {easing: Easing.bezier(0.42, 0, 0.58, 1)}
      );

      const jumpX = interpolate(
        frame,
        [960, 1080],
        [1310, 620], // 从右边界跳到终端内部
        {easing: Easing.inOut(Easing.cubic)}
      );

      const jumpY = 540 - jumpProgress * 150; // 跳跃高度

      return {x: jumpX, y: jumpY};
    }

    // 阶段8: 落地后 (1080-1200) - 终端内部
    return {x: 620, y: 270}; // 终端提示符位置
  };

  const {x: cursorX, y: cursorY} = getCursorPosition();

  // === 闪烁速度（根据情绪变化）===
  const getBlinkInterval = () => {
    if (frame < 180) return 30; // 慢速 - 刚醒
    if (frame >= 300 && frame < 480) return 24; // 中速 - 探索
    if (frame >= 480 && frame < 720) return 18; // 快速 - 兴奋
    if (frame >= 900 && frame < 960) return 12; // 超快 - 紧张
    return 30; // 默认
  };

  // === 字符显示位置（修复：使用固定位置而非跟随光标）===
  const getCharacterPosition = (charIndex: number) => {
    // 所有字符都显示在初始探索路径上
    const baseX = 930; // 'a'的固定位置
    return {
      x: baseX + charIndex * 30,
      y: 540,
    };
  };

  return (
    <AbsoluteFill style={{backgroundColor: BLACK}}>
      {/* === 光标（始终显示）=== */}
      <Cursor
        x={cursorX}
        y={cursorY}
        blinkInterval={getBlinkInterval()}
        color={WHITE}
      />

      {/* === 输入的字符（固定位置，不跟随光标）=== */}

      {/* 第一个字符 'a' (180-300输入，之后保持显示) */}
      {frame >= 300 && frame < 720 && (
        <ASCIIText
          text="a"
          x={930}
          y={540}
          fontSize={48}
          color={WHITE}
          delay={300}
          duration={18}
        />
      )}

      {/* 更多尝试 'sd' (480-600) */}
      {frame >= 480 && frame < 720 && (
        <>
          <ASCIIText
            text="s"
            x={970}
            y={540}
            fontSize={48}
            color={WHITE}
            delay={480}
            duration={18}
          />
          <ASCIIText
            text="d"
            x={1010}
            y={540}
            fontSize={48}
            color={WHITE}
            delay={510}
            duration={18}
          />
        </>
      )}

      {/* 更多尝试 'fw' (600-720) */}
      {frame >= 600 && frame < 720 && (
        <>
          <ASCIIText
            text="f"
            x={1050}
            y={540}
            fontSize={48}
            color={WHITE}
            delay={600}
            duration={18}
          />
          <ASCIIText
            text="w"
            x={1090}
            y={540}
            fontSize={48}
            color={WHITE}
            delay={630}
            duration={18}
          />
        </>
      )}

      {/* === 终端窗口（720开始显示）=== */}
      {frame >= 720 && (
        <Terminal
          width={800}
          height={600}
          x={560}
          y={240}
          startFrame={720} // 修复：立即开始展开
          expandDuration={60} // 1秒展开
        />
      )}

      {/* === 边界线（视觉提示，720-960显示）=== */}
      {frame >= 720 && frame < 960 && (
        <div
          style={{
            position: 'absolute',
            left: 1360,
            top: 240,
            width: 4,
            height: 600,
            backgroundColor: WHITE,
            opacity: interpolate(
              frame,
              [720, 780, 900, 960],
              [0, 0.3, 0.3, 0],
              {extrapolateRight: 'clamp'}
            ),
          }}
        />
      )}

      {/* === 终端内部提示符 '> █' (1080后显示)=== */}
      {frame >= 1080 && (
        <>
          <ASCIIText
            text=">"
            x={590}
            y={270}
            fontSize={32}
            color={GREEN}
            delay={1080}
            duration={18}
          />
          {/* 光标在提示符后面 - 已通过getCursorPosition处理 */}
        </>
      )}

      {/* === 调试信息（可选，方便调试）=== */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          fontFamily: 'monospace',
          fontSize: 14,
          color: '#666',
          userSelect: 'none',
        }}
      >
        Frame: {frame} | Time: {(frame / 60).toFixed(2)}s |
        Pos: ({cursorX.toFixed(0)}, {cursorY.toFixed(0)})
      </div>

      {/* === 阶段提示（调试用）=== */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: 20,
          fontFamily: 'monospace',
          fontSize: 12,
          color: '#444',
          userSelect: 'none',
        }}
      >
        {frame < 180 && '阶段: 觉醒'}
        {frame >= 180 && frame < 300 && '阶段: 输入第一个字符'}
        {frame >= 300 && frame < 480 && '阶段: 向右探索'}
        {frame >= 480 && frame < 720 && '阶段: 尝试更多字符'}
        {frame >= 720 && frame < 900 && '阶段: 移动到边界'}
        {frame >= 900 && frame < 960 && '阶段: 碰壁'}
        {frame >= 960 && frame < 1080 && '阶段: 跳跃！'}
        {frame >= 1080 && '阶段: 新世界'}
      </div>
    </AbsoluteFill>
  );
};
