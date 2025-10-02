if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/estoque/sw.js')
      .then(registration => {
          console.log('Service Worker registrado com sucesso:', registration.scope);
      })
      .catch(error => {
          console.error('Falha ao registrar o Service Worker:', error);
      });
}

const popup = document.querySelector('#popup');
const fecharPopup = document.querySelector('#fecharPopup');
const linkGestao = document.querySelector('#linkGestao');
const linkHome = document.querySelector('#linkHome');
const divAdicionarProduto = document.querySelector('#divAdicionarProduto');
const divVenderProduto = document.querySelector('#divVenderProduto');
const formNovoProduto = document.querySelector('#formNovoProduto');
const listaProdutos = document.querySelector('#lista');
const listaEstoque = document.querySelector('#listaEstoque');
const formNovaVenda = document.querySelector('#formNovaVenda');
const linkListaCompras = document.querySelector('#linkListaCompras');
const linkListaVendas = document.querySelector('#linkListaVendas');
const linkListaEstoque = document.querySelector('#linkListaEstoque');
const vendas = document.querySelector('#vendas');
const compras = document.querySelector('#compras')
const filtroEstoque = document.querySelector('#filtroEstoque');
const listaInputProdutos = document.querySelector('#listaInputProdutos');
const listaInputEstMin = document.querySelector('#listaInputEstMin');
const optionCompra = document.querySelector('#optionCompra');
const optionVenda = document.querySelector('#optionVenda');
let estoqueAgrupado = {};
let avisosTrue = 0;

function maiuscula(str) {
    if (!str) return "";
    return str
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
function calcularEstoque() {
    let entrada = JSON.parse(localStorage.getItem("entrada")) || [];
    let saida = JSON.parse(localStorage.getItem("saida")) || [];
    estoqueAgrupado = {};

    entrada.forEach(p => {
    if (estoqueAgrupado[p.produto]) {
        estoqueAgrupado[p.produto].compra = (((Number(estoqueAgrupado[p.produto].compra) * Number(estoqueAgrupado[p.produto].quantidade)) + (Number(p.compra) * Number(p.quantidade)))
        / (Number(estoqueAgrupado[p.produto].quantidade) + Number(p.quantidade))).toFixed(2);
        estoqueAgrupado[p.produto].quantidade += Number(p.quantidade);
        estoqueAgrupado[p.produto].estMinimo = p.estMinimo;
    } else {
        estoqueAgrupado[p.produto] = { ...p, quantidade: Number(p.quantidade) };
    }
    });

    saida.forEach(ps => {
        if (estoqueAgrupado[ps.produto]) {
            estoqueAgrupado[ps.produto].quantidade -= Number(ps.quantidade);
        }
    })
}

function salvarProduto(produto) {
    let estoque = JSON.parse(localStorage.getItem("entrada")) || [];
    
    produto.produto = produto.produto.toLowerCase();
    produto.id = Date.now();
    estoque.push(produto);
    localStorage.setItem("entrada", JSON.stringify(estoque));
}
function adicionarSaidas(produto) {
    let estoque = JSON.parse(localStorage.getItem("saida")) || [];
    produto.id = Date.now();
    estoque.push(produto);
    localStorage.setItem("saida", JSON.stringify(estoque));
}

function clickLancamento (elemento) {
    elemento.children[1].classList.toggle('d-flex');
    elemento.children[0].classList.toggle('d-none');
}
function clickExcluir(elemento, operacao) {
    let entrada = JSON.parse(localStorage.getItem("entrada")) || [];
    let saida = JSON.parse(localStorage.getItem("saida")) || [];
    const divProduto = elemento.closest('.produto');
    const id = divProduto.dataset.id;
    
    if (operacao == 'compras') {
        entrada = entrada.filter(p => p.id != id);
        localStorage.setItem('entrada', JSON.stringify(entrada));
        carregarCompras();
    }
    else if (operacao == 'vendas')  {
        saida = saida.filter(p => p.id != id);
        localStorage.setItem('saida', JSON.stringify(saida));
        carregarVendas();
    }

    carregarEstoque();
}

function carregarProdutosNoSelect() {
    let estoque = JSON.parse(localStorage.getItem("entrada")) || [];

    let select = document.querySelector("#selectProduto");
    select.innerHTML = '<option value="">Selecione um produto</option>';

    estoque.forEach(produto => {
        let option = document.createElement("option");
        option.value = produto.produto;
        option.textContent = maiuscula(produto.produto);
        if (!select.innerHTML.includes(`<option value="${produto.produto}">${maiuscula(produto.produto)}</option>`)) select.appendChild(option);
    });
}
function carregarEstoque(tipoMaterial) {
    let avisos = [];
    listaProdutos.innerHTML = "";

    calcularEstoque();
    document.querySelector('#qtdItens').innerText = Object.values(estoqueAgrupado).length;
    
    Object.values(estoqueAgrupado).forEach(p => {
    if (tipoMaterial == p.classeMaterial) {
        if (p.quantidade < p.estMinimo) {
            avisos.push(`⚠️ O estoque precisa de ${p.produto}`);
            listaProdutos.innerHTML += `
                <div class="bg-danger produto border-bottom text-center rounded" style="display: grid; grid-template-columns: 20% 20% 20% 20% 20%;">
                <p class="mb-2 mt-2">${maiuscula(p.produto)}</p>
                <p class="mb-2 mt-2">R$ ${Number(p.compra).toFixed(2)}</p>
                <p class="mb-2 mt-2">${p.quantidade}</p>
                <p class="mb-2 mt-2">${p.estMinimo}</p>
                <p class="mb-2 mt-2">R$ ${Number(p.venda).toFixed(2)}</p>
                </div>`;
        } else {
            listaProdutos.innerHTML += `
                <div class="produto border-bottom text-center" style="display: grid; grid-template-columns: 20% 20% 20% 20% 20%;">
                <p class="mb-2 mt-2">${maiuscula(p.produto)}</p>
                <p class="mb-2 mt-2">R$ ${Number(p.compra).toFixed(2)}</p>
                <p class="mb-2 mt-2">${p.quantidade}</p>
                <p class="mb-2 mt-2">${p.estMinimo}</p>
                <p class="mb-2 mt-2">R$ ${Number(p.venda).toFixed(2)}</p>
                </div>`;
        }
    }
    })
    if (avisosTrue < 1) {
        if (avisos.length > 0) {
            Swal.fire({
                title: 'JM Materiais de contrução',
                html: avisos.join('<br>'),
                icon: 'warning',
                confirmButtonText: 'OK'
            });
        }
    }
    avisosTrue += 1;
    carregarProdutosNoSelect();
}
function carregarCompras() {
    const listaCompras = document.querySelector('#listaCompras');
    let entrada = JSON.parse(localStorage.getItem("entrada")) || [];
    listaInputProdutos.innerHTML = '';
    listaCompras.innerHTML = '';
    let valorVendas = 0;
    let vendasUMes = 0;

    entrada.forEach(p => {
        const date = new Date();
        if (p.dataCompra.slice(5,7) == date.getMonth() + 1) {
            vendasUMes += Number(p.compra) * p.quantidade;
        }
        valorVendas += Number(p.compra) * p.quantidade;
        if (!listaInputProdutos.innerHTML.includes(`<option value="${p.produto}"></option>`)) {
            listaInputProdutos.innerHTML += `<option value="${p.produto}"></option>`
        }
        listaCompras.innerHTML += `
            <div class="produto border-bottom" data-id="${p.id}" onclick="clickLancamento(this)">
                <div class="text-center" style="display: grid; grid-template-columns: 17% 17% 25% 12% 12% 17%;">
                    <p class="mb-2 mt-2">${maiuscula(p.produto)}</p>
                    <p class="mb-2 mt-2">R$ ${Number(p.compra).toFixed(2)}</p>
                    <p class="mb-2 mt-2">${p.fornecedor}</p>
                    <p class="mb-2 mt-2">${p.quantidade}</p>
                    <p class="mb-2 mt-2">${p.estMinimo}</p>
                    <p class="mb-2 mt-2">R$ ${Number(p.venda).toFixed(2)}</p>
                </div>
                <div class="d-none justify-content-around">
                    <p class="bg-danger m-2 pl-2 pr-2 rounded" onclick="clickExcluir(this, 'compras')">Excluir</p>
                </div>
            </div>`;
    })

    document.querySelector('#valorAplicado').innerText = `${valorVendas}`;
    document.querySelector('#centavosValorAplicado').innerText = `,${valorVendas.toFixed(2).slice(4)}`;

    document.querySelector('#valorAplicadoUMes').innerText = `${vendasUMes}`;
    document.querySelector('#centavosValorAplicadoUMes').innerText = `,${vendasUMes.toFixed(2).slice(4)}`;
}
function carregarVendas() {
    const listaVendas = document.querySelector('#listaVendas');
    let saida = JSON.parse(localStorage.getItem("saida")) || [];
    listaVendas.innerHTML = '';
    let valorRecebido = 0;
    let recebidoUMes = 0;

    saida.forEach(p => {
    const date = new Date();
    if (p.dataVenda.slice(5,7) == date.getMonth() + 1) {
        recebidoUMes += Number(p.venda) * p.quantidade;
    }

    valorRecebido += Number(p.venda) * p.quantidade;
    listaVendas.innerHTML += `
    <div class="produto border-bottom" data-id="${p.id}" onclick="clickLancamento(this)">
        <div class="text-center" style="display: grid; grid-template-columns: 20% 20% 12% 20% 28%;">
            <p class="mb-2 mt-2">${maiuscula(p.produto)}</p>
            <p class="mb-2 mt-2">${p.cliente}</p>
            <p class="mb-2 mt-2">${p.quantidade}</p>
            <p class="mb-2 mt-2">R$ ${Number(p.venda).toFixed(2)}</p>
            <p class="mb-2 mt-2">${p.dataVenda}</p>
        </div>
        <div class="d-none justify-content-around">
            <p class="bg-danger m-2 pl-2 pr-2 rounded" onclick="clickExcluir(this, 'vendas')">Excluir</p>
        </div>
    </div>`;
    })

    document.querySelector('#valorRecebido').innerText = `${valorRecebido}`;
    document.querySelector('#centavosValorRecebido').innerText = `,${valorRecebido.toFixed(2).slice(4)}`;

    document.querySelector('#valorRecebidoUMes').innerText = `${recebidoUMes}`;
    document.querySelector('#centavosValorRecebidoUMes').innerText = `,${recebidoUMes.toFixed(2).slice(4)}`;
}
function formEntrada() {
    const inputEstMin = document.querySelector('#inputEstMin');
    const inputProduto = document.querySelector('#inputProduto');
    const entradas = JSON.parse(localStorage.getItem("entrada")) || [];

    entradas.forEach(entrada => {
        if (entrada.produto == inputProduto.value) inputEstMin.value = entrada.estMinimo;
    })
}
function formSaida(el) {
    let selectProduto = document.querySelector('#selectProduto');
    calcularEstoque();

    Object.values(estoqueAgrupado).forEach(p => {
        if (selectProduto.value == p.produto) {
            if (p.quantidade < el.value) el.value = p.quantidade;
        }
    })
}

carregarEstoque('eletricos');
carregarCompras();
carregarVendas();

fecharPopup.addEventListener('click', () => {
    popup.classList.add('d-none');
    popup.classList.remove('d-flex');
    formNovaVenda.reset();
    formNovoProduto.reset();
});

linkHome.addEventListener('click', () => {
    document.querySelector('#home').classList.remove('d-none');
    vendas.classList.add('d-none');
    compras.classList.add('d-none');
    listaEstoque.classList.add('d-none');
});
linkGestao.addEventListener('click', () => {
    popup.classList.toggle('d-flex');
    divVenderProduto.classList.add('d-none');
    divAdicionarProduto.classList.remove('d-none');
});
optionCompra.addEventListener('click', () => {
    optionCompra.parentNode.classList.add('active');
    optionVenda.parentNode.classList.remove('active');
    divVenderProduto.classList.add('d-none');
    divAdicionarProduto.classList.remove('d-none');
})
optionVenda.addEventListener('click', () => {
    optionCompra.parentNode.classList.remove('active');
    optionVenda.parentNode.classList.add('active');
    divVenderProduto.classList.remove('d-none');
    divAdicionarProduto.classList.add('d-none');
})
linkListaCompras.addEventListener('click', () => {
    vendas.classList.add('d-none');
    compras.classList.remove('d-none');
    listaEstoque.classList.add('d-none');
    document.querySelector('#home').classList.add('d-none');
})
linkListaVendas.addEventListener('click', () => {
    vendas.classList.remove('d-none');
    compras.classList.add('d-none');
    listaEstoque.classList.add('d-none');
    document.querySelector('#home').classList.add('d-none');
})
linkListaEstoque.addEventListener('click', () => {
    vendas.classList.add('d-none');
    compras.classList.add('d-none');
    listaEstoque.classList.remove('d-none');
    document.querySelector('#home').classList.add('d-none');
})
formNovoProduto.addEventListener('submit', e => {
    const dados = Object.fromEntries(new FormData(formNovoProduto));
    dados.compra = parseFloat(dados.compra.replace(',','.')).toFixed(2);
    dados.venda = parseFloat(dados.venda.replace(',','.')).toFixed(2);
    salvarProduto(dados);
})
formNovaVenda.addEventListener('submit', e => {
    const dados = Object.fromEntries(new FormData(formNovaVenda));
    dados.venda = parseFloat(dados.venda.replace(',','.')).toFixed(2);

    if (dados.produto != '') adicionarSaidas(dados);
})

filtroEstoque.addEventListener('click', e => {
    carregarEstoque(e.target.value);
})
