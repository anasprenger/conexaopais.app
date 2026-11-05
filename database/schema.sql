-- =============================================================================
-- Conexão Pais — estrutura do banco de dados (MySQL 8 / MariaDB 10.6+)
-- Executar antes do seed.sql. ATENÇÃO: recria as tabelas (apaga os dados).
-- =============================================================================

CREATE DATABASE IF NOT EXISTS conexao_pais
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE conexao_pais;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS mensagens;
DROP TABLE IF EXISTS revista_paginas;
DROP TABLE IF EXISTS revistas;
DROP TABLE IF EXISTS coluna_posts;
DROP TABLE IF EXISTS colunas;
DROP TABLE IF EXISTS interacoes;
DROP TABLE IF EXISTS comentarios;
DROP TABLE IF EXISTS publicacoes;
DROP TABLE IF EXISTS profissionais;
DROP TABLE IF EXISTS usuarios;
SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- Usuários e níveis de acesso
-- nivel: usuario (família), profissional ou admin
-- verificacao: situação do cadastro profissional (família e admin já entram aprovados)
-- -----------------------------------------------------------------------------
CREATE TABLE usuarios (
  id                    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome                  VARCHAR(120) NOT NULL,
  email                 VARCHAR(160) NOT NULL,
  senha_hash            VARCHAR(100) NOT NULL,
  nivel                 ENUM('usuario', 'profissional', 'admin') NOT NULL DEFAULT 'usuario',
  profissao             VARCHAR(80)  NULL,
  registro_profissional VARCHAR(40)  NULL,
  verificacao           ENUM('pendente', 'aprovado', 'ajustes_solicitados', 'recusado') NOT NULL DEFAULT 'aprovado',
  observacao_admin      VARCHAR(500) NULL,
  criado_em             TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_email (email),
  KEY idx_usuarios_nivel_verificacao (nivel, verificacao)
) ENGINE = InnoDB;

-- -----------------------------------------------------------------------------
-- Diretório de profissionais (perfil público). Pode estar ligado a uma conta.
-- -----------------------------------------------------------------------------
CREATE TABLE profissionais (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id    INT UNSIGNED NULL,
  slug          VARCHAR(80)  NOT NULL,
  nome          VARCHAR(120) NOT NULL,
  especialidade VARCHAR(80)  NOT NULL,
  descricao     VARCHAR(500) NOT NULL,
  cidade        VARCHAR(80)  NULL,
  atendimento   VARCHAR(60)  NULL,
  whatsapp      VARCHAR(20)  NULL,
  criado_em     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_profissionais_slug (slug),
  UNIQUE KEY uq_profissionais_usuario (usuario_id),
  CONSTRAINT fk_profissionais_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE SET NULL
) ENGINE = InnoDB;

-- -----------------------------------------------------------------------------
-- ENTIDADE PRINCIPAL: publicações (no app, do tipo artigo)
-- conteudo: parágrafos separados por uma linha em branco | tags: separadas por vírgula
-- -----------------------------------------------------------------------------
CREATE TABLE publicacoes (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  autor_id      INT UNSIGNED NOT NULL,
  tipo          ENUM('artigo', 'post') NOT NULL DEFAULT 'artigo',
  slug          VARCHAR(180) NOT NULL,
  titulo        VARCHAR(160) NOT NULL,
  resumo        VARCHAR(400) NOT NULL,
  conteudo      TEXT         NOT NULL,
  categoria     VARCHAR(60)  NOT NULL,
  tags          VARCHAR(255) NULL,
  destaque      TINYINT(1)   NOT NULL DEFAULT 0,
  status        ENUM('rascunho', 'publicado') NOT NULL DEFAULT 'publicado',
  criado_em     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_publicacoes_slug (slug),
  KEY idx_publicacoes_tipo_status (tipo, status),
  KEY idx_publicacoes_categoria (categoria),
  CONSTRAINT fk_publicacoes_autor FOREIGN KEY (autor_id) REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------------------------------
-- Comunidade: comentários e interações (curtida / salvo) em publicações
-- -----------------------------------------------------------------------------
CREATE TABLE comentarios (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  publicacao_id INT UNSIGNED  NOT NULL,
  usuario_id    INT UNSIGNED  NOT NULL,
  texto         VARCHAR(1000) NOT NULL,
  criado_em     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_comentarios_publicacao (publicacao_id),
  CONSTRAINT fk_comentarios_publicacao FOREIGN KEY (publicacao_id) REFERENCES publicacoes (id) ON DELETE CASCADE,
  CONSTRAINT fk_comentarios_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE interacoes (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id    INT UNSIGNED NOT NULL,
  publicacao_id INT UNSIGNED NOT NULL,
  tipo          ENUM('curtida', 'salvo') NOT NULL,
  criado_em     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_interacoes (usuario_id, publicacao_id, tipo),
  KEY idx_interacoes_publicacao (publicacao_id, tipo),
  CONSTRAINT fk_interacoes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
  CONSTRAINT fk_interacoes_publicacao FOREIGN KEY (publicacao_id) REFERENCES publicacoes (id) ON DELETE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------------------------------
-- Colunas assinadas e suas publicações
-- -----------------------------------------------------------------------------
CREATE TABLE colunas (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  colunista_id  INT UNSIGNED NOT NULL,
  slug          VARCHAR(80)  NOT NULL,
  nome          VARCHAR(100) NOT NULL,
  chamada       VARCHAR(255) NOT NULL,
  periodicidade VARCHAR(20)  NOT NULL,
  sobre         TEXT         NOT NULL,
  criado_em     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_colunas_slug (slug),
  CONSTRAINT fk_colunas_colunista FOREIGN KEY (colunista_id) REFERENCES usuarios (id)
) ENGINE = InnoDB;

CREATE TABLE coluna_posts (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  coluna_id    INT UNSIGNED NOT NULL,
  slug         VARCHAR(120) NOT NULL,
  titulo       VARCHAR(160) NOT NULL,
  resumo       VARCHAR(400) NOT NULL,
  texto        TEXT         NOT NULL,
  publicado_em DATE         NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_coluna_posts (coluna_id, slug),
  CONSTRAINT fk_coluna_posts_coluna FOREIGN KEY (coluna_id) REFERENCES colunas (id) ON DELETE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------------------------------
-- Revista digital: edições e páginas
-- destaques: um por linha
-- -----------------------------------------------------------------------------
CREATE TABLE revistas (
  id           INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  slug         VARCHAR(40)       NOT NULL,
  edicao       SMALLINT UNSIGNED NOT NULL,
  titulo       VARCHAR(160)      NOT NULL,
  subtitulo    VARCHAR(255)      NOT NULL,
  descricao    VARCHAR(500)      NOT NULL,
  categoria    VARCHAR(60)       NOT NULL,
  destaques    TEXT              NULL,
  pdf_url      VARCHAR(255)      NULL,
  publicada_em DATE              NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_revistas_slug (slug),
  UNIQUE KEY uq_revistas_edicao (edicao)
) ENGINE = InnoDB;

CREATE TABLE revista_paginas (
  id         INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  revista_id INT UNSIGNED      NOT NULL,
  numero     SMALLINT UNSIGNED NOT NULL,
  secao      VARCHAR(60)       NOT NULL,
  titulo     VARCHAR(160)      NOT NULL,
  texto      TEXT              NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_revista_paginas (revista_id, numero),
  CONSTRAINT fk_revista_paginas_revista FOREIGN KEY (revista_id) REFERENCES revistas (id) ON DELETE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------------------------------
-- Mensagens enviadas pelo app: Contato e "Pergunte à equipe"
-- -----------------------------------------------------------------------------
CREATE TABLE mensagens (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id INT UNSIGNED NULL,
  tipo       ENUM('contato', 'pergunta') NOT NULL,
  nome       VARCHAR(120) NOT NULL,
  email      VARCHAR(160) NOT NULL,
  assunto    VARCHAR(160) NULL,
  mensagem   TEXT         NOT NULL,
  status     ENUM('nova', 'respondida') NOT NULL DEFAULT 'nova',
  criado_em  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_mensagens_tipo_status (tipo, status),
  CONSTRAINT fk_mensagens_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE SET NULL
) ENGINE = InnoDB;
