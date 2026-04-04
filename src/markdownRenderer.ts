import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import * as vscode from 'vscode';
import { getNonce } from './types';

export interface TocEntry {
  level: number;
  text: string;
  id: string;
}

export class MarkdownRenderer {
  private readonly md: MarkdownIt;
  private lastToc: TocEntry[] = [];

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
    this.addHeadingIds();
    this.addMermaidFence();
  }

  render(markdown: string): string {
    this.lastToc = [];
    const content = this.stripFrontmatter(markdown);
    return this.md.render(content);
  }

  private stripFrontmatter(text: string): string {
    const match = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
    return match ? text.slice(match[0].length) : text;
  }

  getToc(): TocEntry[] {
    return this.lastToc;
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

    const tocHtml = this.buildTocHtml();

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
  <div id="toc-toggle" title="Toggle TOC">☰</div>
  <nav id="toc">${tocHtml}</nav>
  <div id="preview">${body}</div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }

  private buildTocHtml(): string {
    if (this.lastToc.length === 0) { return ''; }
    return '<ul>' + this.lastToc.map(e =>
      `<li class="toc-h${e.level}"><a href="#${e.id}">${e.text}</a></li>`
    ).join('') + '</ul>';
  }

  private slugify(text: string): string {
    return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
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
  }

  private addHeadingIds(): void {
    const slugCounts = new Map<string, number>();

    const defaultHeadingOpen = this.md.renderer.rules.heading_open ||
      ((tokens: any, idx: any, options: any, _env: any, self: any) => self.renderToken(tokens, idx, options));

    this.md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
      const token = tokens[idx];
      const level = parseInt(token.tag.slice(1), 10);
      const contentToken = tokens[idx + 1];
      const text = contentToken?.children?.reduce((acc: string, t: any) => acc + t.content, '') || '';
      let slug = this.slugify(text);
      const count = slugCounts.get(slug) || 0;
      if (count > 0) { slug = `${slug}-${count}`; }
      slugCounts.set(slug, count + 1);
      token.attrSet('id', slug);
      if (token.map && token.map[0] !== undefined) {
        token.attrSet('data-source-line', String(token.map[0]));
      }
      this.lastToc.push({ level, text, id: slug });
      return self.renderToken(tokens, idx, options);
    };
  }

  private addMermaidFence(): void {
    const defaultFence = this.md.renderer.rules.fence ||
      ((tokens: any, idx: any, options: any, _env: any, self: any) => self.renderToken(tokens, idx, options));

    this.md.renderer.rules.fence = (tokens, idx, options, env, self) => {
      const token = tokens[idx];
      if (token.info.trim() === 'mermaid') {
        const escaped = this.md.utils.escapeHtml(token.content);
        return `<div class="mermaid-source">${escaped}</div>`;
      }
      return defaultFence(tokens, idx, options, env, self);
    };
  }
}