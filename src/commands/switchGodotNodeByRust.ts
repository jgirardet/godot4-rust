import { writeFile } from "fs/promises";
import { NodeItem } from "../panel/nodeItem";
import { window } from "vscode";
import { logger } from "../log";
import { selectTscn } from "../ui/select";
import { GodotManager } from "../panel/godotManager";
import { readUtf8 } from "../utils";

export const switchGodotNodeByrust = async (
  { rust, treeData, godotDir }: GodotManager,
  nodeItem?: NodeItem
) => {
  logger.info("Starting Change type");
  if (!nodeItem) {
    const tscn = await selectTscn(Array.from(treeData.data.keys()), godotDir, {
      canPickMany: false,
      title: "Please select Scene file where to change Root Node's Type",
    });
    if (!tscn) {
      logger.info("Aborting");
      return;
    }
    nodeItem = treeData.data.get(tscn);
    if (!nodeItem) {
      return;
    }
  }

  if (!nodeItem?.isRoot) {
    // should not happen since limited by when context
    logger.warn("Only root Nodes can be switched in Scenes");
    return;
  }
  await rust.reload();

  let gc = await rust.tryStoredGodoClassInEditor();
  if (gc) {
    nodeItem.rustModule = gc;
  } else {
    throw new Error(
      "Need valid peristed godotclass module. Can't modify Tscn file"
    );
  }

  const tscn = nodeItem.tscn!.toAbs(godotDir);
  const content = await readUtf8(tscn);
  const newContent = content.replace(
    `[node name="${nodeItem.name}" type="${nodeItem.type}"`,
    `[node name="${nodeItem.name}" type="${nodeItem.rustModule!.className}"`
  );
  await writeFile(tscn, newContent, { encoding: "utf-8" });
  logger.info("Godot Scene File has been updated");
  window.showInformationMessage("Godot Scene File has been updated");
};
