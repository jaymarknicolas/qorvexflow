const iframe = document.getElementById('app-frame');
const loader = document.getElementById('loader');
const error = document.getElementById('error');
const retryBtn = document.getElementById('retry-btn');
let loadTimeout;

function hideLoader() {
  loader.classList.add('hidden');
}

function showError() {
  loader.classList.add('hidden');
  error.classList.add('visible');
}

function hideError() {
  error.classList.remove('visible');
}

function retryLoad() {
  hideError();
  loader.classList.remove('hidden');
  iframe.src = iframe.src;
  startLoadTimeout();
}

function startLoadTimeout() {
  clearTimeout(loadTimeout);
  loadTimeout = setTimeout(() => {
    showError();
  }, 15000);
}

// Attach event listener to retry button
retryBtn.addEventListener('click', retryLoad);

iframe.addEventListener('load', () => {
  clearTimeout(loadTimeout);
  hideLoader();
});

iframe.addEventListener('error', () => {
  clearTimeout(loadTimeout);
  showError();
});

startLoadTimeout();
