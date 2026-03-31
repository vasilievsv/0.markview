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

window.addEventListener('message', (event) => {
  const msg = event.data;
  if (msg.command === 'update' && preview) {
    const scrollPos = window.scrollY;
    preview.innerHTML = msg.body;
    window.scrollTo(0, scrollPos);
  }
});

window.addEventListener('scroll', () => {
  vscode.setState({ scrollPosition: window.scrollY });
}, { passive: true });