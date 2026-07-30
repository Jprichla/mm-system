# Admin — “Visualizar como” outros perfis

## Objetivo

Permitir que somente um administrador simule visualmente a interface dos perfis Gestor, Engenheiro, Usuário e Cliente sem sair da conta e sem alterar suas permissões reais no backend.

## Escopo

O recurso é uma pré-visualização da interface. Ele controla menus, rotas visíveis e botões apresentados no frontend. O token, a identidade autenticada, o acesso aos dados e as permissões validadas pela API continuam sendo os do administrador.

Não fazem parte deste recurso:

- impersonar um usuário real;
- trocar ou emitir tokens;
- enviar o perfil simulado ao backend;
- reproduzir filtros de dados específicos de outro usuário ou empresa;
- conceder o recurso a Gestor ou a qualquer perfil não administrativo.

## Estado da autenticação

O frontend manterá separadamente:

- `usuario`: identidade real retornada pela API;
- `roleVisualizado`: perfil opcional usado somente para apresentação e permissões da interface.

O perfil efetivo da interface será `roleVisualizado ?? usuario.role`. A simulação só poderá permanecer ativa quando `usuario.role === 'admin'`. Qualquer valor armazenado por um usuário não administrador será ignorado e removido.

O perfil visual será persistido no armazenamento local para sobreviver a atualizações da página. O logout removerá tanto o token quanto a simulação.

## Interface

O cabeçalho exibirá ao Admin um controle “Visualizar como” com:

- Admin;
- Gestor;
- Engenheiro;
- Usuário;
- Cliente.

Ao selecionar um perfil inferior, a aplicação exibirá uma faixa persistente e destacada informando:

> Modo de visualização: Engenheiro. Sua conta continua sendo Admin.

A faixa terá a ação “Voltar ao Admin”. Em telas pequenas, o seletor ficará dentro da navegação móvel para preservar o espaço do cabeçalho.

Gestor, Engenheiro, Usuário e Cliente não verão o seletor nem a faixa.

## Permissões e navegação

O hook de permissões usará o perfil visual efetivo para decidir quais menus, rotas e ações aparecem. Os componentes que precisam saber se a conta real é administrativa usarão uma verificação separada.

Durante uma simulação:

- páginas e ações exclusivas do Admin ficam ocultas;
- a administração de usuários não aparece;
- os menus e controles seguem a hierarquia do perfil escolhido;
- chamadas HTTP continuam autenticadas como Admin;
- o backend continua sendo a autoridade final de segurança.

A simulação não promete reproduzir restrições de dados por empresa ou por associação a projetos, pois o backend ainda recebe a identidade real do Admin.

## Proteções

- Validar o perfil persistido contra a lista fechada de perfis permitidos.
- Ativar a simulação somente quando a identidade real for Admin.
- Limpar a simulação no logout.
- Não incluir o perfil visualizado em headers, parâmetros ou payloads.
- Manter uma indicação visual permanente enquanto o modo estiver ativo.
- Separar explicitamente `isAdminReal` de verificações baseadas no perfil visual.

## Tratamento de estados

- Um valor inválido ou corrompido no armazenamento será descartado.
- Se o carregamento do perfil revelar que a conta não é Admin, a simulação será removida.
- Se uma rota deixar de ser permitida ao trocar o perfil visual, a interface redirecionará para a primeira rota disponível desse perfil.
- Voltar ao Admin restaurará imediatamente menus, páginas e ações administrativas.

## Testes

Cobertura prevista:

- Admin pode selecionar todos os cinco perfis.
- Cada perfil apresenta os menus, rotas e botões esperados.
- A simulação persiste após atualizar a página.
- “Voltar ao Admin” restaura a interface.
- Logout remove a simulação.
- Usuários não administradores não veem o recurso.
- Um não administrador não consegue ativá-lo manipulando o armazenamento local.
- O token e as requisições HTTP não mudam durante a simulação.
- Troca de perfil funciona nos temas claro e escuro.
- Cabeçalho e navegação continuam organizados em desktop e dispositivos móveis.

## Critérios de aceite

1. Somente a conta real Admin consegue ativar “Visualizar como”.
2. A interface reproduz a visibilidade do perfil selecionado sem novo login.
3. Uma faixa informa permanentemente que a simulação está ativa.
4. O Admin consegue retornar ao perfil real com uma ação.
5. Nenhuma mudança de identidade ou autorização ocorre no backend.
6. Atualização da página preserva a simulação; logout a remove.
7. Usuários não administradores não conseguem ativar a função pela interface nem pelo armazenamento local.
