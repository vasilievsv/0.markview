import * as vscode from 'vscode';

export const EXTENSION_ID = 'markview';
export const VIEW_TYPE = 'markview.markdownPreview';

export const Commands = {
  OPEN_PREVIEW: 'markview.openPreview',
  OPEN_PREVIEW_TO_SIDE: 'markview.openPreviewToSide',
  TOGGLE_AUTO_PREVIEW: 'markview.toggleAutoPreview',
  EDIT_SOURCE: 'markview.editSource',
  EXPORT_PDF: 'markview.exportPdf',
  TOGGLE_TOC: 'markview.toggleToc',
} as const;

export interface WebviewMessage {
  command: string;
  [key: string]: unknown;
}

export interface PreviewState {
  scrollPosition: number;
  uri: string;
}

export function getNonce(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let nonce = '';
  for (let i = 0; i < 32; i++) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return nonce;
}
