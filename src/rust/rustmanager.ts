import {
  Extension,
  ExtensionContext,
  FileSystemWatcher,
  Uri,
  window,
  workspace,
  GlobPattern,
  RelativePattern,
  EventEmitter,
  Event,
} from "vscode";
import { FullPathDir, FullPathFile } from "../types";
import { GodotModule } from "./types";
import { globIterate } from "glob";
import { RustParser } from "./parser";

export type RustFiles = Map<FullPathFile, GodotModule>;

export class RustManager {
  files: Map<FullPathFile, GodotModule> = new Map();
  readonly watcher: FileSystemWatcher;

  // rustFilesChanged = new EventEmitter<RustFiles>();
  // rustFilesChangedEvent: Event<RustFiles>;

  constructor(context: ExtensionContext) {
    context.subscriptions.push(
      (this.watcher = workspace.createFileSystemWatcher("**/*.rs"))
    );
    // this.rustFilesChangedEvent = this.rustFilesChanged.event;

    this.reload().then(() =>
      context.subscriptions
        .push
        // this.watcher.onDidChange(this.onFileChanged.bind(this)),
        // this.watcher.onDidCreate(this.onFileChanged.bind(this)),
        // this.watcher.onDidDelete(this.onFileChanged.bind(this))
        ()
    );
  }

  // async onFileChanged(u: Uri) {
  //   if (await this._parse(u.fsPath)) {
  //     this.rustFilesChanged.fire(this.files);
  //   }
  // }
  async onFileDeleted(u: Uri) {}

  async reload() {
    let ws = workspace.workspaceFolders?.at(0);
    if (!ws) {
      return;
    }
    this.files.clear();
    for (const f of await workspace.findFiles(
      new RelativePattern(ws, "**/*.rs")
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

  async _parse(f: FullPathFile): Promise<boolean> {
    let parser = await RustParser.file(f);
    if (parser.isGodotModule) {
      let cls = parser.findGodotClass();
      if (cls) {
        if (!this.files.has(f)) {
          this.files.set(f, cls);
          return true;
        }
      }
    }
    return false;
  }
}
