import mermaid from 'mermaid';

const isDark = document.body.classList.contains('vscode-dark')
  || document.body.classList.contains('vscode-high-contrast');

mermaid.initialize({
  startOnLoad: false,
  theme: isDark ? 'dark' : 'default',
  securityLevel: 'loose',
  fontFamily: 'sans-serif',
});

export async function renderMermaidBlocks(): Promise<void> {
  const blocks = document.querySelectorAll<HTMLElement>('.mermaid-source');
  for (const block of blocks) {
    const code = block.textContent || '';
    const container = document.createElement('div');
    container.className = 'mermaid';
    container.textContent = code;
    block.replaceWith(container);
  }
  await mermaid.run({ querySelector: '.mermaid' });
}
