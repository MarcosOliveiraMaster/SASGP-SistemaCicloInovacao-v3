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

export function loadFormFromData(data) {
  if (!data) return;
  const form = document.getElementById('formAddEdital');
  if (!form) return;
  
  // Carregar campos básicos nomeados
  Array.from(form.elements).forEach(el => {
    if (el.name && data.hasOwnProperty(el.name)) {
      if (el.type !== 'checkbox' && el.type !== 'submit' && el.type !== 'button') {
        el.value = data[el.name] || '';
      }
    }
  });
  
  // Carregar aderencia checks
  if (data.aderencia && Array.isArray(data.aderencia)) {
    document.querySelectorAll('.aderencia-check').forEach(check => {
      check.checked = data.aderencia.includes(check.value);
    });
  }
  
  // Carregar etapas de aderência
  if (data.etapas && typeof data.etapas === 'object') {
    const steps = document.querySelectorAll('#etapasAderencia .step');
    steps.forEach(step => {
      const key = step.dataset.key;
      const btn = step.querySelector('.etapa-btn');
      if (data.etapas[key] && btn) {
        btn.classList.add('active');
      } else if (btn) {
        btn.classList.remove('active');
      }
    });
  }
  
  // Carregar status checks
  if (data.statusChecks && Array.isArray(data.statusChecks)) {
    document.querySelectorAll('.status-check').forEach(check => {
      check.checked = data.statusChecks.includes(check.value);
    });
  }
  
  // Carregar equipe
  if (data.equipe && Array.isArray(data.equipe)) {
    document.querySelectorAll('#customEquipeOptions input[type="checkbox"]').forEach(check => {
      check.checked = data.equipe.includes(check.value);
    });
  }
  
  // Carregar atividades
  if (data.atividades && Array.isArray(data.atividades)) {
    const tbody = document.getElementById('tbodyAtividades');
    if (tbody) {
      // Remover todas as linhas exceto a primeira
      const rows = Array.from(tbody.querySelectorAll('tr'));
      for (let i = rows.length - 1; i > 0; i--) {
        rows[i].remove();
      }
      
      // Limpar a primeira linha
      const firstRow = rows[0];
      if (firstRow) {
        const selectResp = firstRow.querySelector('.select-responsavel');
        const textArea = firstRow.querySelector('.textarea-atividade');
        const checkbox = firstRow.querySelector('.checkbox-check');
        if (selectResp) selectResp.value = '';
        if (textArea) textArea.value = '';
        if (checkbox) checkbox.checked = false;
      }
      
      // Adicionar dados das atividades
      data.atividades.forEach((atividade, idx) => {
        let row = firstRow;
        if (idx > 0) {
          row = document.createElement('tr');
          row.innerHTML = `
            <td><select class="select-responsavel"></select></td>
            <td><textarea class="textarea-atividade" rows="1"></textarea></td>
            <td><input type="checkbox" class="checkbox-check"></td>
          `;
          tbody.appendChild(row);
          // Atualizar selects com equipe
          updateResponsaveisSelects();
        }
        
        const selectResp = row.querySelector('.select-responsavel');
        const textArea = row.querySelector('.textarea-atividade');
        const checkbox = row.querySelector('.checkbox-check');
        
        if (selectResp) selectResp.value = atividade.responsavel || '';
        if (textArea) textArea.value = atividade.atividade || '';
        if (checkbox) checkbox.checked = atividade.check || false;
      });
    }
  }
  
  // Carregar calendário
  if (data.calendario && Array.isArray(data.calendario)) {
    const tbody = document.getElementById('tbodyCalendario');
    if (tbody) {
      // Remover todas as linhas exceto a primeira
      const rows = Array.from(tbody.querySelectorAll('tr'));
      for (let i = rows.length - 1; i > 0; i--) {
        rows[i].remove();
      }
      
      // Limpar a primeira linha
      const firstRow = rows[0];
      if (firstRow) {
        const selectResp = firstRow.querySelector('.select-responsavel');
        const textArea = firstRow.querySelector('.textarea-atividade');
        const inputPrazo = firstRow.querySelector('.input-prazo');
        const checkbox = firstRow.querySelector('.checkbox-check');
        if (selectResp) selectResp.value = '';
        if (textArea) textArea.value = '';
        if (inputPrazo) inputPrazo.value = '';
        if (checkbox) checkbox.checked = false;
      }
      
      // Adicionar dados do calendário
      data.calendario.forEach((item, idx) => {
        let row = firstRow;
        if (idx > 0) {
          row = document.createElement('tr');
          row.innerHTML = `
            <td><select class="select-responsavel"></select></td>
            <td><textarea class="textarea-atividade" rows="1"></textarea></td>
            <td><input type="date" class="input-prazo"></td>
            <td><input type="checkbox" class="checkbox-check"></td>
          `;
          tbody.appendChild(row);
          // Atualizar selects com equipe
          updateResponsaveisSelects();
        }
        
        const selectResp = row.querySelector('.select-responsavel');
        const textArea = row.querySelector('.textarea-atividade');
        const inputPrazo = row.querySelector('.input-prazo');
        const checkbox = row.querySelector('.checkbox-check');
        
        if (selectResp) selectResp.value = item.responsavel || '';
        if (textArea) textArea.value = item.atividade || '';
        if (inputPrazo) inputPrazo.value = item.prazo || '';
        if (checkbox) checkbox.checked = item.check || false;
      });
    }
  }
  
  // Renderizar progresso de aderência
  const aderenciaChecks = document.querySelectorAll('.aderencia-check');
  if (aderenciaChecks.length > 0) {
    const total = aderenciaChecks.length;
    const checked = document.querySelectorAll('.aderencia-check:checked').length;
    const percent = Math.round((checked / total) * 100);
    const progressBar = document.getElementById('aderencia-progress');
    const percentSpan = document.getElementById('aderencia-percent');
    if (progressBar) progressBar.style.width = percent + '%';
    if (percentSpan) percentSpan.textContent = percent + '%';
  }
}

function updateResponsaveisSelects() {
  const customEquipeOptions = document.getElementById('customEquipeOptions');
  if (!customEquipeOptions) return;
  const checked = customEquipeOptions.querySelectorAll('input[type="checkbox"]:checked');
  const responsaveis = Array.from(checked).map(cb => cb.value);
  
  document.querySelectorAll('.select-responsavel').forEach(select => {
    const currentValue = select.value;
    select.innerHTML = '<option value="">Selecione</option>';
    responsaveis.forEach(resp => {
      const opt = document.createElement('option');
      opt.value = resp;
      opt.textContent = resp;
      select.appendChild(opt);
    });
    select.value = currentValue;
  });
}
