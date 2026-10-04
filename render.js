const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');
const path = require('path');

const start = async () => {
  console.log('开始渲染...');

  try {
    // 1. 打包项目
    console.log('步骤1: 打包项目...');
    const bundleLocation = await bundle({
      entryPoint: path.join(__dirname, 'src/index.ts'),
      webpackOverride: (config) => config,
    });
    console.log('打包完成:', bundleLocation);

    // 2. 选择组合
    console.log('步骤2: 选择组合 Act1-Simple...');
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'Act1-Simple',
    });
    console.log('组合信息:', composition);

    // 3. 渲染视频
    console.log('步骤3: 渲染视频...');
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: path.join(__dirname, 'out/act1-simple.mp4'),
      onProgress: ({progress}) => {
        console.log(`渲染进度: ${(progress * 100).toFixed(1)}%`);
      },
    });

    console.log('✅ 渲染完成!');
    console.log('输出文件: out/act1-simple.mp4');
  } catch (error) {
    console.error('❌ 渲染失败:', error);
    process.exit(1);
  }
};

start();
