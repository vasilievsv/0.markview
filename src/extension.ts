import * as vscode from 'vscode';
import { Commands, VIEW_TYPE } from './types';
import { PreviewManager } from './previewManager';
import { MarkdownEditorProvider } from './customMarkdownEditor';
import { ConfigManager } from './configManager';
import * as logger from './logger';

function isMarkdownFile(document?: vscode.TextDocument): document is vscode.TextDocument {
  return !!document && document.languageId === 'markdown';
}

export function activate(context: vscode.ExtensionContext) {
  logger.info('0.markview activating');

  const previewManager = new PreviewManager(context.extensionUri);
  const configManager = new ConfigManager();

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

  const editSource = vscode.commands.registerCommand(Commands.EDIT_SOURCE, () => {
    const activeTab = vscode.window.tabGroups.activeTabGroup.activeTab;
    if (activeTab?.input instanceof vscode.TabInputCustom
        && activeTab.input.viewType === VIEW_TYPE) {
      vscode.window.showTextDocument(activeTab.input.uri, {
        viewColumn: vscode.ViewColumn.Beside,
        preview: false
      });
    }
  });

  context.subscriptions.push(
    previewManager,
    configManager,
    openPreview,
    openPreviewToSide,
    editSource,
    stub(Commands.TOGGLE_AUTO_PREVIEW),
    stub(Commands.EXPORT_PDF),
    stub(Commands.TOGGLE_TOC),
    vscode.window.registerCustomEditorProvider(
      VIEW_TYPE,
      new MarkdownEditorProvider(context),
      {
        webviewOptions: { retainContextWhenHidden: true },
        supportsMultipleEditorsPerDocument: true
      }
    )
  );

  logger.info('0.markview activated');
}

export function deactivate() {
  logger.dispose();
}