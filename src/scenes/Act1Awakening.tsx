import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Sequence,
  Audio,
  staticFile,
  Easing,
} from 'remotion';
import {Cursor} from '../components/Cursor';
import {ASCIIText} from '../components/ASCIIText';
import {Terminal} from '../components/Terminal';

/**
 * 第一幕：觉醒 (0:00 - 0:20 = 1200 frames @ 60fps)
 *
 * 分镜：
 * Frame 1 (0-180):     纯黑虚空
 * Frame 2 (180-300):   第一次闪烁
 * Frame 3 (300-480):   尝试输入 'a'
 * Frame 4 (480-720):   探索方向 'asdf' → 'wasd'
 * Frame 5 (720-960):   碰撞边界，终端显现
 * Frame 6 (960-1200):  进入终端
 */

export const Act1Awakening: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 60;

  // 配色
  const BLACK = '#000000';
  const WHITE = '#FFFFFF';
  const GREEN = '#00FF41';

  // 光标位置动画
  const getCursorPosition = () => {
    // Frame 2-3 (180-480): 中心
    if (frame < 480) {
      return {x: 960, y: 540};
    }

    // Frame 4 (480-720): 尝试移动
    if (frame < 720) {
      const moveProgress = interpolate(frame, [480, 720], [0, 1]);
      return {
        x: 960 + Math.sin(moveProgress * Math.PI * 2) * 20,
        y: 540 + Math.cos(moveProgress * Math.PI * 2) * 20,
      };
    }

    // Frame 5 (720-960): 向前移动后停止
    if (frame < 960) {
      const moveToEdge = interpolate(
        frame,
        [720, 820],
        [0, 1],
        {
          extrapolateRight: 'clamp',
          easing: Easing.out(Easing.ease),
        }
      );
      return {
        x: 960 + moveToEdge * 200,
        y: 540,
      };
    }

    // Frame 6 (960-1200): 跳跃进入终端
    const jumpProgress = interpolate(
      frame,
      [960, 1020, 1080],
      [0, 1, 0],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }
    );

    const jumpX = interpolate(frame, [960, 1080], [1160, 580]);
    const jumpY = 540 - jumpProgress * 100;

    return {x: jumpX, y: jumpY};
  };

  const {x: cursorX, y: cursorY} = getCursorPosition();

  // 光标闪烁周期
  const getBlinkInterval = () => {
    if (frame < 180) return 36; // 不可见阶段
    if (frame >= 480 && frame < 720) return 24; // 探索时加快
    return 36; // 标准600ms
  };

  return (
    <AbsoluteFill style={{backgroundColor: BLACK}}>
      {/* ===== Frame 1: 纯黑虚空 (0-180) ===== */}
      {/* 背景音乐：低频嗡鸣渐强 */}
      <Sequence from={0} durationInFrames={180}>
        <Audio
          src={staticFile('music/01_awakening_drone.mp3')}
          volume={0.3}
          startFrom={0}
        />
      </Sequence>

      {/* ===== Frame 2: 第一次闪烁 (180-300) ===== */}
      {frame >= 180 && (
        <>
          <Cursor
            x={cursorX}
            y={cursorY}
            blinkInterval={getBlinkInterval()}
            color={WHITE}
          />
          {/* CRT启动音 */}
          {frame === 180 && (
            <Sequence from={180} durationInFrames={30}>
              <Audio
                src={staticFile('sfx/crt_startup.mp3')}
                volume={0.5}
              />
            </Sequence>
          )}
        </>
      )}

      {/* ===== Frame 3: 尝试输入 'a' (300-480) ===== */}
      {frame >= 300 && frame < 720 && (
        <>
          <ASCIIText
            text="a"
            x={cursorX - 30}
            y={cursorY}
            fontSize={48}
            color={WHITE}
            delay={300}
            duration={18}
          />
          {/* 打字音效 */}
          {frame === 300 && (
            <Sequence from={300} durationInFrames={3}>
              <Audio
                src={staticFile('sfx/typing/key_01.mp3')}
                volume={0.6}
              />
            </Sequence>
          )}
        </>
      )}

      {/* ===== Frame 4: 探索方向 (480-720) ===== */}
      {frame >= 480 && frame < 600 && (
        <>
          {/* asdf */}
          <ASCIIText
            text="asdf"
            x={cursorX - 120}
            y={cursorY}
            fontSize={48}
            color={WHITE}
            delay={480}
          />
          {/* 连续打字音效 */}
          {[480, 510, 540, 570].map((f, i) => (
            frame === f && (
              <Sequence key={i} from={f} durationInFrames={3}>
                <Audio
                  src={staticFile(`sfx/typing/key_0${(i % 3) + 1}.mp3`)}
                  volume={0.6}
                />
              </Sequence>
            )
          ))}
        </>
      )}

      {frame >= 600 && frame < 720 && (
        <>
          {/* wasd (删除asdf后) */}
          <ASCIIText
            text="wasd"
            x={cursorX - 120}
            y={cursorY}
            fontSize={48}
            color={WHITE}
            delay={600}
          />
          {/* 删除音效 */}
          {frame === 600 && (
            <Sequence from={600} durationInFrames={6}>
              <Audio
                src={staticFile('sfx/delete.mp3')}
                volume={0.5}
              />
            </Sequence>
          )}
        </>
      )}

      {/* ===== Frame 5: 碰撞边界，终端显现 (720-960) ===== */}
      {frame >= 720 && (
        <>
          {/* 碰撞音效 */}
          {frame === 820 && (
            <Sequence from={820} durationInFrames={12}>
              <Audio
                src={staticFile('sfx/collision.mp3')}
                volume={0.7}
              />
            </Sequence>
          )}

          {/* 终端窗口 */}
          <Terminal
            width={800}
            height={600}
            x={560}
            y={240}
            startFrame={820}
            expandDuration={24}
          />

          {/* 终端展开音效 */}
          {frame === 820 && (
            <Sequence from={820} durationInFrames={24}>
              <Audio
                src={staticFile('sfx/terminal_open.mp3')}
                volume={0.6}
              />
            </Sequence>
          )}

          {/* 提示符 (终端内部) */}
          {frame >= 960 && (
            <ASCIIText
              text=">"
              x={590}
              y={300}
              fontSize={32}
              color={GREEN}
              delay={960}
            />
          )}
        </>
      )}

      {/* ===== Frame 6: 进入终端 (960-1200) ===== */}
      {frame >= 960 && (
        <>
          {/* 跳跃音效 */}
          {frame === 960 && (
            <Sequence from={960} durationInFrames={60}>
              <Audio
                src={staticFile('sfx/jump.mp3')}
                volume={0.5}
              />
            </Sequence>
          )}

          {/* 着陆音效 */}
          {frame === 1080 && (
            <Sequence from={1080} durationInFrames={12}>
              <Audio
                src={staticFile('sfx/land.mp3')}
                volume={0.4}
              />
            </Sequence>
          )}

          {/* Unix login音 */}
          {frame === 1080 && (
            <Sequence from={1080} durationInFrames={30}>
              <Audio
                src={staticFile('sfx/unix_login.mp3')}
                volume={0.5}
              />
            </Sequence>
          )}
        </>
      )}

      {/* 背景音乐：Lo-fi节拍在最后淡入 */}
      {frame >= 960 && (
        <Sequence from={960} durationInFrames={240}>
          <Audio
            src={staticFile('music/01_lofi_intro.mp3')}
            volume={(frame - 960) / 240 * 0.3}
          />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
