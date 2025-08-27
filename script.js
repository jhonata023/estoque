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
const linkAdicionarProduto = document.querySelector('#linkAdicionarProduto');
const linkVenderProduto = document.querySelector('#linkVenderProduto');
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

function maiuscula(str) {
    if (!str) return "";
    return str
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function salvarProduto(produto) {
    let estoque = JSON.parse(localStorage.getItem("entrada")) || [];
    
    produto.produto = produto.produto.toLowerCase();
    estoque.push(produto);
    localStorage.setItem("entrada", JSON.stringify(estoque));
}
function adicionarSaidas(produto) {
    let estoque = JSON.parse(localStorage.getItem("saida")) || [];
    
    estoque.push(produto);
    localStorage.setItem("saida", JSON.stringify(estoque));
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
    let entrada = JSON.parse(localStorage.getItem("entrada")) || [];
    let saida = JSON.parse(localStorage.getItem("saida")) || [];
    let estoqueAgrupado = {};
    let avisos = [];
    listaProdutos.innerHTML = "";

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
    Object.values(estoqueAgrupado).forEach(p => {
    if (tipoMaterial == p.classeMaterial) {
        if (p.quantidade < p.estMinimo) {
            // window.alert(`O estoque precisa de ${p.produto}`);
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
    if (avisos.length > 0) {
        Swal.fire({
            title: 'JM Materiais de contrução',
            html: avisos.join('<br>'),
            icon: 'warning',
            confirmButtonText: 'OK'
        });
    }
}
function carregarCompras() {
    const listaCompras = document.querySelector('#listaCompras');
    let entrada = JSON.parse(localStorage.getItem("entrada")) || [];
    listaInputProdutos.innerHTML = '';

    entrada.forEach(p => {
    if (!listaInputProdutos.innerHTML.includes(`<option value="${p.produto}"></option>`)) {
        listaInputProdutos.innerHTML += `<option value="${p.produto}"></option>`
    }
    listaCompras.innerHTML += `
        <div class="produto border-bottom text-center" style="display: grid; grid-template-columns: 17% 17% 25% 12% 12% 17%;">
        <p class="mb-2 mt-2">${maiuscula(p.produto)}</p>
        <p class="mb-2 mt-2">R$ ${Number(p.compra).toFixed(2)}</p>
        <p class="mb-2 mt-2">${p.fornecedor}</p>
        <p class="mb-2 mt-2">${p.quantidade}</p>
        <p class="mb-2 mt-2">${p.estMinimo}</p>
        <p class="mb-2 mt-2">R$ ${Number(p.venda).toFixed(2)}</p>
        </div>`;
    })
}
function carregarVendas() {
    const listaVendas = document.querySelector('#listaVendas');
    let saida = JSON.parse(localStorage.getItem("saida")) || [];
    saida.forEach(p => {
    listaVendas.innerHTML += `
        <div class="produto border-bottom text-center" style="display: grid; grid-template-columns: 20% 20% 12% 20% 28%;">
        <p class="mb-2 mt-2">${maiuscula(p.produto)}</p>
        <p class="mb-2 mt-2">${p.cliente}</p>
        <p class="mb-2 mt-2">${p.quantidade}</p>
        <p class="mb-2 mt-2">R$ ${Number(p.venda).toFixed(2)}</p>
        <p class="mb-2 mt-2">${p.dataVenda}</p>
        </div>`;
    })
}
function formEntrada() {
    const inputEstMin = document.querySelector('#inputEstMin');
    const inputProduto = document.querySelector('#inputProduto');
    const entradas = JSON.parse(localStorage.getItem("entrada")) || [];

    entradas.forEach(entrada => {
        if (entrada.produto == inputProduto.value) inputEstMin.value = entrada.estMinimo;
    })
}

document.addEventListener("DOMContentLoaded", carregarProdutosNoSelect);
carregarEstoque('eletricos');
carregarCompras();
carregarVendas();

fecharPopup.addEventListener('click', () => {
    popup.classList.add('d-none');
    popup.classList.remove('d-flex');
    formNovaVenda.reset();
    formNovoProduto.reset();
});

linkAdicionarProduto.addEventListener('click', () => {
    popup.classList.toggle('d-flex');
    divVenderProduto.classList.add('d-none');
    divAdicionarProduto.classList.remove('d-none');
});
linkVenderProduto.addEventListener('click', () => {
    popup.classList.toggle('d-flex');
    divVenderProduto.classList.remove('d-none');
    divAdicionarProduto.classList.add('d-none');
});
linkListaCompras.addEventListener('click', () => {
    vendas.classList.add('d-none');
    compras.classList.remove('d-none');
    listaEstoque.classList.add('d-none');
})
linkListaVendas.addEventListener('click', () => {
    vendas.classList.remove('d-none');
    compras.classList.add('d-none');
    listaEstoque.classList.add('d-none');
})
linkListaEstoque.addEventListener('click', () => {
    vendas.classList.add('d-none');
    compras.classList.add('d-none');
    listaEstoque.classList.remove('d-none');
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
    adicionarSaidas(dados);
})

filtroEstoque.addEventListener('click', e => {
    carregarEstoque(e.target.value);
})
