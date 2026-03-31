declare function acquireVsCodeApi(): {
  postMessage(message: unknown): void;
  getState(): { scrollPosition?: number } | undefined;
  setState(state: { scrollPosition?: number }): void;
};

const vscode = acquireVsCodeApi();
const preview = document.getElementById('preview');

const savedState = vscode.getState();
if (savedState?.scrollPosition) {
  window.scrollTo(0, savedState.scrollPosition);
}

let isExternalUpdate = false;

window.addEventListener('message', (event) => {
  const msg = event.data;
  if (msg.command === 'update' && preview) {
    isExternalUpdate = true;
    const scrollPos = window.scrollY;
    preview.innerHTML = msg.body;
    window.scrollTo(0, scrollPos);
    isExternalUpdate = false;
  }
});

function notifyEdit(content: string): void {
  if (!isExternalUpdate) {
    vscode.postMessage({ command: 'edit', content });
  }
}

window.addEventListener('scroll', () => {
  vscode.setState({ scrollPosition: window.scrollY });
}, { passive: true });