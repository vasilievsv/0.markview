import * as vscode from 'vscode';
import { MarkdownRenderer } from './markdownRenderer';
import { PREVIEW_PANEL_TYPE } from './types';
import { debounce, isMarkdownFile } from './utils';
import * as logger from './logger';

export class PreviewManager implements vscode.Disposable {
  private readonly panels = new Map<string, vscode.WebviewPanel>();
  private readonly renderer = new MarkdownRenderer();
  private readonly disposables: vscode.Disposable[] = [];
  private readonly debouncedUpdate = debounce((doc: vscode.TextDocument) => {
    const key = doc.uri.toString();
    const panel = this.panels.get(key);
    if (panel && panel.visible) {
      const body = this.renderer.render(doc.getText());
      panel.webview.postMessage({ command: 'update', body });
      const tocHtml = this.renderer.getToc().length > 0
        ? '<ul>' + this.renderer.getToc().map(e => `<li class="toc-h${e.level}"><a href="#${e.id}">${e.text}</a></li>`).join('') + '</ul>'
        : '';
      panel.webview.postMessage({ command: 'updateToc', html: tocHtml });
    }
  }, 300);

  constructor(private readonly extensionUri: vscode.Uri) {
    this.disposables.push(
      vscode.workspace.onDidChangeTextDocument(e => {
        if (isMarkdownFile(e.document)) {
          this.debouncedUpdate(e.document);
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
      PREVIEW_PANEL_TYPE,
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
    this.debouncedUpdate.cancel();
    for (const panel of this.panels.values()) {
      panel.dispose();
    }
    this.panels.clear();
    for (const d of this.disposables) {
      d.dispose();
    }
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