import { QuickPickItem, QuickPickOptions, window } from "vscode";
import { FullPathDir, FullPathFile } from "../types";
import { logger } from "../log";
import { NodeItem } from "../panel/nodeItem";

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
  node: NodeItem,
  options?: QuickPickOptions
): Promise<NodeItem | undefined> => {
  const picks = node.flatChildren.map((n) => new NodeQuickPickItem(n));
  const selected = await window.showQuickPick(picks, {
    title: `Nodes of ${node.label}`,
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
  node: NodeItem,
  options?: QuickPickOptions
): Promise<NodeItem[] | undefined> => {
  const picks = node.flatChildren.map((n) => new NodeQuickPickItem(n));
  const selected = (await window.showQuickPick(picks, {
    title: `Nodes of ${node.name}`,
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
  node: NodeItem;
  constructor(node: NodeItem) {
    this.node = node;
    let nb_sub = node.path.split("/").length || 0;
    this.label = `${"-".repeat(nb_sub * 4)}> ${
      (node.path === "." ? "" : node.parent?.name + "/") + node.name
    }  (${node.description})`;
  }
}
