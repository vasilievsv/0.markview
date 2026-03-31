# 0.markview

Расширение для VS Code и [Kiro](https://kiro.dev). Markdown preview, который делает три вещи, которых нет из коробки.

## 1. PDF без костылей

Одна команда → один PDF. Mermaid-диаграммы рендерятся как изображения, без разрывов страниц посреди flowchart. Без Chrome, без Puppeteer, без внешних утилит. Всё происходит внутри webview.

## 2. Мульти-preview

Открыл 10 `.md` — получил 10 независимых preview-табов. Каждый рендерится сам по себе, синхронизируется с правками, не дерётся за общую панель. TOC-sidebar, mermaid-диаграммы, подсветка синтаксиса, поддержка тем — всё в каждом табе.

## 3. Оптимизация

Большинство markdown-превьюеров грузят всё сразу. Мы — нет.

```
Открыл README.md (без mermaid, без PDF)
  → загрузилось 5KB. Всё.

Открыл architecture.md (есть mermaid-блоки)
  → 5KB + ядро mermaid по требованию
  → каждый тип диаграмм — отдельный chunk

Нажал "Export to PDF"
  → html2pdf.js грузится впервые
  → SVG конвертируются в PNG на лету
```

10 табов открыто? Каждый — 5KB пока не понадобится больше. Mermaid весит ~5MB — платишь только когда используешь.

---

## Установка

Скачай `.vsix` из [Releases](https://github.com/vasilievsv/0.markview/releases), затем:

```bash
code --install-extension 0-markview-0.1.0.vsix
```

Или в VS Code / Kiro: Extensions → `...` → Install from VSIX.

Открой любой `.md` файл. Готово.

## Горячие клавиши

| Что | Клавиши |
|-----|---------|
| Preview | `Ctrl+Shift+V` |
| Preview сбоку | `Ctrl+K V` |
| Исходник | `Ctrl+E` |
| Экспорт PDF | Палитра команд → `Export to PDF` |
| Оглавление | ☰ в preview |

## Mermaid

Flowchart, sequence, state, class, ER, gantt, pie, git graph, mindmap, timeline, sankey, kanban.

## Настройки

| Настройка | По умолчанию | Что делает |
|-----------|-------------|------------|
| `multiPreview.autoClose` | `true` | Закрывать preview при закрытии исходника |
| `multiPreview.openToSide` | `true` | Preview рядом с исходником |
| `multiPreview.scrollSync` | `true` | Синхронизация скролла |
| `multiPreview.toc.enabled` | `true` | Оглавление (TOC) |
| `multiPreview.fontSize` | `14` | Размер шрифта |

## Стек

TypeScript · esbuild (code splitting) · markdown-it · highlight.js · mermaid.js · html2pdf.js

## Совместимость

- VS Code ^1.75.0
- [Kiro](https://kiro.dev)

## Лицензия

MIT
