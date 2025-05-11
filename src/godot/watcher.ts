import { FullPathFile } from "../types.js";
import {
  FileSystemWatcher,
  RelativePattern,
  workspace,
  Disposable,
  Uri,
  ExtensionContext,
} from "vscode";
import { logger } from "../log.js";
import { GodotManager } from "./godotManager.js";

export default class GodotProvider implements Disposable {
  _disposables: Disposable[] = [];

  _manager: GodotManager;

  filesWatcher: FileSystemWatcher;

  constructor(context: ExtensionContext, godotProjectFile: FullPathFile) {
    this._manager = new GodotManager(godotProjectFile);

    const pattern = new RelativePattern(this._manager.projectDir, "**/*.tscn");
    this.filesWatcher = workspace.createFileSystemWatcher(pattern);
    context.subscriptions.push(
      this,
      this.filesWatcher,
      this.filesWatcher.onDidCreate(this.onTscnChanged),
      this.filesWatcher.onDidChange(this.onTscnChanged),
      this.filesWatcher.onDidDelete(this.onTscnDeleted)
    );
    logger.info(`watching ${pattern.baseUri} ${pattern.pattern}`);
  }
  dispose() {
    logger.info("disposing");
    for (const disp of this._disposables) {
      disp.dispose();
    }
  }

  start() {
    this._manager.load().then(
      (_) => {
        logger.info("GodotProvider Activated");
      },
      (r) => {
        logger.error(`Starting Godot4 Rust Provider failed`);
        logger.error(r);
      }
    );
  }

  onTscnChanged(u: Uri) {
    logger.info(`Changed detected to : ${u}`);
  }
  onTscnDeleted(u: Uri) {
    logger.info(`File Deleted : ${u}`);
  }
}
