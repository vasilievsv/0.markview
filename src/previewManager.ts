import * as vscode from 'vscode';
import { MarkdownRenderer } from './markdownRenderer';
import { VIEW_TYPE } from './types';
import * as logger from './logger';

export class PreviewManager implements vscode.Disposable {
  private readonly panels = new Map<string, vscode.WebviewPanel>();
  private readonly renderer = new MarkdownRenderer();
  private readonly disposables: vscode.Disposable[] = [];
  private updateTimeout: ReturnType<typeof setTimeout> | undefined;

  constructor(private readonly extensionUri: vscode.Uri) {
    this.disposables.push(
      vscode.workspace.onDidChangeTextDocument(e => {
        if (e.document.languageId === 'markdown') {
          this.scheduleUpdate(e.document);
        }
      }),
      vscode.workspace.onDidCloseTextDocument(doc => {
        this.closePreview(doc.uri);
      })
    );
  }

  openPreview(document: vscode.TextDocument, viewColumn?: vscode.ViewColumn): void {
    const key = document.uri.toString();
    const existing = this.panels.get(key);
    if (existing) {
      existing.reveal(viewColumn);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      VIEW_TYPE,
      `Preview: ${this.getTitle(document)}`,
      viewColumn ?? vscode.ViewColumn.Active,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(this.extensionUri, 'dist'),
          vscode.Uri.joinPath(this.extensionUri, 'media')
        ]
      }
    );

    panel.onDidDispose(() => {
      this.panels.delete(key);
      logger.debug(`Preview disposed: ${key}`);
    }, null, this.disposables);

    this.panels.set(key, panel);
    this.renderToPanel(panel, document);
    logger.info(`Preview opened: ${this.getTitle(document)}`);
  }

  closePreview(uri: vscode.Uri): void {
    const key = uri.toString();
    const panel = this.panels.get(key);
    if (panel) {
      panel.dispose();
    }
  }

  dispose(): void {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
    for (const panel of this.panels.values()) {
      panel.dispose();
    }
    this.panels.clear();
    for (const d of this.disposables) {
      d.dispose();
    }
  }

  private scheduleUpdate(document: vscode.TextDocument): void {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
    this.updateTimeout = setTimeout(() => {
      const key = document.uri.toString();
      const panel = this.panels.get(key);
      if (panel && panel.visible) {
        const body = this.renderer.render(document.getText());
        panel.webview.postMessage({ command: 'update', body });
      }
    }, 300);
  }

  private renderToPanel(panel: vscode.WebviewPanel, document: vscode.TextDocument): void {
    const body = this.renderer.render(document.getText());
    panel.webview.html = this.renderer.getHtmlTemplate(
      panel.webview, this.extensionUri, body
    );
  }

  private getTitle(document: vscode.TextDocument): string {
    const segments = document.uri.path.split('/');
    return segments[segments.length - 1] || 'Markdown Preview';
  }
}