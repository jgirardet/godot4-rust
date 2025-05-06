// import { assert } from "chai";
import assert from "assert";
import * as vscode from "vscode";

suite("first", () => {
  test("sample", () => {
    assert.equal(vscode.version, "1.99.3");
  });
});
