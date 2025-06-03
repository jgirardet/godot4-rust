import { ExtensionContext, workspace } from "vscode";

export async function setRACheckToBuild(context: ExtensionContext) {
  let config = workspace.getConfiguration(raCheckSettings);
  await config.update(overrideCommandKey, overrideCommandContent);
}
export const raSettings = "rust-analyzer";
export const raCheckSettings = raSettings + ".check";
export const overrideCommandKey = "overrideCommand";
export const raCheckCommand = [raCheckSettings, overrideCommandKey].join(".");

export const overrideCommandContent = [
  "cargo",
  "build",
  "--quiet",
  "--workspace",
  "--message-format=json",
  "--all-targets",
  "--keep-going",
];
