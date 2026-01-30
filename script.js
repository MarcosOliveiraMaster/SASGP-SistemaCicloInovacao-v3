// Custom multiselect Equipe Executora
const customEquipeSelect = document.getElementById('customEquipeSelect');
const customEquipeSelected = document.getElementById('customEquipeSelected');
const customEquipeOptions = document.getElementById('customEquipeOptions');
if (customEquipeSelect && customEquipeSelected && customEquipeOptions) {
	function updateEquipeSelected() {
		const checked = customEquipeOptions.querySelectorAll('input[type="checkbox"]:checked');
		if (checked.length === 0) {
			customEquipeSelected.textContent = 'Selecione Equipe';
			customEquipeSelected.classList.remove('selected');
		} else {
			const nomes = Array.from(checked).map(cb => cb.value);
			customEquipeSelected.textContent = nomes.join(', ');
			customEquipeSelected.classList.add('selected');
		}
		updateResponsaveis();
	}
	function updateResponsaveis() {
		const checked = customEquipeOptions.querySelectorAll('input[type="checkbox"]:checked');
		const responsaveis = Array.from(checked).map(cb => cb.value);
		document.querySelectorAll('.select-responsavel').forEach(select => {
			select.innerHTML = '<option value="">Selecione</option>';
			responsaveis.forEach(resp => {
				const opt = document.createElement('option');
				opt.value = resp;
				opt.textContent = resp;
				select.appendChild(opt);
			});
		});
	}
	customEquipeSelected.addEventListener('click', function(e) {
		customEquipeSelect.classList.toggle('open');
	});
	customEquipeOptions.addEventListener('click', function(e) {
		if (e.target.tagName === 'INPUT') {
			updateEquipeSelected();
		}
	});
	document.addEventListener('click', function(e) {
		if (!customEquipeSelect.contains(e.target)) {
			customEquipeSelect.classList.remove('open');
		}
	});
	updateEquipeSelected();
}
// Adicionar linha na tabela de atividades
const btnAddLinha = document.getElementById('btnAddLinha');
const tbodyAtividades = document.getElementById('tbodyAtividades');
if (btnAddLinha && tbodyAtividades) {
	btnAddLinha.addEventListener('click', function() {
		const tr = document.createElement('tr');
		tr.innerHTML = `
			<td><select class="select-responsavel"></select></td>
			<td><textarea class="textarea-atividade" rows="1"></textarea></td>
			<td><input type="checkbox" class="checkbox-check"></td>
		`;
		tbodyAtividades.appendChild(tr);
		// Atualizar selects de responsável
		const checked = customEquipeOptions.querySelectorAll('input[type="checkbox"]:checked');
		const responsaveis = Array.from(checked).map(cb => cb.value);
		const select = tr.querySelector('.select-responsavel');
		select.innerHTML = '<option value="">Selecione</option>';
		responsaveis.forEach(resp => {
			const opt = document.createElement('option');
			opt.value = resp;
			opt.textContent = resp;
			select.appendChild(opt);
		});
		// Adicionar listener para checkbox
		const checkbox = tr.querySelector('.checkbox-check');
		const textarea = tr.querySelector('.textarea-atividade');
		checkbox.addEventListener('change', function() {
			if (this.checked) {
				textarea.style.background = '#e8f5e8';
				this.style.background = '#4caf50';
			} else {
				textarea.style.background = '';
				this.style.background = '';
			}
		});
	});
}
// Máscara monetária para Valor do Edital
const inputValorEdital = document.getElementById('inputValorEdital');
if (inputValorEdital) {
	inputValorEdital.addEventListener('input', function(e) {
		let v = e.target.value.replace(/\D/g, '');
		v = (v/100).toFixed(2) + '';
		v = v.replace('.', ',');
		v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
		e.target.value = 'R$ ' + v;
	});
}

// Preencher estados e cidades usando IBGE
const estados = [
	{ sigla: 'AC', nome: 'Acre' }, { sigla: 'AL', nome: 'Alagoas' }, { sigla: 'AP', nome: 'Amapá' },
	{ sigla: 'AM', nome: 'Amazonas' }, { sigla: 'BA', nome: 'Bahia' }, { sigla: 'CE', nome: 'Ceará' },
	{ sigla: 'DF', nome: 'Distrito Federal' }, { sigla: 'ES', nome: 'Espírito Santo' }, { sigla: 'GO', nome: 'Goiás' },
	{ sigla: 'MA', nome: 'Maranhão' }, { sigla: 'MT', nome: 'Mato Grosso' }, { sigla: 'MS', nome: 'Mato Grosso do Sul' },
	{ sigla: 'MG', nome: 'Minas Gerais' }, { sigla: 'PA', nome: 'Pará' }, { sigla: 'PB', nome: 'Paraíba' },
	{ sigla: 'PR', nome: 'Paraná' }, { sigla: 'PE', nome: 'Pernambuco' }, { sigla: 'PI', nome: 'Piauí' },
	{ sigla: 'RJ', nome: 'Rio de Janeiro' }, { sigla: 'RN', nome: 'Rio Grande do Norte' }, { sigla: 'RS', nome: 'Rio Grande do Sul' },
	{ sigla: 'RO', nome: 'Rondônia' }, { sigla: 'RR', nome: 'Roraima' }, { sigla: 'SC', nome: 'Santa Catarina' },
	{ sigla: 'SP', nome: 'São Paulo' }, { sigla: 'SE', nome: 'Sergipe' }, { sigla: 'TO', nome: 'Tocantins' }
];
const inputEstado = document.getElementById('inputEstado');
const inputCidade = document.getElementById('inputCidade');
if (inputEstado) {
	estados.forEach(uf => {
		const opt = document.createElement('option');
		opt.value = uf.sigla;
		opt.textContent = uf.nome;
		inputEstado.appendChild(opt);
	});
	inputEstado.addEventListener('change', function() {
		inputCidade.innerHTML = '<option value="">Carregando...</option>';
		if (!this.value) {
			inputCidade.innerHTML = '<option value="">Selecione a cidade</option>';
			return;
		}
		fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${this.value}/municipios`)
			.then(resp => resp.json())
			.then(cidades => {
				inputCidade.innerHTML = '<option value="">Selecione a cidade</option>';
				cidades.forEach(cidade => {
					const opt = document.createElement('option');
					opt.value = cidade.nome;
					opt.textContent = cidade.nome;
					inputCidade.appendChild(opt);
				});
			})
			.catch(() => {
				inputCidade.innerHTML = '<option value="">Erro ao carregar cidades</option>';
			});
	});
}

// Cards de exemplo para cada coluna
const cards = {
	'col-edital': [],
	'col-inscricao': [],
	'col-preliminar': [],
	'col-calendario': [],
	'col-finais': []
};

// Mapeamento coluna <-> posição (1..5)
const colToPos = {
  'col-edital': 1,
  'col-inscricao': 2,
  'col-preliminar': 3,
  'col-calendario': 4,
  'col-finais': 5
};
const posToCol = Object.fromEntries(Object.entries(colToPos).map(([k,v])=>[v,k]));

let tempArquivoNome = '';

let cardIdCounter = 1;
let editingCard = null;

function renderCards(filter = '') {
	Object.keys(cards).forEach(colId => {
		const list = document.getElementById(colId);
		list.innerHTML = '';
		cards[colId].forEach(card => {
			if (!filter || card.text.toLowerCase().includes(filter.toLowerCase())) {
				const div = document.createElement('div');
				div.className = 'card';
				div.setAttribute('draggable', 'true');
				div.dataset.cardId = card.id;
				// Título principal
				const titulo = document.createElement('div');
				titulo.textContent = card.text;
				titulo.style.fontWeight = 'bold';
				div.appendChild(titulo);
				// Subtítulo (nome do arquivo)
				if (card.arquivoNome) {
					const subtitulo = document.createElement('div');
					subtitulo.textContent = card.arquivoNome;
					subtitulo.style.fontSize = '0.93rem';
					// Se status for 'submissao não aprovada', aplicar cores neutras
					if (card.status === 'submissao-nao-aprovada') {
						subtitulo.style.color = '#555';
					} else {
						subtitulo.style.color = '#ff9800';
					}
					subtitulo.style.marginTop = '2px';
					div.appendChild(subtitulo);
				}
				// Aplicar estilo do card conforme status
				if (card.status === 'submissao-nao-aprovada') {
					div.style.background = '#f2f2f2';
					div.style.color = '#555';
				}
				// Barra de progresso
				if (card.dataLancamento && card.dataEncerramento) {
					const progressDiv = document.createElement('div');
					progressDiv.className = 'progress-bar-wrap';
					// Cálculo do progresso
					const lanc = new Date(card.dataLancamento);
					const enc = new Date(card.dataEncerramento);
					const hoje = new Date();
					let percent = 0;
					if (hoje < lanc) {
						percent = 0;
					} else if (hoje > enc) {
						percent = 100;
					} else {
						percent = ((hoje - lanc) / (enc - lanc)) * 100;
						percent = Math.max(0, Math.min(100, percent));
					}
					// Função para formatar data como 'ddd - dd/mm'
					function formatarData(data) {
						const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
						const d = data.getDate().toString().padStart(2, '0');
						const m = (data.getMonth() + 1).toString().padStart(2, '0');
						return `${dias[data.getDay()]} - ${d}/${m}`;
					}
					// Label datas
					const labelDiv = document.createElement('div');
					labelDiv.className = 'progress-labels';
					labelDiv.innerHTML = `<span>${formatarData(lanc)}</span><span>${formatarData(enc)}</span>`;
					// Barra
					const barDiv = document.createElement('div');
					barDiv.className = 'progress-bar';
					const fillDiv = document.createElement('div');
					fillDiv.className = 'progress-bar-fill';
					fillDiv.style.width = percent + '%';
					barDiv.appendChild(fillDiv);
					progressDiv.appendChild(labelDiv);
					progressDiv.appendChild(barDiv);
					div.appendChild(progressDiv);
				}
				div.addEventListener('dragstart', handleDragStart);
				div.addEventListener('contextmenu', function(ev) {
					ev.preventDefault();
					showCardContextMenu(ev, card, colId);
				});
				div.addEventListener('click', function(e) {
					// Evita conflito com drag
					if (e.detail === 1) {
						openEditCardModal(card.id, colId);
					}
				});
				list.appendChild(div);
			}
		});
	});
}


// Modal Adicionar Edital

// Context menu for card actions (Excluir)
function removeCardContextMenu() {
	const existing = document.getElementById('cardContextMenu');
	if (existing) existing.remove();
}

function showCardContextMenu(e, card, colId) {
	removeCardContextMenu();
	const menu = document.createElement('div');
	menu.id = 'cardContextMenu';
	menu.style.position = 'fixed';
	menu.style.zIndex = 20000;
	menu.style.background = '#fff';
	menu.style.border = '1px solid #ddd';
	menu.style.borderRadius = '6px';
	menu.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)';
	menu.style.padding = '6px';
	const btn = document.createElement('div');
	btn.textContent = 'Excluir';
	btn.style.padding = '8px 12px';
	btn.style.cursor = 'pointer';
	btn.style.color = '#e53935';
	btn.addEventListener('click', async function(ev) {
		ev.stopPropagation();
		removeCardContextMenu();
		const conf = confirm('Confirma exclusão deste edital?');
		if (!conf) return;
		// Remove from UI and DB
		try {
			showLoading('Excluindo...');
			if (card.editalId) {
				const valores = await import('./valores.js');
				await valores.deleteEdital(card.editalId);
			}
			// remove from cards object
			const arr = cards[colId] || [];
			const idx = arr.findIndex(c => c.id === card.id);
			if (idx !== -1) arr.splice(idx,1);
			renderCards(searchInput.value);
		} catch (err) {
			alert('Erro ao excluir: ' + (err.message || err));
		} finally {
			hideLoading();
		}
	});
	menu.appendChild(btn);
	document.body.appendChild(menu);
	// position
	const x = e.clientX;
	const y = e.clientY;
	const rect = menu.getBoundingClientRect();
	let left = x;
	let top = y;
	if (left + rect.width > window.innerWidth) left = window.innerWidth - rect.width - 8;
	if (top + rect.height > window.innerHeight) top = window.innerHeight - rect.height - 8;
	menu.style.left = left + 'px';
	menu.style.top = top + 'px';
}

// hide menu on any click elsewhere
document.addEventListener('click', function(e) {
	removeCardContextMenu();
});

const openBtn = document.getElementById('openEditalBtn');
const modal = document.getElementById('modalEdital');
const closeBtn = document.getElementById('closeModal');
const formAddEdital = document.getElementById('formAddEdital');
const inputNomeEdital = document.getElementById('inputNomeEdital');
const inputStatusEdital = document.getElementById('inputStatusEdital');
const btnCancelarEdital = document.getElementById('btnCancelarEdital');
const inputArquivoEdital = document.getElementById('inputArquivoEdital');
const btnUploadArquivo = document.getElementById('btnUploadArquivo');
const nomeArquivoSelecionado = document.getElementById('nomeArquivoSelecionado');
const inputDataLancamento = document.getElementById('inputDataLancamento');
const inputDataEncerramento = document.getElementById('inputDataEncerramento');

openBtn.addEventListener('click', () => {
	editingCard = null;
	tempArquivoNome = '';
	modal.classList.add('show');
	formAddEdital.reset();
	nomeArquivoSelecionado.textContent = 'Nenhum arquivo selecionado';
	inputNomeEdital.focus();
	modal.querySelector('h2').textContent = 'Novo Edital';
});
closeBtn.addEventListener('click', () => {
	modal.classList.remove('show');
	editingCard = null;
});
btnCancelarEdital.addEventListener('click', () => {
	modal.classList.remove('show');
	editingCard = null;
});
window.addEventListener('click', (e) => {
	if (e.target === modal) {
		modal.classList.remove('show');
		editingCard = null;
	}
});

formAddEdital.addEventListener('submit', function(e) {
	e.preventDefault();
	const nome = inputNomeEdital.value.trim();
	const arquivoNome = tempArquivoNome;
	const dataLancamento = inputDataLancamento.value;
	const dataEncerramento = inputDataEncerramento.value;
	if (!nome) return;
	(async () => {
		const valores = await import('./valores.js');
		const collected = valores.collectFormAddEdital();
		const status = inputStatusEdital ? inputStatusEdital.value : '';
		if (editingCard) {
		// Editar card existente
		const { id, colId } = editingCard;
		const card = cards[colId].find(c => c.id === id);
		if (card) {
			card.text = nome;
			card.arquivoNome = arquivoNome;
			card.dataLancamento = dataLancamento;
			card.status = status;
			card.dataEncerramento = dataEncerramento;
			// merge collected into payload
			const editalId = card.editalId || valores.generateId();
			const payload = Object.assign({}, collected, { nomeEdital: nome, arquivoNome, dataLancamento, dataEncerramento, statusEdital: status, col: colId || 'col-edital' });
			await valores.saveEdital(editalId, payload);
			card.editalId = editalId;
			card.docPath = `editais/${editalId}`;
		}
			} else {
			// Novo card
				const editalId = valores.generateId();
				const payload = Object.assign({}, collected, { nomeEdital: nome, arquivoNome, dataLancamento, dataEncerramento, statusEdital: status, col: 'col-edital', posicao: 1 });
				await valores.saveEdital(editalId, payload);
				cards['col-edital'].push({
					id: cardIdCounter++,
					text: nome,
					arquivoNome,
					status,
					dataLancamento,
					dataEncerramento,
					editalId,
					docPath: `editais/${editalId}`,
					posicao: 1
				});
		}
		renderCards(searchInput.value);
		modal.classList.remove('show');
		editingCard = null;
		tempArquivoNome = '';
		return;
	})().catch(err => {
		hideLoading();
		alert('Erro ao salvar edital: ' + err.message);
	});
	// (handled asynchronously)
});

btnUploadArquivo.addEventListener('click', () => {
	inputArquivoEdital.click();
});
inputArquivoEdital.addEventListener('change', function() {
	if (this.files && this.files[0]) {
		tempArquivoNome = this.files[0].name;
		nomeArquivoSelecionado.textContent = this.files[0].name;
	} else {
		tempArquivoNome = '';
		nomeArquivoSelecionado.textContent = 'Nenhum arquivo selecionado';
	}
});

function openEditCardModal(cardId, colId) {
	editingCard = { id: cardId, colId };
	const card = cards[colId].find(c => c.id === cardId);
	if (card) {
		inputNomeEdital.value = card.text;
		if (inputStatusEdital) inputStatusEdital.value = card.status || '';
		tempArquivoNome = card.arquivoNome || '';
		nomeArquivoSelecionado.textContent = card.arquivoNome || 'Nenhum arquivo selecionado';
		inputArquivoEdital.value = '';
		inputDataLancamento.value = card.dataLancamento || '';
		inputDataEncerramento.value = card.dataEncerramento || '';
		modal.classList.add('show');
		inputNomeEdital.focus();
		modal.querySelector('h2').textContent = 'Editar Edital';
	}
}

// Busca
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', (e) => {
	renderCards(e.target.value);
});

// Drag and Drop para mover cards entre colunas
let draggedCardId = null;

function handleDragStart(e) {
	draggedCardId = e.target.dataset.cardId;
	e.dataTransfer.effectAllowed = 'move';
}

document.querySelectorAll('.card-list').forEach(list => {
	list.addEventListener('dragover', function(e) {
		e.preventDefault();
		this.style.background = '#ffe0b2';
	});
	list.addEventListener('dragleave', function() {
		this.style.background = '';
	});
	list.addEventListener('drop', async function(e) {
		e.preventDefault();
		this.style.background = '';
		if (draggedCardId) {
			await moveCardToColumn(parseInt(draggedCardId), this.id);
			draggedCardId = null;
		}
	});
});

async function moveCardToColumn(cardId, targetColId) {
 	// Remove de onde está
 	for (const col in cards) {
 		const idx = cards[col].findIndex(c => c.id === cardId);
 		if (idx !== -1) {
 			const [card] = cards[col].splice(idx, 1);
 			// atualizar posição numérica
 			card.posicao = colToPos[targetColId] || 1;
 			cards[targetColId].push(card);
 			// Persistir alteração de posição se houver vínculo com Firestore
 			if (card.editalId) {
 				try {
 					showLoading('');
 					const valores = await import('./valores.js');
 					await valores.updateEditalPosicao(card.editalId, card.posicao);
 				} catch (err) {
 					console.warn('Erro ao atualizar posicao:', err);
 				} finally {
 					hideLoading();
 				}
 			}
 			break;
 		}
 	}
 	renderCards(searchInput.value);
}

// Análise de aderência
const aderenciaChecks = document.querySelectorAll('.aderencia-check');
const aderenciaProgress = document.getElementById('aderencia-progress');
const aderenciaPercent = document.getElementById('aderencia-percent');
function updateAderenciaProgress() {
	const total = aderenciaChecks.length;
	const checked = document.querySelectorAll('.aderencia-check:checked').length;
	const percent = Math.round((checked / total) * 100);
	if (aderenciaProgress) aderenciaProgress.style.width = percent + '%';
	if (aderenciaPercent) aderenciaPercent.textContent = percent + '%';
}
if (aderenciaChecks.length > 0) {
	aderenciaChecks.forEach(check => {
		check.addEventListener('change', updateAderenciaProgress);
	});
	updateAderenciaProgress();
}

// Calendário de atividade
const btnAddLinhaCalendario = document.getElementById('btnAddLinhaCalendario');
const tbodyCalendario = document.getElementById('tbodyCalendario');
if (btnAddLinhaCalendario && tbodyCalendario) {
	btnAddLinhaCalendario.addEventListener('click', function() {
		const tr = document.createElement('tr');
		tr.innerHTML = `
			<td><select class="select-responsavel"></select></td>
			<td><textarea class="textarea-atividade" rows="1"></textarea></td>
			<td><input type="date" class="input-prazo"></td>
			<td><input type="checkbox" class="checkbox-check"></td>
		`;
		tbodyCalendario.appendChild(tr);
		// Atualizar selects de responsável
		const checked = customEquipeOptions.querySelectorAll('input[type="checkbox"]:checked');
		const responsaveis = Array.from(checked).map(cb => cb.value);
		const select = tr.querySelector('.select-responsavel');
		select.innerHTML = '<option value="">Selecione</option>';
		responsaveis.forEach(resp => {
			const opt = document.createElement('option');
			opt.value = resp;
			opt.textContent = resp;
			select.appendChild(opt);
		});
		// Adicionar listener para checkbox
		const checkbox = tr.querySelector('.checkbox-check');
		const textarea = tr.querySelector('.textarea-atividade');
		checkbox.addEventListener('change', function() {
			if (this.checked) {
				textarea.style.background = '#e8f5e8';
				this.style.background = '#4caf50';
			} else {
				textarea.style.background = '';
				this.style.background = '';
			}
		});
	});
}

// Status Edital - apenas uma opção selecionada
const statusChecks = document.querySelectorAll('.status-check');
if (statusChecks.length > 0) {
	statusChecks.forEach(check => {
		check.addEventListener('change', function() {
			if (this.checked) {
				statusChecks.forEach(other => {
					if (other !== this) {
						other.checked = false;
					}
				});
			}
		});
	});
}

// Inicialização: carregar editais persistidos e renderizar
async function initApp() {
	try {
		const valores = await import('./valores.js');
		const rows = await valores.listEditais();
		rows.forEach(item => {
			const pos = item.posicao || (item.col ? colToPos[item.col] : 1);
			const targetCol = posToCol[pos] || 'col-edital';
			if (!cards[targetCol]) cards[targetCol] = [];
			cards[targetCol].push({
				id: cardIdCounter++,
				text: item.nomeEdital || item.nome || 'Sem nome',
				arquivoNome: item.arquivoNome || '',
				dataLancamento: item.dataLancamento || '',
				dataEncerramento: item.dataEncerramento || '',
				status: item.statusEdital || item.status || '',
				editalId: item._id || item.editalId || '',
				docPath: item.docPath || `editais/${item._id || item.editalId}`,
				posicao: pos
			});
		});
	} catch (err) {
		console.warn('Erro ao carregar editais iniciais:', err.message || err);
	}
	renderCards();
}

initApp();

// Modal Colecao Edital
const btnBibliotecaSolucoes = document.getElementById('btnBibliotecaSolucoes');
const modalColecao = document.getElementById('modalColecaoEdital');
const closeModalColecao = document.getElementById('closeModalColecao');
if (btnBibliotecaSolucoes && modalColecao && closeModalColecao) {
	btnBibliotecaSolucoes.addEventListener('click', () => {
		modalColecao.classList.add('show');
	});
	closeModalColecao.addEventListener('click', () => {
		modalColecao.classList.remove('show');
	});
	window.addEventListener('click', (e) => {
		if (e.target === modalColecao) {
			modalColecao.classList.remove('show');
		}
	});
}

// ===== FIREBASE: Importação dinâmica para uso em browser =====
let db;
let fbModule;
async function loadFirebase() {
	if (!fbModule) {
		fbModule = await import('./banco.js');
		db = fbModule.db;
	}
	return fbModule;
}

// ===== LOADING SCREEN =====
function showLoading(msg = 'Carregando...') {
	let loading = document.getElementById('loadingOverlay');
	if (!loading) {
		loading = document.createElement('div');
		loading.id = 'loadingOverlay';
		loading.style.position = 'fixed';
		loading.style.top = 0;
		loading.style.left = 0;
		loading.style.width = '100vw';
		loading.style.height = '100vh';
		loading.style.background = 'rgba(255,152,0,0.18)';
		loading.style.display = 'flex';
		loading.style.alignItems = 'center';
		loading.style.justifyContent = 'center';
		loading.style.zIndex = 9999;
		loading.innerHTML = `<div style="background:#fff;padding:32px 48px;border-radius:16px;box-shadow:0 2px 24px #ff9800a0;font-size:1.3rem;color:#ff9800;font-weight:bold;display:flex;align-items:center;gap:16px;"><span class="loader" style="width:28px;height:28px;border:4px solid #ff9800;border-top:4px solid #fff;border-radius:50%;display:inline-block;animation:spin 1s linear infinite;"></span>${msg}</div>`;
		document.body.appendChild(loading);
		// CSS animation
		const style = document.createElement('style');
		style.innerHTML = `@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}`;
		loading.appendChild(style);
	} else {
		loading.style.display = 'flex';
	}
}
function hideLoading() {
	const loading = document.getElementById('loadingOverlay');
	if (loading) loading.style.display = 'none';
}

// Popup para exibir conteúdo de campos do mapeamento
function showFieldPopup(content, title = '') {
	let popup = document.getElementById('fieldPopup');
	if (!popup) {
		popup = document.createElement('div');
		popup.id = 'fieldPopup';
		popup.style.position = 'fixed';
		popup.style.top = 0;
		popup.style.left = 0;
		popup.style.width = '100vw';
		popup.style.height = '100vh';
		popup.style.background = 'rgba(0,0,0,0.18)';
		popup.style.display = 'flex';
		popup.style.alignItems = 'center';
		popup.style.justifyContent = 'center';
		popup.style.zIndex = 10001;
		popup.innerHTML = `<div style="background:#fff;padding:20px 22px;border-radius:12px;max-width:92vw;max-height:80vh;overflow:auto;box-shadow:0 8px 40px rgba(0,0,0,0.12);">
			<h3 id="fieldPopupTitle" style="margin:0 0 10px;color:#ff9800;font-size:1.05rem"></h3>
			<pre id="fieldPopupContent" style="white-space:pre-wrap;font-family:inherit;color:#333;margin:0 0 12px 0;"></pre>
			<div style="display:flex;gap:8px;justify-content:flex-end;">
				<button id="btnCopyField" style="background:#ff9800;color:#fff;border:none;padding:8px 12px;border-radius:8px;cursor:pointer;font-weight:600;">Copiar</button>
				<button id="btnCloseField" style="background:#eee;color:#333;border:none;padding:8px 12px;border-radius:8px;cursor:pointer;">Fechar</button>
			</div>
		</div>`;
		document.body.appendChild(popup);
		// Prevent background from scrolling while popup is open
		popup.dataset.prevBodyOverflow = document.body.style.overflow || '';
		popup.querySelector('#btnCloseField').onclick = () => {
			popup.style.display = 'none';
			document.body.style.overflow = popup.dataset.prevBodyOverflow || '';
		};
		popup.querySelector('#btnCopyField').onclick = async () => {
			try {
				await navigator.clipboard.writeText(popup.querySelector('#fieldPopupContent').innerText);
				alert('Copiado para área de transferência');
			} catch (e) {
				alert('Erro ao copiar');
			}
		};
	}
	// When showing (including reused popup) prevent body scroll so modal position doesn't change
	document.body.style.overflow = popup.dataset.prevBodyOverflow ? popup.dataset.prevBodyOverflow : 'hidden';
	popup.querySelector('#fieldPopupTitle').innerText = title;
	popup.querySelector('#fieldPopupContent').innerText = content;
	popup.style.display = 'flex';
}

// Listener para botões de mapeamento dentro do modal "Novo Edital"
document.querySelectorAll('#MapeamentoSolucao .btn-mapeamento').forEach(btn => {
	btn.addEventListener('click', async function() {
		const field = this.dataset.field;
		const title = this.textContent.trim();
		const select = document.querySelector('#modalEdital #inputPlataformaInscrita');
		const plataforma = select ? select.value : '';
		if (!plataforma) {
			showFieldPopup('Selecione a solução digital em "Plataforma Inscrita" antes de visualizar.', 'Nenhuma solução selecionada');
			return;
		}
		showLoading('Carregando...');
		const fb = await loadFirebase();
		try {
			const { doc, getDoc, collection } = fb;
			const ref = doc(collection(fb.db, 'solucoes'), plataforma);
			const snap = await getDoc(ref);
			if (!snap.exists()) {
				hideLoading();
				showFieldPopup(`Documento '${plataforma}' não encontrado. Você pode preencher os campos e salvar para criar o registro.`, 'Documento não encontrado');
				return;
			}
			const dados = snap.data();
			const content = (dados && dados[field] !== undefined && dados[field] !== null && dados[field] !== '') ? dados[field] : 'Campo não encontrado ou vazio.';
			hideLoading();
			showFieldPopup(content, title);
		} catch (err) {
			hideLoading();
			alert('Erro ao carregar campo: ' + err.message);
		}
	});
});

// ====== BIBLIOTECA DE SOLUÇÕES: SALVAR E CARREGAR FIRESTORE ======
const formColecaoEdital = document.getElementById('formColecaoEdital');
const inputPlataformaInscrita = document.querySelector('#modalColecaoEdital #inputPlataformaInscrita');
if (formColecaoEdital && inputPlataformaInscrita) {
	// Salvar no banco ao enviar
	formColecaoEdital.addEventListener('submit', async function(e) {
		e.preventDefault();
		const plataforma = inputPlataformaInscrita.value;
		if (!plataforma) {
			alert('Selecione uma solução digital!');
			return;
		}
		showLoading('Salvando...');
		const fb = await loadFirebase();
		try {
			const { doc, setDoc, collection } = fb;
			// Coleta todos os campos do form
			const data = {};
			Array.from(formColecaoEdital.elements).forEach(el => {
				if (el.name && (el.type !== 'submit' && el.type !== 'button')) {
					data[el.name] = el.value;
				}
			});
			// Salva na coleção 'solucoes', doc = plataforma (nome do documento = valor selecionado)
			await setDoc(doc(collection(fb.db, 'solucoes'), plataforma), data);
			hideLoading();
			alert('Salvo com sucesso!');
		} catch (err) {
			hideLoading();
			alert('Erro ao salvar: ' + err.message);
		}
	});

	// Carregar do banco ao selecionar
	inputPlataformaInscrita.addEventListener('change', async function() {
		const plataforma = this.value;
		if (!plataforma) return;
		showLoading('Carregando dados...');
		const fb = await loadFirebase();
		try {
			const { doc, getDoc, collection } = fb;
			const ref = doc(collection(fb.db, 'solucoes'), plataforma);
			const snap = await getDoc(ref);
			if (snap.exists()) {
				const dados = snap.data();
				// Preenche os campos do form
				Array.from(formColecaoEdital.elements).forEach(el => {
					if (el.name && dados[el.name] !== undefined) {
						el.value = dados[el.name];
					}
				});
			} else {
				// Não encontrei o documento — não alteramos o select para
				// que o usuário possa preencher os campos e salvar (criar/atualizar).
				hideLoading();
				showNotFoundPopup(plataforma);
				return;
			}
			hideLoading();

		// Popup para valor não encontrado
		function showNotFoundPopup(nome) {
			let popup = document.getElementById('notFoundPopup');
			if (!popup) {
				popup = document.createElement('div');
				popup.id = 'notFoundPopup';
				popup.style.position = 'fixed';
				popup.style.top = 0;
				popup.style.left = 0;
				popup.style.width = '100vw';
				popup.style.height = '100vh';
				popup.style.background = 'rgba(80,80,80,0.18)';
				popup.style.display = 'flex';
				popup.style.alignItems = 'center';
				popup.style.justifyContent = 'center';
				popup.style.zIndex = 10000;
				popup.innerHTML = `<div style="background:#fff;padding:32px 40px;border-radius:14px;box-shadow:0 2px 24px #ff9800a0;font-size:1.1rem;color:#ff9800;font-weight:600;display:flex;flex-direction:column;align-items:center;gap:18px;max-width:90vw;">
					<span>Nenhum valor encontrado para:<br><b>${nome}</b></span>
					<button id="btnOkNotFound" style="margin-top:8px;padding:8px 28px;font-size:1rem;background:#ff9800;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">OK</button>
				</div>`;
				document.body.appendChild(popup);
				popup.querySelector('#btnOkNotFound').onclick = () => {
					popup.style.display = 'none';
				};
			} else {
				popup.querySelector('span').innerHTML = `Nenhum valor encontrado para:<br><b>${nome}</b>`;
				popup.style.display = 'flex';
			}
		}
		} catch (err) {
			hideLoading();
			alert('Erro ao carregar: ' + err.message);
		}
	});
}
