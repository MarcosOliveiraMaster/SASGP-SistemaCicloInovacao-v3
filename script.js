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
					subtitulo.style.color = '#ff9800';
					subtitulo.style.marginTop = '2px';
					div.appendChild(subtitulo);
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

const openBtn = document.getElementById('openEditalBtn');
const modal = document.getElementById('modalEdital');
const closeBtn = document.getElementById('closeModal');
const formAddEdital = document.getElementById('formAddEdital');
const inputNomeEdital = document.getElementById('inputNomeEdital');
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
	if (editingCard) {
		// Editar card existente
		const { id, colId } = editingCard;
		const card = cards[colId].find(c => c.id === id);
		if (card) {
			card.text = nome;
			card.arquivoNome = arquivoNome;
			card.dataLancamento = dataLancamento;
			card.dataEncerramento = dataEncerramento;
		}
	} else {
		// Novo card
		cards['col-edital'].push({
			id: cardIdCounter++,
			text: nome,
			arquivoNome,
			dataLancamento,
			dataEncerramento
		});
	}
	renderCards(searchInput.value);
	modal.classList.remove('show');
	editingCard = null;
	tempArquivoNome = '';
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
	list.addEventListener('drop', function(e) {
		e.preventDefault();
		this.style.background = '';
		if (draggedCardId) {
			moveCardToColumn(parseInt(draggedCardId), this.id);
			draggedCardId = null;
		}
	});
});

function moveCardToColumn(cardId, targetColId) {
	// Remove de onde está
	for (const col in cards) {
		const idx = cards[col].findIndex(c => c.id === cardId);
		if (idx !== -1) {
			const [card] = cards[col].splice(idx, 1);
			cards[targetColId].push(card);
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

// Inicialização
renderCards();

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
