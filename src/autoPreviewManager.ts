import * as vscode from 'vscode';
import { PreviewManager } from './previewManager';
import { ConfigManager } from './configManager';
import * as logger from './logger';

export class AutoPreviewManager implements vscode.Disposable {
  private readonly disposables: vscode.Disposable[] = [];
  private enabled: boolean;

  constructor(
    private readonly previewManager: PreviewManager,
    private readonly config: ConfigManager
  ) {
    this.enabled = config.autoOpen;

    this.disposables.push(
      vscode.window.tabGroups.onDidChangeTabs(e => {
        if (!this.enabled || !this.config.autoClose) { return; }
        this.autoClose(e.closed);
      }),
      config.onDidChange(() => {
        this.enabled = config.autoOpen;
      })
    );
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
