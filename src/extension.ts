import * as vscode from 'vscode';
import { Commands, VIEW_TYPE } from './types';
import { PreviewManager } from './previewManager';
import * as logger from './logger';

class StubEditorProvider implements vscode.CustomTextEditorProvider {
  constructor(private readonly context: vscode.ExtensionContext) {}

  async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    webviewPanel.webview.html = `<!DOCTYPE html><html><body><p>0.markview stub — ${document.fileName}</p></body></html>`;
  }
}

function isMarkdownFile(document?: vscode.TextDocument): document is vscode.TextDocument {
  return !!document && document.languageId === 'markdown';
}

export function activate(context: vscode.ExtensionContext) {
  logger.info('0.markview activating');

  const previewManager = new PreviewManager(context.extensionUri);

  const openPreview = vscode.commands.registerCommand(Commands.OPEN_PREVIEW, () => {
    const editor = vscode.window.activeTextEditor;
    if (isMarkdownFile(editor?.document)) {
      previewManager.openPreview(editor.document, vscode.ViewColumn.Active);
    }
  });

  const openPreviewToSide = vscode.commands.registerCommand(Commands.OPEN_PREVIEW_TO_SIDE, () => {
    const editor = vscode.window.activeTextEditor;
    if (isMarkdownFile(editor?.document)) {
      previewManager.openPreview(editor.document, vscode.ViewColumn.Beside);
    }
  });

  const stub = (name: string) =>
    vscode.commands.registerCommand(name, () =>
      vscode.window.showInformationMessage(`${name} — not implemented yet`)
    );

  context.subscriptions.push(
    previewManager,
    openPreview,
    openPreviewToSide,
    stub(Commands.TOGGLE_AUTO_PREVIEW),
    stub(Commands.EDIT_SOURCE),
    stub(Commands.EXPORT_PDF),
    stub(Commands.TOGGLE_TOC),
    vscode.window.registerCustomEditorProvider(
      VIEW_TYPE,
      new StubEditorProvider(context),
      { webviewOptions: { retainContextWhenHidden: false } }
    )
  );

  logger.info('0.markview activated');
}

export function deactivate() {
  logger.dispose();
}