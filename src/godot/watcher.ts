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
import { WS_SCENES } from "../constantes.js";

export default class GodotProvider implements Disposable {
  _disposables: Disposable[] = [];

  _manager: GodotManager;

  _context: ExtensionContext;

  filesWatcher: FileSystemWatcher;

  constructor(context: ExtensionContext, godotProjectFile: FullPathFile) {
    this._manager = new GodotManager(godotProjectFile);
    this._context = context;

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
        this.writeContent().then((_) => {
          console.log("scences updated");
        });
      },
      (r) => {
        logger.error(`Starting Godot4 Rust Provider failed`);
        logger.error(r);
      }
    );
  }

  async writeContent() {
    await this._context.workspaceState.update(
      WS_SCENES,
      [...this._manager.scenes.values()].map((s) => s)
    );
  }

  onTscnChanged(u: Uri) {
    logger.info(`Changed detected to : ${u}`);
  }

  onTscnDeleted(u: Uri) {
    logger.info(`File Deleted : ${u}`);
  }
}
