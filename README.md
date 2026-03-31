# 0.markview

Multi-preview markdown viewer for VS Code. Each `.md` file gets its own independent preview tab.

## Features

🔄 **Multi Preview** — open multiple `.md` files, each with its own preview tab. No shared state, no conflicts.

📖 **Default Viewer** — `.md` files open as rendered preview by default. `Ctrl+E` to edit source side-by-side.

📑 **TOC Sidebar** — click ☰ in preview to toggle table of contents. Click heading to navigate.

🧜 **Mermaid Diagrams** — flowcharts, sequence, state diagrams render inline via mermaid.js.

📄 **PDF Export** — `Ctrl+Shift+P` → `0.markview: Export to PDF`. Single-page output, no page breaks through diagrams.

🎨 **Theme Integration** — follows VS Code light/dark/high-contrast themes automatically.

💡 **Syntax Highlighting** — 190+ languages via highlight.js.

🔍 **Scroll Sync** — preview tracks source line position.

## Commands

| Command | Keybinding | Description |
|---------|-----------|-------------|
| `0.markview: Open Preview` | `Ctrl+Shift+V` | Open preview in current tab |
| `0.markview: Open Preview to Side` | `Ctrl+K V` | Open preview side-by-side |
| `0.markview: Edit Source` | `Ctrl+E` | Open source next to preview |
| `0.markview: Toggle Auto Preview` | — | Toggle auto-open behavior |
| `0.markview: Export to PDF` | — | Export current preview to PDF |
| `0.markview: Toggle TOC` | — | Toggle table of contents |

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `multiPreview.enabled` | `true` | Enable multi-preview |
| `multiPreview.defaultViewer` | `"preview"` | Default viewer for .md files |
| `multiPreview.autoOpen` | `false` | Auto-open preview panel |
| `multiPreview.autoClose` | `true` | Auto-close preview when source closes |
| `multiPreview.openToSide` | `true` | Open preview to side |
| `multiPreview.scrollSync` | `true` | Bidirectional scroll sync |
| `multiPreview.toc.enabled` | `true` | Enable TOC |
| `multiPreview.fontSize` | `14` | Preview font size |
| `multiPreview.debounceMs` | `150` | Debounce delay for auto-open |

## Mermaid Support

````markdown
```mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action]
    B -->|No| D[End]
```
````

Supported: flowchart, sequence, state, class, ER, gantt, pie, git graph.

## Tech Stack

- TypeScript + esbuild (dual entry: extension + webview)
- markdown-it + highlight.js
- mermaid.js (diagram rendering)
- html2pdf.js (client-side PDF export)
- CustomTextEditorProvider API

## Development

```bash
npm install
npm run compile      # build
npm run typecheck    # type check
npm run watch        # watch mode
# F5 in VS Code → Extension Development Host
```

## License

MIT
