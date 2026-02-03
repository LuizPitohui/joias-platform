# backend/Dockerfile
FROM python:3.13-slim

WORKDIR /app

# Instala dependências do sistema para o Postgres e compiladores
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Instala o Poetry
RUN pip install poetry

# Copia arquivos de dependência
COPY pyproject.toml poetry.lock /app/

# Configura o Poetry
RUN poetry config virtualenvs.create false

# Instala dependências (sem instalar o projeto raiz ainda)
RUN poetry install --no-interaction --no-ansi --no-root

# Copia o código
COPY . /app/

# Porta do Django
EXPOSE 8000

# Script para esperar o Banco de Dados iniciar antes de rodar o Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]