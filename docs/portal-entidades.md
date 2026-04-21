# Portal InovaScript - Entidades

## Entidades usadas agora

- `profiles`: usuario logado, com papel `admin` ou `cliente`.
- `clients`: empresa/cliente atendido.
- `projects`: servico/projeto contratado pelo cliente.
- `project_steps`: etapas do cronograma do servico.
- `project_updates`: atualizacoes publicadas para o cliente.
- `feedbacks`: conversa simples entre cliente e InovaScript.

## Nomes de negocio na tela

- Cliente: registro em `clients`.
- Servico/Projeto: registro em `projects`.
- Cronograma: registros em `project_steps`.
- Atualizacoes: registros em `project_updates`.
- Conversa: registros em `feedbacks`.

## O que o admin alimenta

- Cliente e acesso: empresa, responsavel, e-mail, telefone e senha inicial.
- Servico/Projeto: nome, descricao, status, percentual, previsao e links.
- Cronograma: etapas, status, percentual, ordem, data prevista e justificativa.
- Atualizacoes: titulo, descricao, link/anexo e visibilidade para cliente.
- Conversa: respostas aos feedbacks do cliente e status da solicitacao.

## Controles de acesso

- Cliente esqueceu a senha: usa "Esqueci minha senha" no site ou no portal e recebe o link do Supabase.
- Admin precisa trocar a senha: seleciona o cliente no painel e usa "Redefinir senha".
- Para a troca manual funcionar na Vercel, a API precisa das variaveis `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.

## Controle de servicos

- "Apagar servico do portal" faz exclusao segura: o registro fica com `ativo = false`.
- O cliente nao ve servicos inativos, mas o historico fica preservado para auditoria.

## Tabelas de apoio preparadas

O arquivo `database/portal_entities.sql` deixa prontas tabelas futuras para:

- `client_users`: varios usuarios por cliente.
- `conversation_messages`: conversa em formato de chat.
- `attachments`: anexos e links separados.
- `activity_logs`: historico administrativo.
