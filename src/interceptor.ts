import * as vscode from 'vscode';
import { VIEW_TYPE } from './types';
import { isDocumentInDiffView } from './diffDetector';
import { ConfigManager } from './configManager';

export class Interceptor implements vscode.Disposable {
  private readonly _intercepting = new Set<string>();
  private readonly _justIntercepted = new Set<string>();
  private readonly _userSwitchedToText = new Set<string>();
  private readonly _disposables: vscode.Disposable[] = [];
  private readonly _pendingTimers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(private readonly configManager: ConfigManager) {
    this._disposables.push(
      vscode.workspace.onDidOpenTextDocument(doc => {
        if (doc.languageId !== 'markdown') { return; }
        if (doc.uri.scheme !== 'file' && doc.uri.scheme !== 'untitled') { return; }
        if (isDocumentInDiffView(doc.uri)) { return; }
        this._scheduleCheck(doc.uri);
      }),
      vscode.window.tabGroups.onDidChangeTabs(e => {
        const closedCustomUris = new Set<string>();
        for (const tab of e.closed) {
          if (tab.input instanceof vscode.TabInputCustom
              && tab.input.viewType === VIEW_TYPE
              && /\.md$|\.markdown$/i.test(tab.input.uri.fsPath)) {
            closedCustomUris.add(tab.input.uri.toString());
          }
        }
        for (const tab of e.opened) {
          if (tab.input instanceof vscode.TabInputText) {
            const uri = tab.input.uri;
            if (/\.md$|\.markdown$/i.test(uri.fsPath)) {
              if (uri.scheme !== 'file' && uri.scheme !== 'untitled') { continue; }
              if (isDocumentInDiffView(uri)) { continue; }
              if (closedCustomUris.has(uri.toString())) {
                const key = uri.toString();
                this._userSwitchedToText.add(key);
                setTimeout(() => this._userSwitchedToText.delete(key), 1500);
                continue;
              }
              this._scheduleCheck(uri);
            }
          }
        }
      })
    );

    this._processExistingTabs();
  }

  wasJustIntercepted(uri: vscode.Uri): boolean {
    return this._justIntercepted.has(uri.toString());
  }

  private _scheduleCheck(uri: vscode.Uri): void {
    const key = uri.toString();
    const existing = this._pendingTimers.get(key);
    if (existing) { clearTimeout(existing); }
    this._pendingTimers.set(key, setTimeout(() => {
      this._pendingTimers.delete(key);
      this._checkAndIntercept(uri);
    }, 100));
  }

  private _checkAndIntercept(uri: vscode.Uri): void {
    const key = uri.toString();
    if (this._intercepting.has(key)) { return; }
    if (this._userSwitchedToText.has(key)) { return; }

    let hasTextTab = false;
    let hasCustomTab = false;
    let textTab: vscode.Tab | undefined;
    for (const group of vscode.window.tabGroups.all) {
      for (const tab of group.tabs) {
        if (tab.input instanceof vscode.TabInputText && tab.input.uri.toString() === key) {
          hasTextTab = true;
          textTab = tab;
        }
        if (tab.input instanceof vscode.TabInputCustom
            && tab.input.viewType === VIEW_TYPE
            && tab.input.uri.toString() === key) {
          hasCustomTab = true;
        }
      }
    }

    if (!hasTextTab || hasCustomTab) { return; }

    this._intercepting.add(key);
    this._justIntercepted.add(key);

    const doIntercept = async () => {
      if (textTab) {
        try {
          await vscode.window.tabGroups.close(textTab);
        } catch { /* tab already closed */ }
      }
      await vscode.commands.executeCommand('vscode.openWith', uri, VIEW_TYPE);
      this._intercepting.delete(key);
      setTimeout(() => this._justIntercepted.delete(key), 600);
    };

    setTimeout(() => doIntercept(), 150);
  }

  private _processExistingTabs(): void {
    setTimeout(() => {
      for (const group of vscode.window.tabGroups.all) {
        for (const tab of group.tabs) {
          if (tab.input instanceof vscode.TabInputText) {
            const uri = tab.input.uri;
            if (/\.md$|\.markdown$/i.test(uri.fsPath)
                && (uri.scheme === 'file' || uri.scheme === 'untitled')
                && !isDocumentInDiffView(uri)) {
              this._scheduleCheck(uri);
            }
          }
        }
      }
    }, 200);
  }

  dispose(): void {
    for (const timer of this._pendingTimers.values()) { clearTimeout(timer); }
    this._pendingTimers.clear();
    this._disposables.forEach(d => d.dispose());
  }
}
