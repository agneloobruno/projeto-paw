Projeto PAW

Aplicação simples de catálogo de filmes (Express + EJS).

## Pré-requisitos

- Node.js (recomendo Node 16+)
- MySQL (servidor em execução)

## Instalação

1. Clone o repositório e entre na pasta do projeto.

2. Instale dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente copiando o arquivo de exemplo:

```bash
cp .env.example .env
# edite .env para ajustar DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, SESSION_SECRET e PORT
```

Obs.: A aplicação usa `OMDB_API_KEY` opcional (algumas funcionalidades podem usar a API OMDB). Para log de debug, o app verifica a presença dessa variável.

## Banco de dados

Opções para preparar o banco de dados:

- Usando o script incluído (usa a configuração de `config/db.js` e as variáveis no `.env`):

```bash
npm run db:init
```

- Ou manualmente via arquivo SQL:

```bash
# no terminal do MySQL
mysql -u <usuario> -p < database.sql
```

Após criar o banco, há scripts opcionais para popular dados de exemplo em `scripts/` (ex.: `scripts/seed-classics.js`).

## Execução

Inicie a aplicação:

```bash
npm start
```

Por padrão a aplicação roda em `http://localhost:3000` (ou a porta definida em `PORT` no `.env`).

## Uploads e arquivos estáticos

- A pasta pública é `public/`. Os uploads são gravados em `public/uploads/` — verifique permissões de escrita para o usuário que executa o Node.

## Estrutura relevante

- Arquivos principais:
  - [app.js](app.js)
  - [package.json](package.json)
  - [database.sql](database.sql)
  - [config/db.js](config/db.js)
  - Rotas: [routes/](routes/)
  - Views (EJS): [views/](views/)

## Testes e scripts auxiliares

- Scripts utilitários estão na pasta `scripts/` (ex.: `init-db.js`, `seed-classics.js`, `test-omdb.js`).

## Problemas comuns

- Verifique se o MySQL está aceitando conexões com as credenciais configuradas.
- Se houver erro ao gravar uploads, ajuste permissões de `public/uploads/`.


