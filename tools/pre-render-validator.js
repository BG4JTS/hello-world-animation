/**
 * 预渲染验证器 - 在渲染前检查常见错误
 *
 * 检查项：
 * 1. 组件重叠检测
 * 2. 时间线连续性
 * 3. 动画缓动曲线
 * 4. 位置计算错误
 * 5. 透明度异常
 */

const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(color, ...args) {
  console.log(color + args.join(' ') + colors.reset);
}

// 检查项类型
const CheckType = {
  CRITICAL: 'CRITICAL',
  WARNING: 'WARNING',
  INFO: 'INFO',
};

class ValidationResult {
  constructor() {
    this.issues = [];
    this.passed = 0;
    this.warnings = 0;
    this.critical = 0;
  }

  addIssue(type, category, message, fix = null) {
    this.issues.push({ type, category, message, fix });

    if (type === CheckType.CRITICAL) this.critical++;
    else if (type === CheckType.WARNING) this.warnings++;
    else this.passed++;
  }

  hasBlockers() {
    return this.critical > 0;
  }

  print() {
    console.log('\n' + '='.repeat(80));
    log(colors.cyan, '🔍 预渲染验证报告');
    console.log('='.repeat(80) + '\n');

    // 统计
    log(colors.green, `✅ 通过: ${this.passed}`);
    log(colors.yellow, `⚠️  警告: ${this.warnings}`);
    log(colors.red, `❌ 严重: ${this.critical}`);
    console.log('');

    // 详细问题
    if (this.issues.length > 0) {
      this.issues.forEach((issue, idx) => {
        const icon = issue.type === CheckType.CRITICAL ? '❌' :
                     issue.type === CheckType.WARNING ? '⚠️' : 'ℹ️';

        console.log(`${icon} [${issue.category}] ${issue.message}`);
        if (issue.fix) {
          log(colors.gray, `   💡 修复建议: ${issue.fix}`);
        }
        console.log('');
      });
    }

    console.log('='.repeat(80));

    if (this.hasBlockers()) {
      log(colors.red, '\n🚫 发现严重问题，建议修复后再渲染\n');
      return false;
    } else if (this.warnings > 0) {
      log(colors.yellow, '\n⚠️  发现警告，建议检查但可以继续渲染\n');
      return true;
    } else {
      log(colors.green, '\n✅ 验证通过，可以安全渲染！\n');
      return true;
    }
  }
}

/**
 * 检查1: 组件重叠检测
 */
function checkOverlapping(sceneCode, result) {
  log(colors.cyan, '\n📐 检查组件重叠...');

  // 提取所有带位置的组件
  const components = [];

  // 匹配 <ASCIIText ... x={} y={} />
  const textRegex = /<ASCIIText[^>]*x=\{([^}]+)\}[^>]*y=\{([^}]+)\}[^>]*\/>/g;
  let match;

  while ((match = textRegex.exec(sceneCode)) !== null) {
    const x = match[1].trim();
    const y = match[2].trim();

    // 只检查固定位置（数字）
    if (/^\d+$/.test(x) && /^\d+$/.test(y)) {
      components.push({
        type: 'ASCIIText',
        x: parseInt(x),
        y: parseInt(y),
        width: 30, // 假设每个字符30px宽
        height: 48, // 默认字体大小
        line: sceneCode.substring(0, match.index).split('\n').length,
      });
    }
  }

  // 检查重叠
  for (let i = 0; i < components.length; i++) {
    for (let j = i + 1; j < components.length; j++) {
      const a = components[i];
      const b = components[j];

      // 检测矩形重叠
      const overlapping = !(
        a.x + a.width < b.x ||
        b.x + b.width < a.x ||
        a.y + a.height < b.y ||
        b.y + b.height < a.y
      );

      if (overlapping) {
        result.addIssue(
          CheckType.CRITICAL,
          '组件重叠',
          `第${a.line}行和第${b.line}行的组件可能重叠 (位置: ${a.x},${a.y} vs ${b.x},${b.y})`,
          '确保每个文字元素有独立的位置，间隔至少50px'
        );
      }
    }
  }

  if (components.length === 0) {
    result.addIssue(CheckType.INFO, '组件检测', '未检测到固定位置组件');
  } else {
    log(colors.green, `  检测到 ${components.length} 个固定位置组件`);
  }
}

/**
 * 检查2: 时间线连续性
 */
function checkTimeline(sceneCode, result) {
  log(colors.cyan, '\n⏱️  检查时间线连续性...');

  // 提取所有 frame >= XXX 的条件
  const timelineRegex = /frame\s*>=\s*(\d+)/g;
  const timestamps = [];
  let match;

  while ((match = timelineRegex.exec(sceneCode)) !== null) {
    timestamps.push(parseInt(match[1]));
  }

  timestamps.sort((a, b) => a - b);

  // 检查是否有大的跳跃（超过300帧=5秒）
  for (let i = 1; i < timestamps.length; i++) {
    const gap = timestamps[i] - timestamps[i - 1];
    if (gap > 300) {
      result.addIssue(
        CheckType.WARNING,
        '时间线跳跃',
        `帧 ${timestamps[i - 1]} 到 ${timestamps[i]} 之间有 ${gap} 帧空白 (${(gap / 60).toFixed(1)}秒)`,
        '检查是否有遗漏的动画阶段'
      );
    }
  }

  log(colors.green, `  检测到 ${timestamps.length} 个时间点`);
}

/**
 * 检查3: 缓动函数检测
 */
function checkEasing(sceneCode, result) {
  log(colors.cyan, '\n🎢 检查动画缓动...');

  // 检查是否使用了硬编码的线性插值
  const linearCount = (sceneCode.match(/interpolate\([^)]+\)/g) || []).length;
  const easingCount = (sceneCode.match(/Easing\./g) || []).length;

  if (linearCount > 5 && easingCount === 0) {
    result.addIssue(
      CheckType.WARNING,
      '动画缓动',
      `发现 ${linearCount} 处线性插值，但没有使用缓动函数`,
      '导入 Easing 并使用 easeInOutCubic, easeOutExpo 等缓动'
    );
  }

  // 检查是否有突兀的瞬移（没有插值直接赋值）
  const directAssignments = sceneCode.match(/const\s+\w+X\s*=\s*\d+;/g) || [];
  if (directAssignments.length > 3) {
    result.addIssue(
      CheckType.WARNING,
      '位置计算',
      '检测到多个硬编码的位置赋值，可能导致瞬移',
      '使用 interpolate 或 spring 来平滑过渡'
    );
  }

  log(colors.green, `  线性插值: ${linearCount}, 缓动函数: ${easingCount}`);
}

/**
 * 检查4: delay参数一致性
 */
function checkDelayConsistency(sceneCode, result) {
  log(colors.cyan, '\n⏰ 检查delay参数...');

  // 匹配 <ASCIIText ... delay={XXX} />
  const delayRegex = /delay=\{(\d+)\}/g;
  const frameRegex = /frame\s*>=\s*(\d+)\s*&&[^{]*<ASCIIText[^>]*delay=\{(\d+)\}/g;

  let match;
  const mismatches = [];

  while ((match = frameRegex.exec(sceneCode)) !== null) {
    const conditionFrame = parseInt(match[1]);
    const delayFrame = parseInt(match[2]);

    // delay应该等于或略大于条件帧
    if (Math.abs(delayFrame - conditionFrame) > 30) {
      mismatches.push({ conditionFrame, delayFrame });
    }
  }

  mismatches.forEach(({ conditionFrame, delayFrame }) => {
    result.addIssue(
      CheckType.WARNING,
      'delay不匹配',
      `条件帧 ${conditionFrame} 与 delay ${delayFrame} 不一致`,
      `delay 应该等于条件帧，例如: frame >= 300 时 delay={300}`
    );
  });

  if (mismatches.length === 0) {
    log(colors.green, '  delay参数一致性检查通过');
  }
}

/**
 * 检查5: 摄像机运动（未来扩展）
 */
function checkCameraMotion(sceneCode, result) {
  log(colors.cyan, '\n📹 检查摄像机运动...');

  // TODO: 检查是否有平滑的摄像机过渡
  // 当前版本没有摄像机，跳过

  log(colors.gray, '  (当前场景无摄像机运动)');
}

/**
 * 主验证函数
 */
async function validateScene(scenePath) {
  log(colors.cyan, `\n🎬 验证场景: ${path.basename(scenePath)}\n`);

  if (!fs.existsSync(scenePath)) {
    log(colors.red, `❌ 场景文件不存在: ${scenePath}`);
    process.exit(1);
  }

  const sceneCode = fs.readFileSync(scenePath, 'utf-8');
  const result = new ValidationResult();

  // 执行所有检查
  checkOverlapping(sceneCode, result);
  checkTimeline(sceneCode, result);
  checkEasing(sceneCode, result);
  checkDelayConsistency(sceneCode, result);
  checkCameraMotion(sceneCode, result);

  // 输出报告
  const canProceed = result.print();

  return canProceed;
}

// CLI执行
if (require.main === module) {
  const scenePath = process.argv[2] || path.join(__dirname, '../src/scenes/Act1AwakeningSimple.tsx');

  validateScene(scenePath).then((canProceed) => {
    process.exit(canProceed ? 0 : 1);
  });
}

module.exports = { validateScene, ValidationResult, CheckType };
