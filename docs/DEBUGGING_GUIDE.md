# 🛠️ 如何避免动画错误 - 最佳实践指南

## 问题根源分析

刚才遇到的问题主要是：
1. **组件重叠** - 元素位置使用了动态变量（如cursorX）
2. **时间线混乱** - 不同阶段的帧数边界不清晰
3. **运行时错误** - 修改后未即时验证

---

## ✅ 最佳实践：5步开发流程

### 1️⃣ **使用预览模式开发，而非直接渲染**

```bash
# ❌ 错误做法：每次修改都渲染完整视频
npm run render  # 要等2-5分钟才看到结果

# ✅ 正确做法：使用实时预览
npm start  # 浏览器打开，实时看到修改效果
```

**为什么预览模式更好？**
- ⚡ 即时反馈（< 1秒）
- 🎯 可以拖动时间轴，快速跳到问题帧
- 🐛 浏览器控制台显示实时错误
- 🔄 支持热重载（修改代码自动刷新）

---

### 2️⃣ **先定义时间线常量，再写动画**

```tsx
// ❌ 错误做法：魔法数字到处飞
if (frame < 480) { ... }
if (frame >= 480 && frame < 720) { ... }
if (frame >= 720) { ... }  // 720是什么意思？忘了

// ✅ 正确做法：在文件顶部定义所有关键帧
const TIMELINE = {
  AWAKEN_START: 0,
  AWAKEN_END: 180,
  
  FIRST_CHAR_START: 180,
  FIRST_CHAR_END: 300,
  
  EXPLORE_START: 300,
  EXPLORE_END: 480,
  
  DISCOVER_TERMINAL_START: 720,
  DISCOVER_TERMINAL_END: 900,
  
  JUMP_START: 960,
  JUMP_END: 1080,
  
  NEW_WORLD_START: 1080,
};

// 然后使用常量
if (frame < TIMELINE.EXPLORE_END) {
  // 清晰知道这是"探索阶段结束"
}
```

**为什么这样做？**
- 📝 一眼看懂整个故事结构
- 🔧 调整时间只需改一个数字
- 🐛 避免"边界重叠"错误（如 `frame < 720` vs `frame >= 720`）

---

### 3️⃣ **使用独立的位置计算函数 + 类型安全**

```tsx
// ❌ 错误做法：位置计算散落各处
<ASCIIText text="a" x={cursorX - 30} y={cursorY} />
<ASCIIText text="b" x={cursorX - 60} y={cursorY} />
// 结果：文字跟着光标飞来飞去

// ✅ 正确做法：集中计算位置
interface Position {
  x: number;
  y: number;
}

const POSITIONS = {
  SCREEN_CENTER: { x: 960, y: 540 },
  FIRST_CHAR: { x: 930, y: 540 },
  TERMINAL_PROMPT: { x: 590, y: 270 },
} as const;

// 角色位置（动态）
const getCursorPosition = (frame: number): Position => {
  // 集中管理所有运动逻辑
};

// 道具位置（静态）
const getCharPosition = (index: number): Position => {
  return {
    x: POSITIONS.FIRST_CHAR.x + index * 30,
    y: POSITIONS.FIRST_CHAR.y,
  };
};
```

**为什么这样做？**
- 🎯 位置逻辑一目了然
- 🔒 TypeScript检查避免拼写错误
- 🧪 易于单独测试位置计算

---

### 4️⃣ **添加调试可视化**

```tsx
// 在开发时添加可视化辅助
const DebugOverlay: React.FC<{frame: number}> = ({frame}) => {
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <>
      {/* 时间线可视化 */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        fontFamily: 'monospace',
        fontSize: 14,
        color: '#666',
      }}>
        Frame: {frame} / 1200 | Time: {(frame / 60).toFixed(2)}s<br/>
        阶段: {getCurrentStage(frame)}
      </div>
      
      {/* 网格线（帮助对齐）*/}
      <svg style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
        <line x1="960" y1="0" x2="960" y2="1080" stroke="#333" strokeDasharray="5,5" />
        <line x1="0" y1="540" x2="1920" y2="540" stroke="#333" strokeDasharray="5,5" />
        
        {/* 安全区域标记 */}
        <rect x="560" y="240" width="800" height="600" 
              stroke="#444" fill="none" strokeDasharray="2,2" />
      </svg>
      
      {/* 关键点标记 */}
      <div style={{
        position: 'absolute',
        left: POSITIONS.FIRST_CHAR.x - 5,
        top: POSITIONS.FIRST_CHAR.y - 5,
        width: 10,
        height: 10,
        border: '2px solid red',
        borderRadius: '50%',
      }} />
    </>
  );
};
```

**为什么这样做？**
- 👁️ 实时看到当前阶段
- 📐 对齐更精确
- 🔍 快速定位问题帧

---

### 5️⃣ **分段开发 + 单元测试**

```tsx
// 1. 先写纯函数（位置/缓动计算）
export const calculateJumpPosition = (
  progress: number, 
  startX: number, 
  endX: number, 
  maxHeight: number
): Position => {
  const x = startX + (endX - startX) * progress;
  const y = 540 - Math.sin(progress * Math.PI) * maxHeight;
  return {x, y};
};

// 2. 为纯函数写测试
describe('calculateJumpPosition', () => {
  it('should start at startX', () => {
    const pos = calculateJumpPosition(0, 100, 200, 50);
    expect(pos.x).toBe(100);
    expect(pos.y).toBe(540);
  });
  
  it('should reach peak at 50% progress', () => {
    const pos = calculateJumpPosition(0.5, 100, 200, 50);
    expect(pos.y).toBe(490); // 540 - 50
  });
});

// 3. 在组件中使用已测试的函数
const jumpProgress = interpolate(frame, [960, 1080], [0, 1]);
const jumpPos = calculateJumpPosition(jumpProgress, 1310, 620, 150);
```

**为什么这样做？**
- ✅ 数学逻辑先验证正确
- 🐛 修改时不怕破坏原有功能
- 📦 函数可复用到其他场景

---

## 🚀 推荐工作流程

### 开发新场景时：

```bash
# 第1步：启动预览服务器
npm start

# 第2步：在浏览器中打开
# http://localhost:3000
# 选择你要开发的Composition

# 第3步：修改代码
# - src/scenes/YourScene.tsx
# - 保存后浏览器自动刷新

# 第4步：拖动时间轴，检查每一帧
# - 0s, 3s, 6s, 9s, 12s, 15s, 18s 都要看
# - 检查过渡是否平滑
# - 检查是否有组件重叠

# 第5步：确认无误后再渲染
npm run render
```

---

## 🐛 常见错误检查清单

在提交前检查：

### ✅ 位置相关
- [ ] 所有固定元素使用常量坐标（不依赖动态变量）
- [ ] 动态元素的位置计算有明确的边界条件
- [ ] 没有元素意外飞出屏幕（检查 x < 0 或 x > 1920）

### ✅ 时间线相关
- [ ] 所有阶段的帧数边界清晰定义
- [ ] 没有"空隙"（如 `frame < 720` 和 `frame >= 800` 之间）
- [ ] 没有"重叠"（如两个条件都可能为true）
- [ ] 元素显示/隐藏逻辑一致（如 `frame >= X && frame < Y`）

### ✅ 组件使用
- [ ] `delay` 参数设置为 0（如果元素已经通过条件判断控制显示）
- [ ] `duration` 参数合理（通常 6-30 帧）
- [ ] 没有传入 `undefined` 或 `NaN` 到位置属性

### ✅ 性能相关
- [ ] 没有在每帧都创建大量新对象
- [ ] 复杂计算结果使用 `useMemo` 缓存
- [ ] 没有在渲染函数内使用 `console.log`（会降低预览性能）

---

## 🔧 调试技巧

### 1. 使用浏览器开发者工具

```tsx
// 在特定帧暂停
if (frame === 301) {
  console.log('Cursor position:', cursorX, cursorY);
  console.log('All visible elements:', /* ... */);
  debugger; // 浏览器会在这里暂停
}
```

### 2. 渲染单帧图片（快速调试）

```bash
# 只渲染第301帧（出错的那一帧）
npx remotion still src/index.ts Act1-Simple out/frame-301.png --frame=301
```

### 3. 渲染短片段

```tsx
// 临时修改：只渲染出错的区间
export const Act1AwakeningSimple: React.FC = () => {
  // 修改总时长从1200 → 120帧（只渲染前2秒）
  const durationInFrames = 120; // 临时
  
  // ... 其他代码
};
```

---

## 📋 代码审查检查表（自己审自己）

在说"完成"之前：

1. **时间轴可视化**
   - [ ] 在纸上或Figma画出完整时间线
   - [ ] 标注每个阶段的开始/结束帧
   - [ ] 确认没有遗漏的过渡

2. **边界测试**
   - [ ] 检查第0帧（初始状态）
   - [ ] 检查每个阶段的第一帧和最后一帧
   - [ ] 检查最后一帧（结束状态）

3. **关键帧验证**
   - [ ] 在预览中快速跳到5-10个关键帧
   - [ ] 每个关键帧都符合预期
   - [ ] 过渡自然流畅

4. **性能检查**
   - [ ] 预览时FPS稳定在60
   - [ ] 渲染进度平稳（没有卡在某个范围）

---

## 💡 工具推荐

### VSCode插件
- **Remotion Preview** - 在编辑器内预览
- **Error Lens** - 实时显示TypeScript错误
- **Better Comments** - 高亮TODO/FIXME

### 辅助工具
- **Excalidraw** - 画时间线草图
- **Easings.net** - 选择缓动曲线
- **Cubic-bezier.com** - 自定义贝塞尔曲线

---

## 🎯 总结：黄金法则

1. **预览 > 渲染** - 开发时用预览，只有最终才渲染
2. **常量 > 魔法数字** - 所有关键帧定义为常量
3. **静态 > 动态** - 固定元素用固定坐标
4. **测试 > 猜测** - 不确定就测试，不要靠"应该没问题"
5. **分段 > 一次性** - 先完成5秒，再扩展到20秒

---

**记住：好的动画是迭代出来的，不是一次写对的。**

使用预览模式快速迭代 → 每次只改一小块 → 确认正确再继续 = 高质量动画

---

*现在让我们用预览模式修复当前的问题...*
