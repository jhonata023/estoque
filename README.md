# Projeto de Controle de Estoque para JM Elétrica
## Controle de estoque simples para uma loja elétrica

Projeto inicialmente desenvolvido com JS puro, com intuito de resolver problemas simples se gestão de estoque, portanto não contaremos com um servidor. Usaremos o localStorage para armazenar os dados.

Como a idealização deste projeto é uma resolução rápida para um problema, contaremos também com somente uma página html, senda cada aba uma div diferente, sendo ocultada ou exibida a depender do contexto, dando a impressão de mudança de página.

## Funcionamento do projeto

- É possível inserir itens ao estoque. Caso produto já esteja cadastrado, o input irá sugerir o mesmo nome.
- Objetos com o mesmo nome, se somarão e aparecerá somente um resultado na aba "Estoque", exibindo o número correto do estoque.
- Cada venda ou compra de materiais, será cadastrada como um objeto, que poderão ser consultados nas respectivas abas, possibilitando o usuário excluí-los a qualquer momento.
- Somente será possível o usuário realizar a venda de um produto que ele tenha em estoque, para evitar qualquer erro de logística.
- Por segurança, o código mudará a quantidade do produto nas vendas, caso ultrapasse o valor em estoque.
- Existe um campo de estoque mínimo. Ao cadastrar um produto novamente, este campo irá autopreencher com o valor do último objeto com este nome.
- Considerando o último objeto, o sistema irá conferir o estoque mínimo com o atual. Caso o estoque esteja abaixo, será exibida uma mensagem na tela para repor estoque.
