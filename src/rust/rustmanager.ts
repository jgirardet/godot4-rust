import {
  ExtensionContext,
  FileSystemWatcher,
  Uri,
  workspace,
  RelativePattern,
} from "vscode";
import { FullPathFile, Name } from "../types";
import { GodotModule, RustParsed } from "./types";
import { RustParser } from "./parser";

export type RustFiles = Map<FullPathFile, RustParsed>;

export class RustManager {
  modules: Map<Name, GodotModule> = new Map();
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

  isRustStruct(godotType: string): boolean {
    return godotType in this.modules;
  }

  getByPath(filepath: FullPathFile): GodotModule | undefined {
    return [...this.modules.values()].find((p) => p.path === filepath);
  }

  async reload() {
    let ws = workspace.workspaceFolders?.at(0);
    if (!ws) {
      return;
    }
    this.modules.clear();
    for (const f of await workspace.findFiles(
      new RelativePattern(ws, "src/**/*.rs")
    )) {
      let parser = await RustParser.file(f.fsPath);
      if (parser.isGodotModule) {
        let cls = parser.findGodotClass();
        if (cls) {
          this.modules.set(cls.className, { path: f.fsPath, ...cls });
        }
      }
    }
  }
}
