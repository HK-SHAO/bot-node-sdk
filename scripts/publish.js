const readlineSync = require('readline-sync');
const chalk = require('chalk');
const sh = require('shelljs');

// 发布流程：npm run release -> npm run build -> npm publish -> git push --tag -> git push

let headCommit;

const continuePublish = () => {
  // 执行build
  console.log();
  console.log(chalk.blue('----- 2. build(start) -----'));
  sh.exec('npm run build');
  console.log();
  console.log(chalk.blue('----- build(end) -----'));

  // 执行 publish
  console.log();
  console.log(chalk.blue('----- 3. publish(start) -----'));
  sh.exec('npm publish');
  console.log();
  console.log(chalk.blue('----- publish(end) -----'));

  // push 标签
  console.log();
  console.log(chalk.blue('----- 4. push tag(start) -----'));
  sh.exec('git push --tag');
  console.log();
  console.log(chalk.blue('----- push tag(end) -----'));

  // push 代码
  console.log();
  console.log(chalk.blue('----- 5. push code(start) -----'));
  sh.exec('git push');
  console.log(chalk.blue('----- push code(end) -----'));

  console.log();
  console.log(chalk.green('===== finish publish ====='));
};

// 发布版本
const runRelease = (version) => {
  console.log(chalk.blue('----- 1. release(start) -----'));
  if (version) {
    console.log(chalk.yellowBright('release version : ', version));

    sh.exec(`npm run release -- --release-as ${version}`);
  } else {
    sh.exec('npm run release');
  }
  console.log();
  console.log(chalk.blue('----- release(end) -----'));
  console.log();
};

// 停止发布
const stopPublish = () => {
  console.log();
  console.log(chalk.red('===== stop publish ====='));
};

try {
  headCommit = sh.exec('git rev-parse --short HEAD').toString();
  console.log('HEAD: ', headCommit);

  console.log();
  console.log(chalk.green('===== start publish ====='));
  console.log();

  // 开始release
  runRelease();

  if (readlineSync.keyInYN(chalk.yellowBright('Is this version ok？'))) {
    continuePublish();
  } else {
    // 回滚
    sh.exec(`git reset --hard ${headCommit}`);
    sh.exec('git push -f');

    // 手动输入版本号
    if (readlineSync.keyInYN(chalk.yellowBright('continue with input version？'))) {
      const version = readlineSync.question('verison(e.g. 1.1.1): ', { limit: /[0-9]+\.[0-9]+\.[0-9]+$/ });
      runRelease(version);
      continuePublish();
    } else {
      stopPublish();
    }
  }
} catch (error) {
  console.log(chalk.redBright('publish broke'));
  console.log(error);
}
