import * as vscode from 'vscode';

export function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T & { cancel(): void } {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const debounced = ((...args: any[]) => {
    if (timer) { clearTimeout(timer); }
    timer = setTimeout(() => fn(...args), ms);
  }) as T & { cancel(): void };
  debounced.cancel = () => { if (timer) { clearTimeout(timer); timer = undefined; } };
  return debounced;
}

export function isMarkdownFile(document?: vscode.TextDocument): document is vscode.TextDocument {
  return !!document && document.languageId === 'markdown';
}

export function isFileScheme(document: vscode.TextDocument): boolean {
  return document.uri.scheme === 'file' || document.uri.scheme === 'untitled';
}
