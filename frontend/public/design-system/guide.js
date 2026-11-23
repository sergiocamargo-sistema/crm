const status = document.querySelector('#guide-status');
let statusTimer;

function announce(message) {
  clearTimeout(statusTimer);
  status.textContent = message;
  statusTimer = setTimeout(() => {
    status.textContent = '';
  }, 3000);
}

for (const swatch of document.querySelectorAll('[data-copy]')) {
  swatch.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(swatch.dataset.copy);
      announce(`${swatch.dataset.copy} copiado.`);
    } catch {
      announce(`Código da cor: ${swatch.dataset.copy}`);
    }
  });
}

for (const button of document.querySelectorAll('[data-demo]')) {
  button.addEventListener('click', () => announce(`${button.dataset.demo} · Exemplo visual.`));
}

const dialog = document.querySelector('#example-dialog');
document.querySelector('#open-dialog').addEventListener('click', () => dialog.showModal());
for (const button of document.querySelectorAll('[data-close-dialog]')) {
  button.addEventListener('click', () => dialog.close());
}
document.querySelector('#confirm-dialog').addEventListener('click', () => {
  dialog.close();
  announce('Exemplo confirmado.');
});
