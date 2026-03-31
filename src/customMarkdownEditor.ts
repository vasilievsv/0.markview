import * as vscode from 'vscode';
import { MarkdownRenderer } from './markdownRenderer';
import { VIEW_TYPE } from './types';
import * as logger from './logger';

export class MarkdownEditorProvider implements vscode.CustomTextEditorProvider {
  public static readonly viewType = VIEW_TYPE;

  private readonly renderer = new MarkdownRenderer();

  constructor(private readonly context: vscode.ExtensionContext) {}

  async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
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

    let updateTimeout: ReturnType<typeof setTimeout> | undefined;

    const changeSubscription = vscode.workspace.onDidChangeTextDocument(e => {
      if (e.document.uri.toString() !== document.uri.toString()) { return; }
      if (e.contentChanges.length === 0) { return; }
      if (updateTimeout) { clearTimeout(updateTimeout); }
      updateTimeout = setTimeout(() => {
        const body = this.renderer.render(document.getText());
        webviewPanel.webview.postMessage({ command: 'update', body });
      }, 300);
    });

    const messageSubscription = webviewPanel.webview.onDidReceiveMessage(msg => {
      if (msg.command === 'edit' && typeof msg.content === 'string') {
        const edit = new vscode.WorkspaceEdit();
        const fullRange = new vscode.Range(
          0, 0,
          document.lineCount, 0
        );
        edit.replace(document.uri, fullRange, msg.content);
        vscode.workspace.applyEdit(edit);
      }
    });

    webviewPanel.onDidDispose(() => {
      if (updateTimeout) { clearTimeout(updateTimeout); }
      changeSubscription.dispose();
      messageSubscription.dispose();
      logger.debug(`CustomEditor disposed: ${document.uri.fsPath}`);
    });

    logger.info(`CustomEditor opened: ${document.uri.fsPath}`);
  }
}
