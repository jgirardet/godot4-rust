import {
  Extension,
  ExtensionContext,
  FileSystemWatcher,
  Uri,
  window,
  workspace,
  GlobPattern,
  RelativePattern,
} from "vscode";
import { FullPathDir, FullPathFile } from "../types";
import { GodotModule } from "./types";
import { globIterate } from "glob";
import { RustParser } from "./parser";

export class RustManager {
  files: Map<FullPathFile, GodotModule> = new Map();
  readonly watcher: FileSystemWatcher;

  constructor(context: ExtensionContext) {
    context.subscriptions.push(
      (this.watcher = workspace.createFileSystemWatcher("**/*.rs"))
    );

    this.reload().then(() =>
      context.subscriptions.push(
        this.watcher.onDidChange(this.onFileChanged.bind(this)),
        this.watcher.onDidCreate(this.onFileChanged.bind(this)),
        this.watcher.onDidDelete(this.onFileDeleted.bind(this))
      )
    );
  }

  onFileChanged(u: Uri) {}
  onFileDeleted(u: Uri) {}

  async reload() {
    let ws = workspace.workspaceFolders?.at(0);
    if (!ws) {
      return;
    }
    this.files.clear();
    for (const f of await workspace.findFiles(
      new RelativePattern(ws, "**.*rs")
    )) {
      let parser = await RustParser.file(f.fsPath);
      if (parser.isGodotModule) {
        let cls = parser.findGodotClass();
        if (cls) {
          this.files.set(f.fsPath, cls);
        }
      }
    }
  }
}
