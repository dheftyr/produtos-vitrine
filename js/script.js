const API = 'https://dummyjson.com/products';

const form = document.querySelector('#form-produto');
const lista = document.querySelector('#lista-produtos');
const mensagem = document.querySelector('#mensagem');
const idInput = document.querySelector('#produto-id');
const tituloForm = document.querySelector('#titulo-formulario');
const botaoSalvar = document.querySelector('#btn-salvar');
const botaoCancelar = document.querySelector('#btn-cancelar');

let produtos = [];

function mostrarMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.style.color = erro ? '#b83232' : '#247044';
}

function dinheiro(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

async function listarProdutos() {
  try {
    mostrarMensagem('Carregando produtos...');
    const resposta = await axios.get(API);
    produtos = resposta.data.products;
    desenharProdutos();
    mostrarMensagem('Produtos carregados com sucesso.');
  } catch (erro) {
    console.error(erro);
    lista.innerHTML = '<p>Não foi possível carregar os produtos.</p>';
    mostrarMensagem('Erro ao conectar com a API. Verifique sua internet e tente novamente.', true);
  }
}

function desenharProdutos() {
  lista.innerHTML = '';
  if (produtos.length === 0) {
    lista.innerHTML = '<p>Nenhum produto encontrado.</p>';
    return;
  }

  produtos.forEach(produto => {
    const card = document.createElement('article');
    card.className = 'produto';

    const imagem = document.createElement('img');
    imagem.src = produto.thumbnail || 'https://placehold.co/300x200?text=Sem+imagem';
    imagem.alt = produto.title;
    imagem.onerror = () => { imagem.src = 'https://placehold.co/300x200?text=Sem+imagem'; };

    const nome = document.createElement('h3');
    nome.textContent = produto.title;
    const descricao = document.createElement('p');
    descricao.textContent = produto.description;
    const categoria = document.createElement('p');
    categoria.textContent = 'Categoria: ' + produto.category;
    const preco = document.createElement('p');
    preco.className = 'preco';
    preco.textContent = dinheiro(produto.price);

    const acoes = document.createElement('div');
    acoes.className = 'acoes';
    const editar = document.createElement('button');
    editar.textContent = 'Alterar';
    editar.addEventListener('click', () => prepararEdicao(produto.id));
    const excluir = document.createElement('button');
    excluir.textContent = 'Excluir';
    excluir.className = 'excluir';
    excluir.addEventListener('click', () => excluirProduto(produto.id));

    acoes.append(editar, excluir);
    card.append(imagem, nome, descricao, categoria, preco, acoes);
    lista.appendChild(card);
  });
}

function prepararEdicao(id) {
  const produto = produtos.find(item => item.id === id);
  if (!produto) return;

  idInput.value = produto.id;
  document.querySelector('#title').value = produto.title;
  document.querySelector('#description').value = produto.description;
  document.querySelector('#category').value = produto.category;
  document.querySelector('#price').value = produto.price;
  document.querySelector('#thumbnail').value = produto.thumbnail || '';
  tituloForm.textContent = 'Alterar produto';
  botaoSalvar.textContent = 'Salvar alteração';
  botaoCancelar.classList.remove('escondido');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function limparFormulario() {
  form.reset();
  idInput.value = '';
  tituloForm.textContent = 'Cadastrar produto';
  botaoSalvar.textContent = 'Cadastrar';
  botaoCancelar.classList.add('escondido');
}

botaoCancelar.addEventListener('click', limparFormulario);

form.addEventListener('submit', async event => {
  event.preventDefault();

  const dados = {
    title: document.querySelector('#title').value.trim(),
    description: document.querySelector('#description').value.trim(),
    category: document.querySelector('#category').value.trim(),
    price: Number(document.querySelector('#price').value),
    thumbnail: document.querySelector('#thumbnail').value.trim()
  };

  if (!dados.title || !dados.description || !dados.category || dados.price < 0) {
    mostrarMensagem('Preencha os campos corretamente.', true);
    return;
  }

  try {
    const id = idInput.value;
    if (id) {
      const resposta = await axios.put(`${API}/${id}`, dados);
      produtos = produtos.map(item => item.id === Number(id) ? { ...item, ...resposta.data } : item);
      mostrarMensagem('Produto alterado. (A API de demonstração não salva alterações permanentemente.)');
    } else {
      const resposta = await axios.post(`${API}/add`, dados);
      produtos.unshift({ ...resposta.data, id: resposta.data.id || Date.now() });
      mostrarMensagem('Produto cadastrado. (A API de demonstração não salva o cadastro permanentemente.)');
    }
    desenharProdutos();
    limparFormulario();
  } catch (erro) {
    console.error(erro);
    mostrarMensagem('Não foi possível salvar o produto. Tente novamente.', true);
  }
});

async function excluirProduto(id) {
  if (!confirm('Deseja realmente excluir este produto?')) return;

  try {
    await axios.delete(`${API}/${id}`);
    produtos = produtos.filter(item => item.id !== id);
    desenharProdutos();
    mostrarMensagem('Produto excluído da lista. (A API de demonstração não altera os dados permanentemente.)');
  } catch (erro) {
    console.error(erro);
    mostrarMensagem('Não foi possível excluir o produto. Tente novamente.', true);
  }
}

listarProdutos();
