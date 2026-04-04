import * as vscode from 'vscode';
import { PreviewManager } from './previewManager';
import { ConfigManager } from './configManager';
import { Interceptor } from './interceptor';
import { isDocumentInDiffView } from './diffDetector';
import { isMarkdownFile } from './utils';
import * as logger from './logger';

export class AutoPreviewManager implements vscode.Disposable {
  private readonly disposables: vscode.Disposable[] = [];
  private enabled: boolean;
  private lastOpenedUri: string | undefined;
  private interceptor: Interceptor | undefined;

  constructor(
    private readonly previewManager: PreviewManager,
    private readonly config: ConfigManager
  ) {
    this.enabled = config.autoOpen;

    this.disposables.push(
      vscode.window.onDidChangeActiveTextEditor(editor => {
        if (!this.enabled) { return; }
        if (!editor || !isMarkdownFile(editor.document)) { return; }
        const uri = editor.document.uri;
        if (uri.scheme !== 'file' && uri.scheme !== 'untitled') { return; }
        if (isDocumentInDiffView(uri)) { return; }
        if (this.interceptor?.wasJustIntercepted(uri)) { return; }
        const key = uri.toString();
        if (key === this.lastOpenedUri) { return; }
        this.lastOpenedUri = key;
        const col = this.config.openToSide ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active;
        this.previewManager.openPreview(editor.document, col);
        logger.debug(`Auto-opened preview: ${uri.fsPath}`);
      }),
      vscode.window.tabGroups.onDidChangeTabs(e => {
        if (!this.enabled || !this.config.autoClose) { return; }
        this.autoClose(e.closed);
      }),
      vscode.workspace.onDidCloseTextDocument(doc => {
        if (this.lastOpenedUri && doc.uri.toString() === this.lastOpenedUri) {
          this.lastOpenedUri = undefined;
        }
      }),
      config.onDidChange(() => {
        this.enabled = config.autoOpen;
      })
    );
  }

  setInterceptor(interceptor: Interceptor): void {
    this.interceptor = interceptor;
  }

  toggle(): boolean {
    this.enabled = !this.enabled;
    logger.info(`Auto-preview: ${this.enabled ? 'ON' : 'OFF'}`);
    return this.enabled;
  }

  dispose(): void {
    for (const d of this.disposables) { d.dispose(); }
  }

  private autoClose(closedTabs: readonly vscode.Tab[]): void {
    for (const tab of closedTabs) {
      if (!(tab.input instanceof vscode.TabInputText)) { continue; }
      const uri = tab.input.uri;
      if (uri.path.endsWith('.md') || uri.path.endsWith('.markdown')) {
        this.previewManager.closePreview(uri);
        logger.debug(`Auto-closed preview: ${uri.fsPath}`);
      }
    }
  }
}
