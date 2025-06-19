import { readUtf8, readUtf8Sync } from "../utils";
import { ExtResource, GDScene, Node, ResEntry, SubResource } from "./types";
import { FullPathFile } from "../types";

const ENTRY_REGEX =
  /(name|type|parent|instance|instance_place_holder|owner|index|groups|uid|id|path)=(?:"([^"]+)"|ExtResource\("([^"]+)"\))/g;

export async function parseResFile(path: FullPathFile): Promise<GDScene> {
  let content = await readUtf8(path);
  let scene;
  try {
    scene = _parseResFile(content);
  } catch (e: any) {
    return Promise.reject(`Error parsing file : ${path}\n${e}`);
  }
  return scene;
}

export function parseResFileSync(path: FullPathFile): GDScene {
  let content = readUtf8Sync(path);
  let scene;
  try {
    scene = _parseResFile(content);
  } catch (e: any) {
    throw new Error(`Error parsing file : ${path}\n${e}`);
  }
  return scene;
}

function _parseResFile(content: string): GDScene {
  let entries = tree(content);
  let scene;
  scene = validateAndDispatch(entries);
  return scene;
}


function tree(content: string): ResEntry[] {
  let lines = content.matchAll(/^\[(\w+) (.*)\]$/gm);
  let res = [];
  for (const l of lines) {
    let scheme = l[2];
    let args = [...scheme.matchAll(ENTRY_REGEX)];

    var obje = args.reduce(
      (obj, item) => (
        (obj[item[1] as keyof ResEntry] = item[2] || item[3]), obj
      ),
      {} as ResEntry
    );
    obje["kind"] = l[1];
    res.push(obje);
  }
  return res;
}

function validateAndDispatch(entries: ResEntry[]): GDScene {
  let gdscene = entries.at(0);
  if (!gdscene) {
    throw new Error("no gdscene found in resource file");
  }
  if (!("uid" in gdscene)) {
    throw new Error("Resource scene has no UID");
  }

  const extResources: ExtResource[] = [];
  const subResources: SubResource[] = [];
  const nodes: Node[] = [];
  for (const c of entries.slice(1)) {
    if (c.kind === "node") {
      nodes.push(c as Node);
    } else if (c.kind === "ext_resource") {
      extResources.push(c as ExtResource);
    } else if (c.kind === "sub_resource") {
      subResources.push(c as SubResource);
    }
  }

  if (nodes.length === 0) {
    throw new Error("There is no valid node in resource file");
  }
  if ("parent" in nodes[0]) {
    throw new Error("No valid root node in resource file");
  }

  for (const r of extResources) {
    if (r.type !== "PackedScene") {
      continue;
    }
    if (!("type" in r && "uid" in r && "path" in r && "id" in r)) {
      throw new Error(
        `Some field is mission from ext resource declaration: ${JSON.stringify(
          r
        )}`
      );
    }
  }

  if (!subResources.every((r) => "type" in r && "id" in r)) {
    throw new Error("Some fied is missing from sub resources declaration");
  }

  for (const n of nodes) {
    if (n.instance) {
      let resource = extResources.filter((r) => r.id === n.instance).at(0);
      if (resource) {
        n.resource = resource;
      } else {
        throw new Error(
          `No external resource with id "${n.instance}" found for node "${n.name}"`
        );
      }
    }
  }
  return {
    uid: gdscene.uid!,
    rootNode: nodes[0],
    extResources: extResources,
    subResources: subResources,
    nodes: nodes.slice(1),
  };
}
