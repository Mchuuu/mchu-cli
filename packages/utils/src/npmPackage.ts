import fs from "fs";
import path from "path";
//@ts-ignore
import npminstall from "npminstall";
import fse from "fs-extra";
import { getLatestVersion, getNpmRegistry } from "./versionUtils.js";

export interface NpmPackageOptions {
  name: string;
  targetPath: string;
  version?: string;
}

class NpmPackage {
  name: string;
  version: string;
  targetPath: string;
  storePath: string;

  constructor(options: NpmPackageOptions) {
    this.name = options.name;
    this.targetPath = options.targetPath;
    this.version = options.version || "latest";
    this.storePath = path.resolve(options.targetPath, "node_modules");
  }

  get npmFilePath() {
    return path.resolve(
      this.storePath,
      `.store/${this.name.replace("/", "+")}@${this.version}/node_modules/${
        this.name
      }`
    );
  }

  async prepare() {
    if (!fs.existsSync(this.targetPath)) {
      fse.mkdirpSync(this.targetPath);
    }
    const version = await getLatestVersion(this.name);
    this.version = version;
  }

  async install() {
    await this.prepare();
    return npminstall({
      root: this.targetPath,
      registry: getNpmRegistry(),
      pkgs: [
        {
          name: this.name,
          version: this.version,
        },
      ],
    });
  }
  async exists() {
    await this.prepare();

    return fs.existsSync(this.npmFilePath);
  }

  async getLatestVersion() {
    return getLatestVersion(this.name);
  }
  async getPackageJSON() {
    if (await this.exists()) {
      return fse.readJsonSync(path.resolve(this.npmFilePath, "package.json"));
    }
    return null;
  }
  async update() {
    const latestVersion = await this.getLatestVersion();
    return npminstall({
      root: this.targetPath,
      registry: getNpmRegistry(),
      pkgs: [
        {
          name: this.name,
          version: latestVersion,
        },
      ],
    });
  }
}

export default NpmPackage;
