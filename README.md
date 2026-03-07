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

### Rodar MySQL com Docker

Você pode levantar um container MySQL local usando o `docker-compose.yml` incluído. Ele usa o arquivo `database.sql` para inicializar o schema na primeira execução.

1. Garanta que o arquivo `.env` contenha as variáveis `DB_NAME`, `DB_USER`, `DB_PASSWORD` (ou edite os valores padrão no `docker-compose.yml`).

2. Suba o container:

```bash
docker compose up -d
```

3. Verifique logs e estado:

```bash
docker compose logs -f db
docker compose ps
```

4. Ajuste sua aplicação para conectar ao banco:

- Se você executa a aplicação no host (não em container), use `DB_HOST=127.0.0.1` e `DB_PORT=3306` no `.env`.
- Se executar a aplicação também via Docker na mesma rede compose, use `DB_HOST=db`.

Para parar e remover o serviço:

```bash
docker compose down
```


## Execução

Inicie a aplicação:

```bash
npm start
```

Por padrão a aplicação roda em `http://localhost:3000` (ou a porta definida em `PORT` no `.env`).

### Fluxo plug-and-play recomendado

Se estiver usando o `docker-compose` incluído:

1. Suba o serviço MySQL:

```bash
docker compose up -d
```

2. Instale dependências (se ainda não fez):

```bash
npm install
```

3. Inicialize o banco e garanta colunas necessárias (executa `init-db` e alterações seguras):

```bash
npm run setup-db
```

4. Inicie o servidor (ou use o comando que aguarda o DB antes de iniciar):

```bash
npm run start:withdb
```

Alternativa única (executa init, columns e, opcionalmente, seed):

```bash
# roda bootstrap; para rodar seed automático defina SEED_ON_BOOT=true antes
SEED_ON_BOOT=true npm run bootstrap
```

Esses comandos tornam o projeto mais "plug-and-play" — o `setup-db` garante que o schema e as colunas estão presentes mesmo após um reset do container.

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


