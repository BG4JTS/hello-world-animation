# 🚀 启动前检查清单

## 第一次启动（必须完成）

### ✅ Step 1: 验证项目结构

运行以下命令检查文件是否完整：

```bash
cd F:\helloworld\hello-world-animation
dir
```

**应该看到这些文件**：
- ✅ package.json
- ✅ tsconfig.json
- ✅ remotion.config.ts
- ✅ audio-generator.html
- ✅ README.md
- ✅ QUICKSTART.md
- ✅ PROJECT_SUMMARY.md
- ✅ src/ 目录
- ✅ audio/ 目录
- ✅ public/ 目录

### ✅ Step 2: 安装依赖

```bash
npm install
```

**预期结果**：
- ⏱️ 耗时：1-2分钟
- 📦 下载：~200MB
- ✅ 无错误信息

**如果失败**：
```bash
# 使用国内镜像
npm config set registry https://registry.npmmirror.com
npm install
```

### ✅ Step 3: 快速测试（无音频版）

```bash
npm start
```

**预期结果**：
- 🌐 浏览器自动打开 http://localhost:3000
- 👁️ 看到 Remotion Studio 界面
- 📋 左侧列表显示 "Act1-Simple" 和 "Act1-Full"

### ✅ Step 4: 播放预览

1. 点击 **Act1-Simple**
2. 点击中央播放按钮（或按空格键）
3. 观看20秒动画

**预期效果**：
- 0:00-0:03 - 纯黑屏幕
- 0:03 - 白色方块光标出现并闪烁
- 0:05 - 字符 'a' 显示
- 0:08-0:12 - 字符变化 'asdf' → 'wasd'
- 0:12-0:16 - 光标移动，终端窗口展开
- 0:16-0:20 - 光标跳跃进入终端，绿色提示符 '>' 显示

---

## 进阶使用（可选）

### 🎵 Step 5: 生成音频文件

1. **打开音频生成器**
   ```bash
   # 在浏览器中打开
   F:\helloworld\hello-world-animation\audio-generator.html
   ```

2. **生成所有音频**
   - 点击 "生成所有音频文件" 按钮
   - 等待12个文件逐个下载

3. **放置音频文件**

   下载完成后，将文件放入对应目录：

   ```
   audio/
   ├── music/
   │   ├── 01_awakening_drone.wav
   │   └── 01_lofi_intro.wav
   └── sfx/
       ├── typing/
       │   ├── key_01.wav
       │   ├── key_02.wav
       │   └── key_03.wav
       ├── crt_startup.wav
       ├── delete.wav
       ├── collision.wav
       ├── terminal_open.wav
       ├── jump.wav
       ├── land.wav
       └── unix_login.wav
   ```

   **快速放置（Windows）**：
   ```bash
   # 假设所有文件下载到 Downloads 文件夹
   move %USERPROFILE%\Downloads\01_*.wav audio\music\
   move %USERPROFILE%\Downloads\key_*.wav audio\sfx\typing\
   move %USERPROFILE%\Downloads\*.wav audio\sfx\
   ```

4. **播放完整版**
   - 刷新 Remotion Studio
   - 选择 **Act1-Full**
   - 播放并听到音效和音乐

---

## 🎬 渲染输出视频

### 快速测试渲染

```bash
# 渲染简化版（约2分钟）
npx remotion render Act1-Simple out/test.mp4
```

**输出位置**：`out/test.mp4`

### 完整渲染（含音频）

```bash
# 确保音频文件已放置
npx remotion render Act1-Full out/act1-full.mp4
```

### 自定义渲染参数

```bash
# 720p快速渲染（测试用）
npx remotion render Act1-Simple out/720p.mp4 --width=1280 --height=720

# 只渲染特定片段（例如：第5-10秒）
npx remotion render Act1-Simple out/clip.mp4 --frames=300-600

# 并行渲染加速（4核心）
npx remotion render Act1-Simple out/fast.mp4 --concurrency=4

# 导出为PNG序列（用于后期处理）
npx remotion render Act1-Simple out/frames --sequence --image-format=png
```

---

## ⚠️ 常见问题诊断

### 问题1: npm install 卡住

**症状**：进度条不动超过5分钟

**解决方案**：
```bash
# 停止（Ctrl+C）
# 清理缓存
npm cache clean --force
# 换源重试
npm config set registry https://registry.npmmirror.com
npm install
```

### 问题2: 浏览器没有自动打开

**症状**：npm start 成功但浏览器没打开

**解决方案**：
- 手动访问：http://localhost:3000
- 或者：http://127.0.0.1:3000

### 问题3: 看不到 Act1-Simple

**症状**：左侧列表为空

**解决方案**：
```bash
# 检查 Root.tsx 是否正确
cat src\Root.tsx

# 重启开发服务器
# Ctrl+C 停止，然后重新
npm start
```

### 问题4: 黑屏无内容

**症状**：播放时只有黑屏

**检查清单**：
1. ✅ 时间轴是否在180帧之前？（光标在3秒后才出现）
2. ✅ 浏览器控制台是否有错误？（F12打开）
3. ✅ 是否选择了正确的composition？

**强制刷新**：Ctrl+Shift+R（Windows）

### 问题5: 音频不播放

**症状**：完整版没有声音

**检查清单**：
1. ✅ 音频文件是否已放置？
   ```bash
   dir audio\music
   dir audio\sfx
   ```

2. ✅ 文件名是否正确？（大小写敏感）
   - 必须是 `.wav` 后缀
   - 文件名必须精确匹配（如 `key_01.wav` 不是 `key1.wav`）

3. ✅ 浏览器是否静音？
   - 检查浏览器标签页音量图标
   - 检查系统音量

**调试方法**：
```tsx
// 在 Act1Awakening.tsx 中临时注释掉音频
// <Audio src={...} /> → 注释掉

// 逐个取消注释，找到问题文件
```

### 问题6: TypeScript错误

**症状**：编译失败，提示类型错误

**解决方案**：
```bash
# 重新安装类型定义
npm install --save-dev @types/react @types/react-dom typescript

# 删除缓存重启
rm -rf node_modules/.cache
npm start
```

---

## ✅ 验证成功标准

### 最小成功标准（无音频）

- [ ] npm install 无错误完成
- [ ] npm start 启动成功
- [ ] 浏览器自动打开 Remotion Studio
- [ ] 可以播放 Act1-Simple
- [ ] 看到光标闪烁和移动
- [ ] 看到终端窗口展开
- [ ] 可以渲染输出 MP4 文件

### 完整成功标准（含音频）

- [ ] 所有"最小成功标准"通过
- [ ] 音频文件已生成并放置
- [ ] 可以播放 Act1-Full
- [ ] 听到背景音乐和音效
- [ ] 音效与画面同步
- [ ] 可以渲染含音频的完整版本

---

## 📞 获取帮助

如果遇到无法解决的问题：

1. **检查完整日志**
   ```bash
   npm start > debug.log 2>&1
   ```
   将 `debug.log` 文件发送给技术支持

2. **重现步骤**
   - 记录具体操作步骤
   - 截图错误信息
   - 注明操作系统版本

3. **重新开始**
   ```bash
   # 完全清理重装（最后手段）
   rm -rf node_modules
   npm install
   ```

---

## 🎉 启动成功！

当你看到光标在屏幕中央闪烁时，恭喜你 —— 第一幕已经活了！

**接下来**：
1. 尝试调整参数（光标速度、颜色等）
2. 生成音频，体验完整版
3. 渲染输出视频分享
4. 开始计划第二幕

**记住**：这只是开始。7幕完整版在等着你！

---

```
   █  ← 它在等你
```

Good luck! 🚀
