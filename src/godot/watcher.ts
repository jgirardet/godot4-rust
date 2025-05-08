import { FullPathDir, FullPathFile } from "../types.js";
import { getGodotProjectDir, getGodotProjectFile } from "../godotProject.js";
import { GDScene } from "./types.js";
import { glob } from "glob";
import path from "path";
import { TscnParser } from "./parser.js";
import {
  FileSystemWatcher,
  RelativePattern,
  workspace,
  Disposable,
  Uri,
  ExtensionContext,
} from "vscode";
import { Stats } from "fs";
import { logger } from "../log.js";
import { lookup } from "dns";

export default class GodotProvider implements Disposable {
  _disposables: Disposable[] = [];

  _godotProjectDir: FullPathDir;

  _godotProjectFile: FullPathFile;

  filesWatcher: FileSystemWatcher;

  // scenes: GodotScene[] = [];

  constructor(context: ExtensionContext) {
    this._godotProjectFile = getGodotProjectFile();
    this._godotProjectDir = getGodotProjectDir(this._godotProjectFile);

    const pattern = new RelativePattern(this._godotProjectDir, "**/*.tscn");
    this.filesWatcher = workspace.createFileSystemWatcher(pattern);
    context.subscriptions.push(
      this,
      this.filesWatcher,
      this.filesWatcher.onDidCreate(this.onTscnChanged),
      this.filesWatcher.onDidDelete(this.onTscnDeleted),
      this.filesWatcher.onDidChange(this.onTscnDeleted)
    );

    logger.info("GodotProvider Activated");
    logger.info(`watching ${pattern.baseUri} ${pattern.pattern}`);
  }
  dispose() {
    logger.info("disposing");
    for (const disp of this._disposables) {
      disp.dispose();
    }
  }

  async loadProject() {
    for await (const absPath of glob.globIterate(
      path.join(this._godotProjectDir, "**/*.tscn"),
      { absolute: true }
    )) {
      // this.scenes.push(await GodotScene.new(absPath));
    }
  }

  onTscnChanged(u: Uri) {
    logger.info(`Changed detected to : ${u}`);
  }
  onTscnDeleted(u: Uri) {
    logger.info(`Changed detected to : ${u}`);
  }
}

