import { regex } from "regex";
import { readUtf8Sync } from "./utils";

function main() {
  //   let reg = regex("gm")`(?<key>\w+)([^"]+)`;
  //   let reg = /(?<key>\w+)="(?<value>[^"]+)"/gm;
  // | node name=(?<name> \g<string>)\stype=(?<type> \g<string>)\sparent=(?<parent> \g<string>)
  let reg = regex("gm")`
  ((?<kindNode>node)\sname=(?<nameNode> \g<string>)\stype=(?<typeNode> \g<string>)\sparent=(?<parentNode> \g<string>))
  | ((?<kindRoot>node)\sname=(?<nameRoot> \g<string>)\stype=(?<typeRoot> \g<string>))
  | ((?<kindExt>ext_resource)\stype="(?<typeExt> [^"]+)\sparent=(?<uidExt> \g<string>))
    
    

  (?(DEFINE)
  (?<string> "[^"]+")
  )
  `;
  //(?<string> "\w+")

  let regString = /(\w+)/g;

  let content = readUtf8Sync("assets/GodotProject/Scenes/Main/main.tscn");
  let content2 =
    '[ext_resource type="LabelSettings" uid="uid://b0kponm3gbkqq" path="res://Resources/MainTitleFont.tres" id="2_qw60k"]';
  // (?<node name=(?<name> \g<string>)\stype=(?<type> \g<string>)\sparent=(?<parent> \g<string>))

  let res = content2.matchAll(regString);

  console.dir(res);
  for (const a of res) {
    // console.log(a);
    // console.log(a.groups);
  }
}

const reg =
  /(?<key>name|type|parent|instance|instance_place_holder|owner|index|groups|uid|id|path)="(?<value>[^"]+)"/g;

function tree() {
  let content = readUtf8Sync(
    "C:\\Users\\jim\\Rien\\godot-4-3d-third-person-controller\\Playground.tscn"
    // "C:\\Users\\jim\\Rien\\godot-4-3d-third-person-controller\\Player\\Player.tscn"
  );
  //   let content = readUtf8Sync("assets/GodotProject/Scenes/Main/main.tscn");
  let lines = content.matchAll(/^\[(\w+) (.*)\]$/gm);
  for (const l of lines) {
    // console.log(l);
    console.log(`kind: ${l[1]}`);
    let scheme = l[2];
    let args = [...scheme.matchAll(reg)];

    var obje = args.reduce(
      (obj, item) => ((obj[item[1] as keyof Res] = item[2]), obj),
      {} as Res
    );
    console.log(obje);
    console.log("\n");
  }
}
console.time();
tree();
console.timeEnd();
// main();

interface Res {
  type?: string;
  name?: string;
  path?: string;
  instance?: string;
  uid?: string;
  instance_placeholder?: string;
  index?: string;
  groups?: string;
}

class Bla {
  // readonly data: Res;

  constructor(readonly kind: string, readonly data: Res) {}
}
