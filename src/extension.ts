import * as vscode from 'vscode';
import { Commands, VIEW_TYPE } from './types';
import { PreviewManager } from './previewManager';
import { MarkdownEditorProvider } from './customMarkdownEditor';
import { ConfigManager } from './configManager';
import { AutoPreviewManager } from './autoPreviewManager';
import { isMarkdownFile } from './utils';
import * as logger from './logger';

export function activate(context: vscode.ExtensionContext) {
  logger.info('0.markview activating');

  const previewManager = new PreviewManager(context.extensionUri);
  const configManager = new ConfigManager();
  const autoPreviewManager = new AutoPreviewManager(previewManager, configManager);

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

  const toggleAutoPreview = vscode.commands.registerCommand(Commands.TOGGLE_AUTO_PREVIEW, () => {
    const state = autoPreviewManager.toggle();
    vscode.window.showInformationMessage(`Auto-preview: ${state ? 'ON' : 'OFF'}`);
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

  const editorProvider = new MarkdownEditorProvider(context);

  const exportPdf = vscode.commands.registerCommand(Commands.EXPORT_PDF, () => {
    const activeTab = vscode.window.tabGroups.activeTabGroup.activeTab;
    if (activeTab?.input instanceof vscode.TabInputCustom
        && activeTab.input.viewType === VIEW_TYPE) {
      const uri = activeTab.input.uri;
      const filename = uri.path.split('/').pop()?.replace(/\.md$|\.markdown$/, '') || 'document';
      const panel = editorProvider.getPanel(uri);
      if (panel) {
        panel.webview.postMessage({ command: 'exportPdf', filename });
      }
    }
  });

  context.subscriptions.push(
    previewManager,
    configManager,
    autoPreviewManager,
    openPreview,
    openPreviewToSide,
    toggleAutoPreview,
    editSource,
    exportPdf,
    stub(Commands.TOGGLE_TOC),
    vscode.window.registerCustomEditorProvider(
      VIEW_TYPE,
      editorProvider,
      {
        webviewOptions: { retainContextWhenHidden: true },
        supportsMultipleEditorsPerDocument: false
      }
    )
  );

  logger.info('0.markview activated');
}

export function deactivate() {
  logger.dispose();
}