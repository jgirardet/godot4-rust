import { QuickPickItem, QuickPickOptions, window } from "vscode";
import { FullPathDir, FullPathFile } from "../types";
import { logger } from "../log";
import { Node } from "../godot/types";

export const selectTscn = async (
  tscnFiles: FullPathFile[],
  godotDir?: FullPathDir,
  options?: QuickPickOptions
): Promise<FullPathFile | undefined> => {
  let selected: string | undefined;
  // show relative path
  if (godotDir) {
    const asRelative = tscnFiles.reduce((acc, val: string, idx, _) => {
      return { [val.replace(godotDir, "").replaceAll("\\", "/")]: val, ...acc };
    }, {});
    selected = await window.showQuickPick(Object.keys(asRelative), options);
    if (!selected) {
      return;
    }
    selected = asRelative[selected as keyof {}];
  } else {
    selected = await window.showQuickPick(tscnFiles, options);
  }
  if (selected === undefined) {
    logger.info("No TSCN file selected, aborting");
    return;
  }

  logger.info(`${selected} selected`);
  return selected;
};

export const selectNode = async (
  nodes: Node[],
  options?: QuickPickOptions
): Promise<Node | undefined> => {
  const picks = nodes.slice(1).map((n) => new NodeQuickPickItem(n));
  const selected = await window.showQuickPick(picks, {
    title: `Nodes of ${nodes[0].name.value}`,
    ...options,
  });
  if (selected === undefined) {
    logger.info("No node selected, aborting");
    return;
  }
  logger.info(`${selected.label} selected`);
  return selected.node;
};

export const selectNodes = async (
  nodes: Node[],
  options?: QuickPickOptions
): Promise<Node[] | undefined> => {
  const picks = nodes.slice(1).map((n) => new NodeQuickPickItem(n));
  const selected = (await window.showQuickPick(picks, {
    title: `Nodes of ${nodes[0].name}`,
    canPickMany: true,
    ...options,
  })) as NodeQuickPickItem[] | undefined;
  if (selected === undefined) {
    logger.info("No node selected, aborting");
    return;
  }
  logger.info(`many selected`);
  return selected.map((x) => x.node);
};

class NodeQuickPickItem implements QuickPickItem {
  label: string;
  node: Node;
  constructor(node: Node) {
    this.node = node;
    let nb_sub = node.parent?.value.split("/").length || 0;
    this.label = `${"-".repeat(nb_sub * 4)}> ${
      (node.parent?.value === "." ? "" : node.parent?.value + "/") +
      node.name.value
    }  (${node.type?.value})`;
  }
}
