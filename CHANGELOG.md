# Changelog

## 0.2.0

### Features
- Interceptor: перехват .md из Kiro chat → автооткрытие в CustomEditor
- `priority: "option"` + `configurationDefaults` — корректная работа с diff view
- Frontmatter stripping — YAML front matter не отображается в preview
- Auto-preview при переключении между .md файлами

### Fixes
- Per-URI debounce вместо глобального — корректная работа с несколькими файлами
- "Open With → Text Editor" guard — предотвращение цикла переоткрытия
- Diff view detection с pendingResolves counter — raw text fallback для diff
- Убран debug `showInformationMessage` из activation

### Style
- Обновлён font stack preview (system fonts)
- Улучшен стиль кнопки TOC toggle

### Known Issues
- Diff в Kiro chat: при клике на diff .md файла в чате Kiro отображается rendered markdown вместо raw diff. Это ограничение VSCode API — `TabInputTextDiff` не создаётся для diff из чата. Будет исправлено в следующем релизе.

## 0.1.1

- Icon, gallery banner, categories
- Publish to Marketplace в release workflow

## 0.1.0

- Multi-preview: каждый `.md` — свой таб
- CustomTextEditorProvider как дефолтный viewer
- TOC sidebar (☰)
- Mermaid-диаграммы (lazy load)
- PDF export (single page, без разрывов)
- Подсветка синтаксиса (190+ языков)
- Поддержка тем VS Code (light/dark/hc)
- Scroll sync
- Оптимизация: 5KB base, code splitting
