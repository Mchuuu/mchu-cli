import fs from "fs";
import fse from "fs-extra";
import ora from "ora";
import { input } from "@inquirer/prompts";
import path, { dirname } from "node:path";
import { DeepSeek, Type as ModelType } from "./DeepSeek.js";
import { fileURLToPath } from "node:url";
import { remark } from "remark";

async function generate() {
  let componentDir = "";
  while (!componentDir) {
    componentDir = await input({
      message: "请输入组件目录",
      default: "src/components",
    });
  }
  let componentDesc = "";
  while (!componentDesc) {
    componentDesc = await input({ message: "请输入组件描述" });
  }
  const spinner = ora("正在生成组件").start();
  const deepSeek = new DeepSeek();
  const response = await deepSeek.chat(ModelType.V3, [
    {
      role: "system",
      content: fs.readFileSync(
        path.resolve(dirname(fileURLToPath(import.meta.url)), "../system.md"),
        "utf-8"
      ),
    },
    {
      role: "user",
      content: componentDesc,
    },
  ]);
  const markdown = response.choices[0].message.content || "";
  // 解析 markdown 生成组件
  await remark()
    .use((...args) => {
      return function (tree: any) {
        let curPath = "";
        tree.children.forEach((node: any) => {
          if (node.type === "heading") {
            curPath = path.join(componentDir, node.children[0].value);
          } else if (node.type === "code") {
            fse.ensureFileSync(curPath);
            fse.writeFileSync(curPath, node.value);
          }
        });
      };
    })
    .process(markdown);
  spinner.succeed("组件生成成功");

  console.log(response.choices[0].message.content || "");
}
generate();
export default generate;
