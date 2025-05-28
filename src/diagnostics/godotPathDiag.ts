import { Diagnostic, DiagnosticSeverity } from "vscode";
import { NodeItem } from "../panel/nodeItem";
import { rangeToVsRange } from "../vscodeUtils";
import { StringLiteral } from "../rust/nodable";
import { closest } from "fastest-levenshtein";
import { GodotClass } from "../rust/godoClass";

export function checkForInvalidNodePath(
  nodeItem: NodeItem,
  liveGodotClass?: GodotClass
): Diagnostic[] {
  let diags: Diagnostic[] = [];
  if (!nodeItem.rustModule || !liveGodotClass) {
    return [];
  }
  const { flatChildren } = nodeItem;

  for (const field of (liveGodotClass || nodeItem.rustModule).fields) {
    const initAttr = field.attribute("init");
    if (!initAttr || initAttr.length === 0) {
      continue;
    }
    let initNodeValueItem = initAttr?.getArg("node")?.argValueItem;
    if (!(initNodeValueItem instanceof StringLiteral)) {
      diags.push(
        new Diagnostic(
          rangeToVsRange(initAttr.range),
          "node must be a string litteral like 'rootNode/childA/childB'",
          DiagnosticSeverity.Error
        )
      );
    } else if (
      !flatChildren.find((c) => c.fullPath === initNodeValueItem.value)
    ) {
      diags.push(
        new Diagnostic(
          rangeToVsRange(initNodeValueItem.range),
          `Node "${initNodeValueItem.value}" doesn't exists in "${
            nodeItem.tscn?.toRes
          }".
Did you mean "${closest(
            initNodeValueItem.value,
            flatChildren.map((x) => x.fullPath)
          )}"`,
          DiagnosticSeverity.Error
        )
      );
    }
  }

  return diags;
}
