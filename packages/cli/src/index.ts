#!/usr/bin/env node
import create from "@mchu-cli/create";
import generate from "@mchu-cli/generate";
import { Command } from "commander";
import fse from "fs-extra";
import path from "node:path";

const pkgJson = fse.readJSONSync(
  path.join(import.meta.dirname, "../package.json")
);

const program = new Command();

program.name("mchu-cli").description("脚手架 cli").version(pkgJson.version);

program
  .command("create")
  .description("创建项目")
  .action(async () => {
    create();
  });

program
  .command("generate")
  .description("AI 生成代码")
  .action(async () => {
    generate();
  });

program.parse();
