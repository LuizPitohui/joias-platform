# 💎 Joias Platform - E-commerce (V1)

Uma plataforma de e-commerce completa e moderna desenvolvida para a venda de joias de alto padrão. O sistema conta com um catálogo dinâmico, carrinho de compras persistente, painel administrativo e um fluxo de checkout otimizado para conversão direta via WhatsApp.

---

## 🚀 Tecnologias Utilizadas

O projeto foi construído utilizando uma arquitetura separada (Headless E-commerce) com as seguintes tecnologias:

### Frontend
* **Next.js / React** (Framework de interface)
* **TypeScript** (Tipagem estática para maior segurança)
* **Tailwind CSS** (Estilização utilitária e responsiva)
* **Lucide React** (Ícones)
* **Axios** (Comunicação com a API)

### Backend
* **Python 3 / Django** (Framework principal)
* **Django REST Framework (DRF)** (Construção da API)
* **SimpleJWT** (Autenticação customizada via Email + Senha)
* **SQLite / PostgreSQL** (Banco de dados)
* *(Nota de ambiente: Gerenciamento de pacotes local suportado via Poetry)*

### Infraestrutura
* **Docker & Docker Compose** (Containerização de todo o ambiente de desenvolvimento)

---

## ✨ Principais Funcionalidades (V1)

* **Catálogo Turbo:** Gerador automático de produtos (`seed_db`) que cria dezenas de joias com nomes profissionais, preços, atributos (Aro, Material, Pedra) e imagens reais otimizadas.
* **Autenticação Customizada:** Login de usuários utilizando o e-mail em vez de *username*, integrado de forma segura com JWT.
* **Busca Inteligente (Live Search):** Barra de pesquisa com *autocomplete* em tempo real.
* **Carrinho Persistente:** Carrinho de compras gerenciado via Context API, garantindo que o usuário não perca os itens ao recarregar a página.
* **Checkout Humanizado (WhatsApp):** O cliente finaliza o pedido no site e é redirecionado para o WhatsApp do vendedor com uma mensagem pré-formatada contendo o ID exclusivo do pedido (ex: `#PED-A7B2C9`).
* **Área do Cliente:** Painel "Minha Conta" contendo:
  * Dados pessoais.
  * Gerenciamento de múltiplos endereços (com busca via CEP).
  * Histórico de pedidos com acompanhamento visual de status (Pendente, Preparando, Enviado, Entregue).

---

## 🛠️ Como Rodar o Projeto Localmente

Siga o passo a passo abaixo para levantar o ambiente de desenvolvimento do zero utilizando o Docker.

### 1. Pré-requisitos
Certifique-se de ter o **Docker** e o **Docker Compose** instalados na sua máquina.

### 2. Subindo os Containers
Na raiz do projeto (onde está o arquivo `docker-compose.yml`), abra o terminal e execute:

```bash
docker-compose up --build

Isso fará o download das imagens, instalará as dependências do Frontend (Node) e do Backend (Python) e deixará os servidores rodando.

3. Configurando o Banco de Dados
Abra um novo terminal (mantenha o primeiro rodando) e execute as migrações para criar as tabelas no banco de dados:

Bash
docker-compose run --rm api python manage.py makemigrations
docker-compose run --rm api python manage.py migrate
4. Populando o Banco (Mock Data)
Para não testar com o site vazio, rode o nosso script "Turbo Seed". Ele criará as categorias, atributos e dezenas de produtos profissionais com imagens.

Bash
docker-compose run --rm api python manage.py seed_db
5. Criando o Usuário Administrador
Crie uma conta com privilégios máximos para acessar o painel de controle do Django:

Bash
docker-compose run --rm api python manage.py createsuperuser
(Siga os prompts de Username, Email e Password).

6. Acessando a Aplicação
Com tudo configurado, você pode acessar:

Frontend (Loja): http://localhost:3000

Backend (API): http://localhost:8000/api/

Painel Admin: http://localhost:8000/admin/

💻 Comandos Úteis no Dia a Dia
Derrubar tudo e limpar os volumes (Cuidado, apaga o banco atual):

Bash
docker-compose down -v
Acessar o shell do Python dentro do container:

Bash
docker-compose run --rm api python manage.py shell
Ver os logs do Backend caso dê algum erro:

Bash
docker-compose logs -f api