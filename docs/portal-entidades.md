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

## Tabelas de apoio preparadas

O arquivo `database/portal_entities.sql` deixa prontas tabelas futuras para:

- `client_users`: varios usuarios por cliente.
- `conversation_messages`: conversa em formato de chat.
- `attachments`: anexos e links separados.
- `activity_logs`: historico administrativo.
