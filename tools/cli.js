#!/usr/bin/env node

/**
 * 🚀 快速开发命令行工具
 *
 * 用法:
 *   npm run dev            # 启动预览服务器
 *   npm run validate       # 验证场景
 *   npm run render         # 渲染视频
 *   npm run render:fast    # 快速渲染（低质量）
 *   npm run play           # 播放最新渲染的视频
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

function log(color, ...args) {
  console.log(color + args.join(' ') + colors.reset);
}

function exec(command, description) {
  log(colors.cyan, `\n▶ ${description}...`);
  log(colors.gray, `  $ ${command}\n`);
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    log(colors.red, `\n❌ 执行失败: ${description}`);
    return false;
  }
}

function header(title) {
  console.log('\n' + '='.repeat(60));
  log(colors.bold + colors.cyan, title);
  console.log('='.repeat(60) + '\n');
}

async function main() {
  const command = process.argv[2] || 'help';

  switch (command) {
    case 'dev':
    case 'preview':
      header('🎬 启动预览服务器');
      exec('npm start', '启动Remotion Studio');
      break;

    case 'validate':
    case 'check':
      header('🔍 验证场景');
      const scenePath = process.argv[3] || 'src/scenes/Act1AwakeningSimple.tsx';
      const success = exec(`node tools/pre-render-validator.js ${scenePath}`, '运行验证器');
      if (success) {
        log(colors.green, '\n✅ 验证通过！可以安全渲染。');
      } else {
        log(colors.red, '\n❌ 验证失败！请修复问题后再渲染。');
        process.exit(1);
      }
      break;

    case 'render':
      header('🎥 渲染视频（高质量）');
      exec('node tools/pre-render-validator.js', '1. 预验证');
      exec('node render.js', '2. 开始渲染');
      log(colors.green, '\n✅ 渲染完成！');
      log(colors.cyan, '   视频位置: out/act1-simple.mp4\n');
      break;

    case 'render:fast':
      header('⚡ 快速渲染（低质量）');
      exec('node tools/pre-render-validator.js', '1. 预验证');
      exec('REMOTION_CONCURRENCY=4 REMOTION_JPEG_QUALITY=50 node render.js', '2. 快速渲染');
      log(colors.green, '\n✅ 快速渲染完成！');
      break;

    case 'play':
      header('▶️ 播放视频');
      const outDir = path.join(__dirname, '../out');
      const videos = fs.readdirSync(outDir)
        .filter(f => f.endsWith('.mp4'))
        .map(f => ({
          name: f,
          path: path.join(outDir, f),
          mtime: fs.statSync(path.join(outDir, f)).mtime,
        }))
        .sort((a, b) => b.mtime - a.mtime);

      if (videos.length === 0) {
        log(colors.red, '❌ 没有找到渲染的视频');
        process.exit(1);
      }

      const latest = videos[0];
      log(colors.cyan, `播放: ${latest.name}`);
      log(colors.gray, `修改时间: ${latest.mtime.toLocaleString()}\n`);

      if (process.platform === 'win32') {
        exec(`start ${latest.path}`, '打开视频');
      } else if (process.platform === 'darwin') {
        exec(`open ${latest.path}`, '打开视频');
      } else {
        exec(`xdg-open ${latest.path}`, '打开视频');
      }
      break;

    case 'clean':
      header('🧹 清理临时文件');
      exec('rm -rf out/*.mp4', '删除渲染输出');
      exec('rm -rf node_modules/.cache', '删除缓存');
      log(colors.green, '\n✅ 清理完成！');
      break;

    case 'list':
      header('📋 已渲染的视频');
      const outDirList = path.join(__dirname, '../out');
      if (!fs.existsSync(outDirList)) {
        log(colors.gray, '(空)');
        break;
      }

      const videosList = fs.readdirSync(outDirList)
        .filter(f => f.endsWith('.mp4'))
        .map(f => {
          const fullPath = path.join(outDirList, f);
          const stats = fs.statSync(fullPath);
          return {
            name: f,
            size: (stats.size / 1024 / 1024).toFixed(2) + ' MB',
            mtime: stats.mtime.toLocaleString(),
          };
        })
        .sort((a, b) => new Date(b.mtime) - new Date(a.mtime));

      if (videosList.length === 0) {
        log(colors.gray, '(空)');
      } else {
        videosList.forEach((v, idx) => {
          log(colors.cyan, `${idx + 1}. ${v.name}`);
          log(colors.gray, `   大小: ${v.size}, 修改: ${v.mtime}`);
        });
      }
      break;

    case 'help':
    default:
      header('📚 帮助文档');
      console.log('可用命令:\n');
      log(colors.cyan, '  npm run dev            ');
      console.log('  启动预览服务器（实时预览，调参神器）\n');

      log(colors.cyan, '  npm run validate       ');
      console.log('  验证场景（检查重叠、时间线等问题）\n');

      log(colors.cyan, '  npm run render         ');
      console.log('  渲染视频（高质量，需2-3分钟）\n');

      log(colors.cyan, '  npm run render:fast    ');
      console.log('  快速渲染（低质量，用于快速检查）\n');

      log(colors.cyan, '  npm run play           ');
      console.log('  播放最新渲染的视频\n');

      log(colors.cyan, '  npm run list           ');
      console.log('  列出所有已渲染的视频\n');

      log(colors.cyan, '  npm run clean          ');
      console.log('  清理临时文件和渲染输出\n');

      console.log('\n推荐工作流:\n');
      log(colors.yellow, '  1. npm run dev         ');
      console.log('→ 在浏览器中调整参数');
      log(colors.yellow, '  2. npm run validate    ');
      console.log('→ 验证无误');
      log(colors.yellow, '  3. npm run render      ');
      console.log('→ 渲染最终视频');
      log(colors.yellow, '  4. npm run play        ');
      console.log('→ 查看结果\n');
      break;
  }
}

main().catch((error) => {
  log(colors.red, '\n❌ 发生错误:', error.message);
  process.exit(1);
});
