# Long Document Test

## Section 1: Introduction

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.

## Section 2: Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Extension   │────▶│ PreviewMgr   │────▶│  Webview     │
│  activate()  │     │ Map<uri,panel>│    │  preview.ts  │
└─────────────┘     └──────────────┘     └─────────────┘
       │                    │
       ▼                    ▼
┌─────────────┐     ┌──────────────┐
│ AutoPreview  │     │  Renderer    │
│ Manager      │     │  markdown-it │
└─────────────┘     └──────────────┘
```

## Section 3: Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| R1 | Live preview | Critical | ✅ Done |
| R2 | Multi-file | Critical | ✅ Done |
| R3 | Auto open/close | High | ✅ Done |
| R4 | Scroll sync | Medium | 📋 Planned |
| R5 | TOC | Medium | 📋 Planned |
| R6 | PDF export | Low | 📋 Planned |
| R7 | Mermaid | Low | 📋 Planned |
| R8 | Theme support | Medium | 📋 Planned |

## Section 4: Nested Content

### 4.1 Deep Nesting

#### 4.1.1 Level 4

##### 4.1.1.1 Level 5

Content at heading level 5.

### 4.2 Mixed Content

Here is a paragraph followed by a list and code:

- Step 1: Install dependencies
- Step 2: Configure
- Step 3: Run

```bash
npm install
npm run compile
code --extensionDevelopmentPath=.
```

> **Note:** Make sure to run `npm run typecheck` before testing.

### 4.3 Task List

- [x] Scaffolding
- [x] Core preview
- [x] Custom editor
- [x] Auto preview
- [ ] Scroll sync
- [ ] TOC
- [ ] PDF export

## Section 5: Horizontal Rules

---

Content between rules.

---

## Section 6: Emphasis Variants

This is **bold**, this is *italic*, this is ***bold italic***, this is ~~strikethrough~~.

## Section 7: End

The end of the long test document.
