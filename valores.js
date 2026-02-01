// Helper module para coletar valores do modal de Edital e salvar/ler no Firestore (coleção 'editais')
export function generateId() {
  return `ed-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
}

function getCheckedValues(selector, root = document) {
  return Array.from(root.querySelectorAll(selector)).filter(ch => ch.checked).map(ch => ch.value);
}

export function collectFormAddEdital() {
  const data = {};
  const form = document.getElementById('formAddEdital');
  if (!form) return data;
  // collect named fields
  Array.from(form.elements).forEach(el => {
    if (el.name && (el.type !== 'submit' && el.type !== 'button')) {
      if (el.type === 'checkbox') {
        // ignore individual checkboxes here
      } else {
        data[el.name] = el.value;
      }
    }
  });
  // Aderencia checks
  data.aderencia = getCheckedValues('.aderencia-check');
  // Etapas de Aderência (booleanas)
  data.etapas = {};
  const steps = document.querySelectorAll('#etapasAderencia .step');
  if (steps && steps.length) {
    steps.forEach(s => {
      const key = s.dataset.key;
      const btn = s.querySelector('.etapa-btn');
      data.etapas[key] = !!(btn && btn.classList.contains('active'));
    });
  }
  // Status checks (Resultados Finais)
  data.statusChecks = getCheckedValues('.status-check');
  // Equipe selecionada
  const equipe = Array.from(document.querySelectorAll('#customEquipeOptions input[type="checkbox"]:checked')).map(i=>i.value);
  data.equipe = equipe;
  // Atividades (tabela)
  data.atividades = [];
  const tbodyAt = document.getElementById('tbodyAtividades');
  if (tbodyAt) {
    Array.from(tbodyAt.querySelectorAll('tr')).forEach(tr => {
      const resp = tr.querySelector('.select-responsavel') ? tr.querySelector('.select-responsavel').value : '';
      const ativ = tr.querySelector('.textarea-atividade') ? tr.querySelector('.textarea-atividade').value : '';
      const ok = tr.querySelector('.checkbox-check') ? !!tr.querySelector('.checkbox-check').checked : false;
      if (resp || ativ) data.atividades.push({ responsavel: resp, atividade: ativ, check: ok });
    });
  }
  // Calendario
  data.calendario = [];
  const tbodyCal = document.getElementById('tbodyCalendario');
  if (tbodyCal) {
    Array.from(tbodyCal.querySelectorAll('tr')).forEach(tr => {
      const resp = tr.querySelector('.select-responsavel') ? tr.querySelector('.select-responsavel').value : '';
      const ativ = tr.querySelector('.textarea-atividade') ? tr.querySelector('.textarea-atividade').value : '';
      const prazo = tr.querySelector('.input-prazo') ? tr.querySelector('.input-prazo').value : '';
      const ok = tr.querySelector('.checkbox-check') ? !!tr.querySelector('.checkbox-check').checked : false;
      if (resp || ativ || prazo) data.calendario.push({ responsavel: resp, atividade: ativ, prazo, check: ok });
    });
  }
  // Comentários finais
  const comentarios = document.getElementById('inputComentariosFinais');
  if (comentarios) data.comentariosFinais = comentarios.value;
  // Sobre edital
  const sobre = document.getElementById('inputSobreEdital');
  if (sobre) data.sobreEdital = sobre.value;

  data.updatedAt = new Date().toISOString();
  return data;
}

export async function saveEdital(editalId, payload) {
  const mod = await import('./banco.js');
  const { doc, setDoc, collection } = mod;
  const db = mod.db;
  const docRef = doc(collection(db, 'editais'), editalId);
  // ensure docPath inside payload
  payload.docPath = `editais/${editalId}`;
  payload.updatedAt = payload.updatedAt || new Date().toISOString();
  if (!payload.createdAt) payload.createdAt = new Date().toISOString();
  await setDoc(docRef, payload);
  return payload.docPath;
}

export async function getEdital(editalId) {
  const mod = await import('./banco.js');
  const { doc, getDoc, collection } = mod;
  const db = mod.db;
  const ref = doc(collection(db, 'editais'), editalId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data();
}

export async function updateEditalPosicao(editalId, posicao) {
  const existing = await getEdital(editalId) || {};
  existing.posicao = posicao;
  existing.updatedAt = new Date().toISOString();
  await saveEdital(editalId, existing);
  return `editais/${editalId}`;
}

export async function listEditais() {
  const mod = await import('./banco.js');
  const { collection, getDocs } = mod;
  const db = mod.db;
  const colRef = collection(db, 'editais');
  const snap = await getDocs(colRef);
  const items = [];
  snap.forEach(d => {
    const data = d.data();
    // include id
    data._id = d.id;
    items.push(data);
  });
  return items;
}

export async function deleteEdital(editalId) {
  const mod = await import('./banco.js');
  const { doc, deleteDoc, collection } = mod;
  const db = mod.db;
  const ref = doc(collection(db, 'editais'), editalId);
  await deleteDoc(ref);
  return true;
}
