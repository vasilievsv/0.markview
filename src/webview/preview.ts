declare function acquireVsCodeApi(): {
  postMessage(message: unknown): void;
  getState(): { scrollPosition?: number; tocVisible?: boolean } | undefined;
  setState(state: { scrollPosition?: number; tocVisible?: boolean }): void;
};

import { renderMermaidBlocks } from './mermaid-init';

const vscode = acquireVsCodeApi();
const preview = document.getElementById('preview');
const toc = document.getElementById('toc');
const tocToggle = document.getElementById('toc-toggle');

const savedState = vscode.getState();
if (savedState?.scrollPosition) {
  window.scrollTo(0, savedState.scrollPosition);
}
if (savedState?.tocVisible && toc) {
  toc.classList.add('visible');
}

let isExternalUpdate = false;

tocToggle?.addEventListener('click', () => {
  toc?.classList.toggle('visible');
  const state = vscode.getState() || {};
  vscode.setState({ ...state, tocVisible: toc?.classList.contains('visible') });
});

toc?.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  if (target.tagName === 'A') {
    e.preventDefault();
    const href = target.getAttribute('href');
    if (href) {
      const id = href.slice(1);
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
});

window.addEventListener('message', (event) => {
  const msg = event.data;
  if (msg.command === 'update' && preview) {
    isExternalUpdate = true;
    const scrollPos = window.scrollY;
    preview.innerHTML = msg.body;
    window.scrollTo(0, scrollPos);
    isExternalUpdate = false;
    renderMermaidBlocks();
  }
  if (msg.command === 'updateToc' && toc) {
    toc.innerHTML = msg.html;
  }
  if (msg.command === 'scrollToLine') {
    const el = document.querySelector(`[data-source-line="${msg.line}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  if (msg.command === 'exportPdf') {
    exportToPdf(msg.filename || 'document');
  }
});

function notifyEdit(content: string): void {
  if (!isExternalUpdate) {
    vscode.postMessage({ command: 'edit', content });
  }
}

window.addEventListener('scroll', () => {
  const state = vscode.getState() || {};
  vscode.setState({ ...state, scrollPosition: window.scrollY });
  if (!isExternalUpdate) {
    const line = getVisibleSourceLine();
    if (line !== undefined) {
      vscode.postMessage({ command: 'revealLine', line });
    }
  }
}, { passive: true });

function getVisibleSourceLine(): number | undefined {
  const elements = document.querySelectorAll('[data-source-line]');
  const viewportTop = window.scrollY;
  for (const el of elements) {
    const rect = (el as HTMLElement).getBoundingClientRect();
    if (rect.top >= 0) {
      return parseInt((el as HTMLElement).dataset.sourceLine || '0', 10);
    }
  }
  if (elements.length > 0) {
    const last = elements[elements.length - 1] as HTMLElement;
    return parseInt(last.dataset.sourceLine || '0', 10);
  }
  return undefined;
}

async function svgToImage(svg: SVGSVGElement): Promise<HTMLImageElement> {
  const bbox = svg.getBoundingClientRect();
  const canvas = document.createElement('canvas');
  const scale = 2;
  canvas.width = bbox.width * scale;
  canvas.height = bbox.height * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);
  const svgData = new XMLSerializer().serializeToString(svg);
  const dataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, bbox.width, bbox.height);
      const pngUrl = canvas.toDataURL('image/png');
      const result = new Image();
      result.src = pngUrl;
      result.style.width = `${bbox.width}px`;
      result.style.height = `${bbox.height}px`;
      result.style.display = 'block';
      result.style.margin = '0 auto';
      resolve(result);
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

async function exportToPdf(filename: string): Promise<void> {
  if (!preview) { return; }
  try {
    const svgs = preview.querySelectorAll('svg');
    const replacements: { parent: Element; svg: SVGSVGElement; img: HTMLImageElement }[] = [];
    for (const svg of svgs) {
      const img = await svgToImage(svg);
      const parent = svg.parentElement!;
      parent.replaceChild(img, svg);
      replacements.push({ parent, svg, img });
    }

    const html2pdf = (await import('html2pdf.js')).default;
    const contentHeight = preview.scrollHeight;
    const contentWidth = preview.scrollWidth;
    const pxToMm = 0.264583;
    const pageWidth = Math.max(210, contentWidth * pxToMm + 20);
    const pageHeight = contentHeight * pxToMm + 20;

    await html2pdf()
      .set({
        margin: 10,
        filename: `${filename}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: [pageWidth, pageHeight], orientation: 'portrait' },
      })
      .from(preview)
      .save();

    for (const r of replacements) {
      r.parent.replaceChild(r.svg, r.img);
    }

    vscode.postMessage({ command: 'pdfExported', success: true });
  } catch (err) {
    vscode.postMessage({ command: 'pdfExported', success: false, error: String(err) });
  }
}

renderMermaidBlocks();
