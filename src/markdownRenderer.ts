import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import * as vscode from 'vscode';
import { getNonce } from './types';

export class MarkdownRenderer {
  private readonly md: MarkdownIt;

  constructor() {
    this.md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      highlight: (str, lang) => {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`;
          } catch { /* fallback */ }
        }
        return `<pre class="hljs"><code>${this.md.utils.escapeHtml(str)}</code></pre>`;
      }
    });
    this.addSourceLineAttributes();
  }

  render(markdown: string): string {
    return this.md.render(markdown);
  }

  getHtmlTemplate(
    webview: vscode.Webview,
    extensionUri: vscode.Uri,
    body: string
  ): string {
    const nonce = getNonce();
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, 'dist', 'webview', 'preview.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, 'media', 'preview.css')
    );
    const csp = [
      `default-src 'none'`,
      `style-src ${webview.cspSource} 'unsafe-inline'`,
      `script-src 'nonce-${nonce}'`,
      `img-src ${webview.cspSource} data: https:`,
      `font-src ${webview.cspSource}`
    ].join('; ');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="${styleUri}">
  <title>Markdown Preview</title>
</head>
<body>
  <div id="preview">${body}</div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }

  private addSourceLineAttributes(): void {
    const defaultRender = this.md.renderer.rules.paragraph_open ||
      ((tokens: any, idx: any, options: any, _env: any, self: any) => self.renderToken(tokens, idx, options));

    this.md.renderer.rules.paragraph_open = (tokens, idx, options, env, self) => {
      const token = tokens[idx];
      if (token.map && token.map[0] !== undefined) {
        token.attrSet('data-source-line', String(token.map[0]));
      }
      return defaultRender(tokens, idx, options, env, self);
    };

    const defaultHeadingOpen = this.md.renderer.rules.heading_open ||
      ((tokens: any, idx: any, options: any, _env: any, self: any) => self.renderToken(tokens, idx, options));

    this.md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
      const token = tokens[idx];
      if (token.map && token.map[0] !== undefined) {
        token.attrSet('data-source-line', String(token.map[0]));
      }
      return defaultHeadingOpen(tokens, idx, options, env, self);
    };
  }
}