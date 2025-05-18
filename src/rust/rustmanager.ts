import {
  ExtensionContext,
  FileSystemWatcher,
  Uri,
  workspace,
  RelativePattern,
  window,
  EventEmitter,
  Event,
} from "vscode";
import { FullPathFile, Name } from "../types";
import { GodotModule, RustParsed } from "./types";
import { RustParser } from "./parser";

export type RustFiles = Map<FullPathFile, RustParsed>;

export class RustManager {
  modules: Map<Name, GodotModule> = new Map();
  readonly watcher: FileSystemWatcher;

  rustFilesChanged = new EventEmitter<RustFiles | void>();
  rustFilesChangedEvent: Event<RustFiles | void> = this.rustFilesChanged.event;

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

  async onFileChanged(u: Uri) {
    let gm = await this.tryGodotClass(u);
    if (gm) {
      return this.update(gm);
    }
  }

  async onFileDeleted(u: Uri) {
    let gm = await this.tryGodotClass(u);
    if (gm) {
      return this.update(gm, true);
    }
  }

  async update(gm: GodotModule, remove = false) {
    if (remove) {
      this.modules.delete(gm.className);
      this.rustFilesChanged.fire();
    } else {
      const stored = this.modules.get(gm.className);
      if (!stored || gm !== stored) {
        this.modules.set(gm.className, gm);
        this.rustFilesChanged.fire();
      }
    }
  }

  isRustStruct(godotType: string): boolean {
    return godotType in this.modules;
  }

  getByPath(filepath: FullPathFile): GodotModule | undefined {
    return [...this.modules.values()].find((p) => p.path === filepath);
  }

  // only match on persisted files.
  async TryGodoClassInEditor(): Promise<GodotModule | undefined> {
    if (window.activeTextEditor) {
      return;
    }
    const { document } = window.activeTextEditor!;
    if (document.isUntitled || !document.fileName.endsWith(".rs")) {
      return;
    }
    if (document.isDirty) {
      await document.save();
    }

    return await this.tryGodotClass(document.uri);
  }

  async tryGodotClass(f: Uri): Promise<GodotModule | undefined> {
    let parser = await RustParser.file(f.fsPath);
    if (parser.isGodotModule) {
      let cls = parser.findGodotClass();
      if (cls) {
        return cls.className, { path: f.fsPath, ...cls };
      }
    }
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
      let gc = await this.tryGodotClass(f);
      if (gc) {
        this.modules.set(gc.className, gc);
      }
    }
  }
}
