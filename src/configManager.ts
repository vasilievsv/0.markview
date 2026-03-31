import * as vscode from 'vscode';

const SECTION = 'multiPreview';

export class ConfigManager implements vscode.Disposable {
  private readonly _onDidChange = new vscode.EventEmitter<void>();
  readonly onDidChange = this._onDidChange.event;
  private readonly disposable: vscode.Disposable;

  constructor() {
    this.disposable = vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration(SECTION)) {
        this._onDidChange.fire();
      }
    });
  }

  private cfg() { return vscode.workspace.getConfiguration(SECTION); }

  get enabled(): boolean { return this.cfg().get<boolean>('enabled', true); }
  get defaultViewer(): 'preview' | 'editor' { return this.cfg().get<'preview' | 'editor'>('defaultViewer', 'preview'); }
  get autoOpen(): boolean { return this.cfg().get<boolean>('autoOpen', true); }
  get autoClose(): boolean { return this.cfg().get<boolean>('autoClose', true); }
  get openToSide(): boolean { return this.cfg().get<boolean>('openToSide', true); }
  get scrollSync(): boolean { return this.cfg().get<boolean>('scrollSync', true); }
  get tocEnabled(): boolean { return this.cfg().get<boolean>('toc.enabled', true); }
  get fontSize(): number { return this.cfg().get<number>('fontSize', 14); }
  get debounceMs(): number { return this.cfg().get<number>('debounceMs', 150); }

  dispose(): void {
    this._onDidChange.dispose();
    this.disposable.dispose();
  }
}
