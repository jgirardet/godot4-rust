import { open, writeFile } from "fs/promises";
import { NodeItem } from "../panel/nodeItem";
import { FullPathDir } from "../types";
import { window } from "vscode";
import { logger } from "../log";

export const switchGodotNodeByrust = async (
  nodeItem: NodeItem,
  godotDir: FullPathDir
) => {
  let attr = nodeItem.node.type!; // always ok with root
  const tscn = nodeItem.tscn!.toAbs(godotDir);
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
