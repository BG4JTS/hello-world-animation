# 快速启动指南 - 第一幕预览

## 最快预览方法（2分钟内看到效果）

### 步骤 1: 安装依赖

```bash
cd F:\helloworld\hello-world-animation
npm install
```

这会安装 Remotion 和所有必要依赖（约1分钟）。

### 步骤 2: 启动预览（无音频版）

```bash
npm start
```

浏览器会自动打开 http://localhost:3000

### 步骤 3: 选择预览版本

在 Remotion Studio 中，你会看到两个composition：

1. **Act1-Simple** ⚡ 推荐先看这个
   - 无音频版本
   - 立即可播放
   - 包含完整动画

2. **Act1-Full** 🎵 需要音频文件
   - 完整版（含音乐和音效）
   - 需要先生成音频文件

### 步骤 4: 播放预览

- 点击 **Act1-Simple**
- 点击播放按钮（空格键）
- 观看20秒动画

---

## 完整版启动（含音频）

### 额外步骤: 生成音频

1. 打开 `audio-generator.html` 在浏览器中
2. 点击 "生成所有音频文件"
3. 下载所有WAV文件到对应目录：

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

4. 在Remotion Studio中选择 **Act1-Full**

---

## 渲染输出视频

### 方法1: 简化版（快速测试）

```bash
npx remotion render Act1-Simple out/act1-simple.mp4
```

### 方法2: 完整版（需要音频）

```bash
npx remotion render Act1-Full out/act1-full.mp4
```

### 渲染参数（可选）

```bash
# 指定分辨率（更快渲染）
npx remotion render Act1-Simple out/test.mp4 --width=1280 --height=720

# 指定帧范围（测试特定片段）
npx remotion render Act1-Simple out/test.mp4 --frames=180-480

# 并行渲染（更快）
npx remotion render Act1-Simple out/test.mp4 --concurrency=4
```

---

## 时间轴参考

| 时间 | 帧数 | 场景 |
|------|------|------|
| 0:00-0:03 | 0-180 | 纯黑虚空 |
| 0:03-0:05 | 180-300 | 光标首次闪烁 |
| 0:05-0:08 | 300-480 | 输入字符 'a' |
| 0:08-0:10 | 480-600 | 输入 'asdf' |
| 0:10-0:12 | 600-720 | 删除后输入 'wasd' |
| 0:12-0:13 | 720-820 | 光标移动 |
| 0:13-0:16 | 820-960 | 终端窗口展开 |
| 0:16-0:18 | 960-1080 | 光标跳跃进入 |
| 0:18-0:20 | 1080-1200 | 提示符显示 |

---

## 调试快捷键

在 Remotion Studio 中：

- **空格** - 播放/暂停
- **← →** - 前进/后退1帧
- **J K** - 后退/前进10帧
- **M** - 静音
- **F** - 全屏
- **/** - 跳转到特定帧

---

## 常见问题

### Q: npm install 很慢？
A: 使用国内镜像：
```bash
npm config set registry https://registry.npmmirror.com
npm install
```

### Q: 端口3000被占用？
A: 修改端口：
```bash
PORT=3001 npm start
```

### Q: 看不到光标？
A: 检查时间轴，光标在第180帧后才出现（3秒后）

### Q: 想加速预览？
A: 点击播放速度按钮，选择 2x 或 4x

---

## 下一步

✅ 完成第一幕预览后，可以：

1. 调整动画参数（修改 `Act1AwakeningSimple.tsx`）
2. 生成音频文件，体验完整版
3. 渲染输出视频分享
4. 开始实现第二幕

---

**祝你创作顺利！ 🚀**
