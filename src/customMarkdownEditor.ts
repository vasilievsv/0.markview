import * as vscode from 'vscode';
import { MarkdownRenderer } from './markdownRenderer';
import { VIEW_TYPE } from './types';
import { debounce } from './utils';
import * as logger from './logger';

export class MarkdownEditorProvider implements vscode.CustomTextEditorProvider {
  public static readonly viewType = VIEW_TYPE;
  private readonly renderer = new MarkdownRenderer();
  private readonly panels = new Map<string, vscode.WebviewPanel>();

  constructor(private readonly context: vscode.ExtensionContext) {}

  getPanel(uri: vscode.Uri): vscode.WebviewPanel | undefined {
    return this.panels.get(uri.toString());
  }

  async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    const key = document.uri.toString();
    this.panels.set(key, webviewPanel);

    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.context.extensionUri, 'dist'),
        vscode.Uri.joinPath(this.context.extensionUri, 'media')
      ]
    };

    const updateWebview = () => {
      const body = this.renderer.render(document.getText());
      webviewPanel.webview.html = this.renderer.getHtmlTemplate(
        webviewPanel.webview, this.context.extensionUri, body
      );
    };

    updateWebview();

    const debouncedUpdate = debounce((doc: vscode.TextDocument) => {
      const body = this.renderer.render(doc.getText());
      webviewPanel.webview.postMessage({ command: 'update', body });
      const toc = this.renderer.getToc();
      const tocHtml = toc.length > 0
        ? '<ul>' + toc.map(e => `<li class="toc-h${e.level}"><a href="#${e.id}">${e.text}</a></li>`).join('') + '</ul>'
        : '';
      webviewPanel.webview.postMessage({ command: 'updateToc', html: tocHtml });
    }, 300);

    const changeSubscription = vscode.workspace.onDidChangeTextDocument(e => {
      if (e.document.uri.toString() !== document.uri.toString()) { return; }
      if (e.contentChanges.length === 0) { return; }
      debouncedUpdate(e.document);
    });

    const messageSubscription = webviewPanel.webview.onDidReceiveMessage(msg => {
      if (msg.command === 'edit' && typeof msg.content === 'string') {
        const edit = new vscode.WorkspaceEdit();
        const fullRange = new vscode.Range(0, 0, document.lineCount, 0);
        edit.replace(document.uri, fullRange, msg.content);
        vscode.workspace.applyEdit(edit);
      }
      if (msg.command === 'pdfExported') {
        if (msg.success) {
          vscode.window.showInformationMessage('PDF exported');
        } else {
          vscode.window.showErrorMessage(`PDF export failed: ${msg.error}`);
        }
      }
    });

    webviewPanel.onDidDispose(() => {
      this.panels.delete(key);
      debouncedUpdate.cancel();
      changeSubscription.dispose();
      messageSubscription.dispose();
      logger.debug(`CustomEditor disposed: ${document.uri.fsPath}`);
    });

    logger.info(`CustomEditor opened: ${document.uri.fsPath}`);
  }
}
