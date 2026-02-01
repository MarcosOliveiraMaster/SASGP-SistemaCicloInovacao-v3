// IA helpers: extract text from selected PDF and request a brief summary from AI
// Configuration GROQ - ÚNICA DECLARAÇÃO
// NOTA: Configure a chave de API no arquivo .env ou como variável de ambiente
// const GROQ_API_KEY = process.env.GROQ_API_KEY || "YOUR_API_KEY_HERE";
const GROQ_API_KEY = ""; // Configure via variável de ambiente ou .env
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Backwards-compatible aliases used by the rest of the file
const IA_API_KEY = GROQ_API_KEY;
const IA_API_URL = GROQ_API_URL;

// Validação das configurações
console.group('🔍 Validação de Configurações');
console.log('✅ Firebase Config:', window.firebaseConfig ? 'Presente' : 'Faltando');
console.log('✅ Firebase DB:', window.db ? 'Inicializado' : 'Não inicializado');
console.log('✅ GROQ API Key:', GROQ_API_KEY ? 'Presente' : 'Faltando');
console.log('✅ GROQ API URL:', GROQ_API_URL);
console.groupEnd();

// Exportar para uso global (se necessário)
if (typeof window !== 'undefined') {
  window.GROQ_API_KEY = GROQ_API_KEY;
  window.GROQ_API_URL = GROQ_API_URL;
  window.IA_API_KEY = IA_API_KEY;
  window.IA_API_URL = IA_API_URL;
}

async function loadPdfJs() {
  if (window.pdfjsLib) return window.pdfjsLib;
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
    script.onload = () => {
      try {
        if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        }
        resolve(window.pdfjsLib);
      } catch (e) { resolve(window.pdfjsLib); }
    };
    script.onerror = (e) => reject(new Error('Falha ao carregar pdf.js'));
    document.head.appendChild(script);
  });
}

async function extractTextFromSelectedPdf() {
  // globals `tempArquivoFile` and `tempArquivoURL` are provided by `script.js`
  const file = window.tempArquivoFile || null;
  const url = (!file && window.tempArquivoURL) ? window.tempArquivoURL : null;
  if (!file && !url) throw new Error('Nenhum arquivo PDF selecionado');

  const pdfjsLib = await loadPdfJs();
  if (!pdfjsLib) throw new Error('pdf.js não disponível');

  let arrayBuffer;
  if (file) {
    arrayBuffer = await file.arrayBuffer();
  } else {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Falha ao buscar o PDF: ' + resp.status);
    arrayBuffer = await resp.arrayBuffer();
  }

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const maxPages = pdf.numPages;
  let fullText = '';
  for (let i = 1; i <= maxPages; i++) {
    try {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(it => it.str).join(' ');
      fullText += '\n\n' + pageText;
      // safety: avoid extracting extremely large PDFs fully
      if (fullText.length > 15000) { fullText = fullText.slice(0, 15000); break; }
    } catch (e) {
      console.warn('Erro ao ler página', i, e);
    }
  }
  return fullText.trim();
}

async function callAiSummary(text) {
  // Prefer server-side proxy to avoid exposing API key in the browser
  try {
    // try a list of likely proxy endpoints so we don't accidentally POST to the static dev server
    const endpoints = [];
    if (window.__IA_PROXY_ENDPOINT__) endpoints.push(window.__IA_PROXY_ENDPOINT__);
    endpoints.push('http://localhost:3000/api/summarize');
    endpoints.push('/api/summarize');
    let proxyData = null;
    for (const ep of endpoints) {
      if (!ep) continue;
      try {
        const resp = await fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
        if (!resp) continue;
        if (resp.ok) {
          proxyData = await resp.json();
          if (proxyData && proxyData.summary) return proxyData.summary;
          if (proxyData && proxyData.choices && proxyData.choices[0] && proxyData.choices[0].message) return proxyData.choices[0].message.content || '';
        } else {
          console.warn('Proxy summarize returned', resp.status, 'from', ep);
          // try next endpoint for 4xx/5xx
          continue;
        }
      } catch (err) {
        console.warn('Proxy endpoint failed:', ep, err);
        continue;
      }
    }
  } catch (err) {
    console.warn('Proxy summarize overall failed, will fallback to direct API call', err);
  }

  // Fallback: direct call (not recommended for production since it exposes the key)
  if (!IA_API_KEY) throw new Error('Chave de API não configurada para fallback');
  const prompt = `Faça um resumo breve (3-5 linhas) em português do seguinte documento:\n\n${text}`;
  const body = { model: 'gpt-3.5-turbo', messages: [{ role: 'user', content: prompt }], max_tokens: 300, temperature: 0.2 };
  const resp = await fetch(IA_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${IA_API_KEY}` }, body: JSON.stringify(body) });
  if (!resp.ok) {
    const t = await resp.text();
    if (resp.status === 401) throw new Error('Chave de API inválida ou não autorizada (401). Use o proxy servidor com chave válida.');
    throw new Error('Erro na API de IA: ' + resp.status + ' ' + t);
  }
  const data = await resp.json();
  const msg = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  return msg || '';
}

function createSummaryModal(summary) {
  // remove existing
  const existing = document.getElementById('iaSummaryModal');
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.id = 'iaSummaryModal';
  Object.assign(overlay.style, { position:'fixed',left:0,top:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:99999 });
  const box = document.createElement('div');
  Object.assign(box.style, { width:'min(880px,95%)', maxHeight:'80%', overflow:'auto', background:'#fff', borderRadius:'8px', padding:'16px', boxSizing:'border-box' });
  const h = document.createElement('h3'); h.textContent = 'Resumo do PDF'; h.style.marginTop = '0';
  const pre = document.createElement('div'); pre.style.whiteSpace='pre-wrap'; pre.style.margin='10px 0'; pre.textContent = summary;
  const actions = document.createElement('div'); actions.style.display='flex'; actions.style.justifyContent='flex-end'; actions.style.gap='8px';
  const insertBtn = document.createElement('button'); insertBtn.textContent = 'Inserir em Sobre do Edital';
  const closeBtn = document.createElement('button'); closeBtn.textContent = 'Fechar';
  insertBtn.addEventListener('click', () => {
    const sobre = document.getElementById('inputSobreEdital');
    if (sobre) sobre.value = summary;
    overlay.remove();
  });
  closeBtn.addEventListener('click', () => overlay.remove());
  actions.appendChild(insertBtn); actions.appendChild(closeBtn);
  box.appendChild(h); box.appendChild(pre); box.appendChild(actions); overlay.appendChild(box); document.body.appendChild(overlay);
}

async function handleResumoClick(e) {
  try {
    const btn = e.currentTarget;
    btn.disabled = true; btn.textContent = 'Resumindo...';
    // ensure a PDF is selected; if not, open the file picker and abort
    const file = window.tempArquivoFile || null;
    const url = (!file && window.tempArquivoURL) ? window.tempArquivoURL : null;
    if (!file && !url) {
      const input = document.getElementById('inputArquivoEdital');
      if (input) {
        // open file picker so user can select a PDF
        input.click();
      }
      // notify user and stop; they should select a PDF then click 'Resumo com IA' again
      alert('Por favor selecione um arquivo PDF primeiro. O seletor de arquivos foi aberto. Depois clique em "Resumo com IA" novamente.');
      return;
    }
    const text = await extractTextFromSelectedPdf();
    if (!text) throw new Error('Não foi possível extrair texto do PDF');
    const summary = await callAiSummary(text.slice(0, 15000));
    const finalSummary = summary || 'Sem resumo retornado.';
    // directly insert into Sobre do Edital
    const sobre = document.getElementById('inputSobreEdital');
    if (sobre) {
      sobre.value = finalSummary;
      // small transient confirmation
      const notice = document.createElement('div');
      notice.textContent = 'Resumo inserido em "Sobre o Edital"';
      Object.assign(notice.style, { position:'fixed',right:'16px',bottom:'16px',background:'#0b6cff',color:'#fff',padding:'8px 12px',borderRadius:'6px',zIndex:99999 });
      document.body.appendChild(notice);
      setTimeout(() => notice.remove(), 3000);
    } else {
      // fallback to modal if field not found
      createSummaryModal(finalSummary);
    }
  } catch (err) {
    console.error(err);
    alert('Erro ao gerar resumo: ' + (err.message || err));
  } finally {
    const btn = document.getElementById('btnResumoIA');
    if (btn) { btn.disabled = false; btn.textContent = 'Resumo com IA'; }
  }
}

// attach handler if button exists
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btnResumoIA');
  if (btn) btn.addEventListener('click', handleResumoClick);
});

export { extractTextFromSelectedPdf, callAiSummary };
