# Alinhamento do controle “Visualizar como”

## Objetivo

Alinhar o controle de simulação de perfil aos demais controles do cabeçalho no desktop, sem alterar seu comportamento, segurança ou apresentação móvel.

## Desktop

O controle será uma única cápsula horizontal com o texto e o valor no mesmo elemento visual:

`Visualizar como: Admin ▾`

O rótulo continuará semanticamente associado ao `<select>`, mas não ocupará uma linha própria. Altura, borda, foco, tipografia e espaçamento seguirão os controles Tema e Sair. O seletor continuará disponível somente para uma conta real Admin.

## Mobile

Dentro da navegação móvel, o formato atual será preservado: rótulo acima e seletor ocupando a largura disponível. Isso mantém clareza e área de toque sem apertar o menu.

## Responsividade e acessibilidade

- Desktop e mobile serão diferenciados pela prop `variant` existente.
- O nome acessível continuará sendo “Visualizar como”.
- Não haverá mudança no teclado, nas opções de perfil ou na persistência.
- O cabeçalho não ganhará overflow horizontal.
- Temas claro e escuro manterão contraste e foco já verificados.

## Testes

- Desktop renderiza rótulo e seletor na mesma cápsula horizontal.
- Mobile mantém o rótulo empilhado.
- Seleção e retorno ao Admin continuam funcionando.
- Verificação visual em desktop, 320px, claro e escuro.
- Suíte, contraste, lint e build permanecem aprovados.
