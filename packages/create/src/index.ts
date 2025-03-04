import { select, input, confirm } from "@inquirer/prompts";
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
  const tempPath = path.join(templatePkg.targetPath, "template");
  const targetPath = path.resolve(process.cwd(), projectName);
  fse.copySync(tempPath, targetPath);
  spinner.stop();

  // 渲染EJS模板
  const files = await glob("**", {
    cwd: targetPath,
    nodir: true,
    ignore: ["**/node_modules/**", "**/.store/**"],
  });
  for (const file of files) {
    const filePath = path.resolve(targetPath, file);
    const content = await ejs.renderFile(filePath, { projectName });
    fse.writeFileSync(filePath, content);
  }

  console.log(projectTemplate, projectName);
}
function sleep(timeout: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}
create();

export default create;
