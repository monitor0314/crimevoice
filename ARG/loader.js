(async function () {
  const status = document.getElementById('connection');
  try {
    const base = String(window.ARG_API_BASE || '').replace(/\/$/, '');
    if (!base) throw new Error('請先在 config.js 填入 Cloudflare 後端網址。');
    const api = new URL(base);
    if (api.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(api.hostname)) {
      throw new Error('後端網址必須使用 HTTPS。');
    }
    window.ARG_API_BASE = base;
    window.argFetch = async (path, options = {}) => {
      const headers = new Headers(options.headers);
      headers.set('X-ARG-Frontend', new URL('./', location.href).href);
      const response = await fetch(base + path, { ...options, headers, cache: 'no-store', signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error('連線失敗（' + response.status + '）');
      return response.json();
    };
    const payload = await window.argFetch('/api/bootstrap');
    const style = document.createElement('style');
    style.textContent = payload.css;
    document.head.appendChild(style);
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.href = base + '/assets/app-logo.webp';
    document.head.appendChild(favicon);
    document.body.innerHTML = payload.html;
    window.ARG_STORY = payload.story;
    const script = document.createElement('script');
    script.textContent = payload.script;
    document.body.appendChild(script);
  } catch (error) {
    document.body.replaceChildren(status);
    status.textContent = '暫時無法載入，請確認網路連線後重試。' + (window.ARG_API_BASE ? '' : ' ' + error.message);
    const retry = document.createElement('button');
    retry.textContent = '重新連線';
    retry.onclick = () => location.reload();
    status.append(document.createElement('br'), retry);
  }
})();
