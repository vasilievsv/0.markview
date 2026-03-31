import * as vscode from 'vscode';

export function isDiffEditor(tab: vscode.Tab): boolean {
  return tab.input instanceof vscode.TabInputTextDiff;
}

export function isDocumentInDiffView(uri: vscode.Uri): boolean {
  const uriStr = uri.toString();
  for (const group of vscode.window.tabGroups.all) {
    for (const tab of group.tabs) {
      if (!(tab.input instanceof vscode.TabInputTextDiff)) { continue; }
      if (tab.input.original.toString() === uriStr || tab.input.modified.toString() === uriStr) {
        return true;
      }
    }
  }
  return false;
}
