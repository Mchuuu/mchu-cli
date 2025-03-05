import { select, input, confirm, checkbox } from "@inquirer/prompts";
import { NpmPackage } from "@mchu-cli/utils";
import { glob } from "glob";

import os from "node:os";
import path from "node:path";
import ora from "ora";
import fse from "fs-extra";
import ejs from "ejs";
async function create() {
  const projectTemplate = await select({
    message: "请选择项目模版",
    choices: [
      {
        name: "react 项目",
        value: "@mchu-cli/template-react",
      },
      {
        name: "vue 项目",
        value: "@mchu-cli/template-vue",
      },
    ],
  });

  let projectName = "";
  while (!projectName) {
    projectName = await input({ message: "请输入项目名" });
  }
  // 安装可选配置
  const options = await checkbox({
    message: "请选择项目配置",
    choices: [
      {
        name: "EsLint",
        value: "eslint",
      },
      {
        name: "Sass",
        value: "sass",
      },
    ],
  });
  // 项目目录不为空则清空
  if (fse.existsSync(projectName)) {
    const empty = await confirm({
      message: "当前目录不为空，是否清空目录？",
    });
    if (empty) {
      fse.emptyDirSync(projectName);
    } else {
      process.exit(0);
    }
  }

  // 模板包
  const templatePkg = new NpmPackage({
    name: projectTemplate,
    targetPath: path.resolve(os.homedir(), ".mchu-cli-template"),
  });
  if (!(await templatePkg.exists())) {
    const spinner = ora("template downloading...").start();
    await templatePkg.install();
    await sleep(1000);
    spinner.stop();
  } else {
    const spinner = ora("template updating...").start();
    await templatePkg.update();
    await sleep(1000);
    spinner.stop();
  }

  const spinner = ora("project creating...").start();
  const tempPath = path.join(templatePkg.npmFilePath, "template");
  const targetPath = path.resolve(process.cwd(), projectName);
  fse.copySync(tempPath, targetPath);

  const renderData: Record<string, any> = options.reduce(
    (acc: Record<string, any>, cur) => {
      acc[cur] = true;
      return acc;
    },
    { projectName }
  );

  // 渲染EJS模板
  const files = await glob("**", {
    cwd: targetPath,
    nodir: true,
    ignore: ["**/node_modules/**", "**/.store/**"],
  });
  for (const file of files) {
    const filePath = path.resolve(targetPath, file);
    const content = await ejs.renderFile(filePath, renderData);
    fse.writeFileSync(filePath, content);
  }
  // 根据option删除配置文件
  const optionConfig = fse.readJSONSync(
    path.resolve(targetPath, "options.config.json")
  );
  for (let key in optionConfig) {
    if (!renderData[key]) {
      optionConfig[key].files.forEach((file: string) => {
        fse.removeSync(path.resolve(targetPath, file));
      });
    }
  }
  // 删除配置文件
  fse.removeSync(path.resolve(targetPath, "options.config.json"));

  spinner.stop();

  console.log(
    `${projectName} 创建成功，请运行以下命令进行项目初始化：
    cd ${projectName}
    npm install
    npm run dev
    `
  );
}
function sleep(timeout: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}
create();

export default create;
