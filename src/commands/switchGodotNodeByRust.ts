import { open, writeFile } from "fs/promises";
import { NodeItem } from "../panel/nodeItem";
import { window } from "vscode";
import { logger } from "../log";
import { selectTscn } from "../ui/select";
import { GodotManager } from "../panel/godotManager";

export const switchGodotNodeByrust = async (
  manager: GodotManager,
  nodeItem?: NodeItem
) => {
  logger.info("Starting Change type");
  if (!nodeItem) {
    const tscn = await selectTscn(
      Array.from(manager.treeData.data.keys()),
      manager.godotDir,
      {
        canPickMany: false,
        title: "Please select Scene file where to change Root Node's Type",
      }
    );
    if (!tscn) {
      logger.info("Aborting");
      return;
    }
    nodeItem = manager.treeData.data.get(tscn);
    if (!nodeItem) {
      return;
    }
  }

  if (!nodeItem?.isRoot) {
    // should not happen since limited by when context
    logger.warn("Only root Nodes can be switched in Scenes");
    return;
  }
  await manager.rust.reload();

  let gc = await manager.rust.TryGodoClassInEditor();
  if (gc) {
    nodeItem.rustModule = gc;
  } else {
    throw new Error(
      "Need valid peristed godotclass module. Can't modify Tscn file"
    );
  }

  let attr = nodeItem.node.type!; // always ok with root
  const tscn = nodeItem.tscn!.toAbs(manager.godotDir);
  let res = [];
  let counter = 0;

  for await (let line of (await open(tscn)).readLines()) {
    if (counter === attr.startPosition.row) {
      let start = line.slice(0, attr.startPosition.column);
      let end = line.slice(attr.endPosition.column);
      let slice = line.slice(
        attr.startPosition.column,
        attr.endPosition.column
      );
      // double check, abort if not sure
      if (slice === `"${nodeItem.type}"`) {
        console.log("meme type");
        line = start + `"${nodeItem.rustModule!.className}"` + end; //mieux cracher que faire faux
      } else {
        throw new Error(
          "There was a error, Godot Scene file has't been edited"
        );
      }
    }
    counter += 1;
    res.push(line);
  }
  await writeFile(tscn, res.join("\n") + "\n", { encoding: "utf-8" });
  logger.info("Godot Scene File has been updated");
  window.showInformationMessage("Godot Scene File has been updated");
};
