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
import { FullPathFile } from "../types";
import { StoredGodotClass } from "./godoClass";

export type RustFiles = Map<FullPathFile, StoredGodotClass>;

export class RustManager {
  modules: RustFiles = new Map();
  readonly watcher: FileSystemWatcher;

  rustFilesChanged = new EventEmitter<RustFiles | void>();
  onRustFilesChanged: Event<RustFiles | void> = this.rustFilesChanged.event;

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
    let deleted = this.getByPath(u.fsPath);
    if (deleted) {
      return this.update(deleted, true);
    }
  }

  async update(gm: StoredGodotClass, remove = false) {
    if (remove) {
      this.modules.delete(gm.className);
      this.rustFilesChanged.fire();
    } else {
      // creation ou modification
      const stored = this.modules.get(gm.className);
      if (!stored) {
        let byTscn = this.getByPath(gm.file);
        if (byTscn) {
          //a rename cas: different name but same file
          this.modules.delete(byTscn.className);
          this.modules.set(gm.className, gm);
          this.rustFilesChanged.fire();
        } else {
          // nouvel class + nouveau fichier
          this.modules.set(gm.className, gm);
          this.rustFilesChanged.fire();
        }
      } else {
        if (gm !== stored) {
          // même class mais changement du reste, on update simple
          this.modules.set(gm.className, gm);
          this.rustFilesChanged.fire();
        }
      }
    }
  }

  isRustStruct(godotType: string): boolean {
    return godotType in this.modules;
  }

  getByPath(filepath: FullPathFile): StoredGodotClass | undefined {
    return [...this.modules.values()].find((p) => p.file === filepath);
  }

  // only match on persisted files.
  async tryStoredGodoClassInEditor(): Promise<StoredGodotClass | undefined> {
    if (!window.activeTextEditor) {
      return;
    }
    const { document } = window.activeTextEditor;
    if (document.isUntitled || !document.fileName.endsWith(".rs")) {
      return;
    }
    if (document.isDirty) {
      await document.save();
    }

    return await this.tryGodotClass(document.uri);
  }

  async tryGodotClass(f: Uri): Promise<StoredGodotClass | undefined> {
    return StoredGodotClass.fromFile(f.fsPath);
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
