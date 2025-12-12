/*
  # Criar tabelas para gerenciamento de imagens do portfólio

  ## 1. Novas Tabelas
  
  ### `portfolio_images`
  Armazena todas as imagens do portfólio com suas informações
  - `id` (uuid, primary key) - Identificador único da imagem
  - `title` (text) - Título/nome da imagem
  - `description` (text, nullable) - Descrição opcional da imagem
  - `image_url` (text) - URL da imagem
  - `category` (text) - Categoria da imagem (portfolio, before-after, etc)
  - `order_index` (integer) - Ordem de exibição
  - `created_at` (timestamptz) - Data de criação
  - `updated_at` (timestamptz) - Data de última atualização
  
  ### `hero_images`
  Armazena as imagens do banner/hero principal
  - `id` (uuid, primary key) - Identificador único
  - `image_url` (text) - URL da imagem
  - `is_active` (boolean) - Se a imagem está ativa/visível
  - `created_at` (timestamptz) - Data de criação
  - `updated_at` (timestamptz) - Data de última atualização

  ## 2. Segurança
  
  - Habilita RLS em ambas as tabelas
  - Políticas de SELECT públicas (qualquer um pode ver)
  - Políticas de INSERT, UPDATE, DELETE apenas para usuários autenticados
  
  ## 3. Notas Importantes
  
  - As imagens serão acessíveis publicamente para visualização
  - Apenas administradores autenticados podem modificar
  - Índices criados para melhor performance nas consultas
*/

-- Criar tabela de imagens do portfólio
CREATE TABLE IF NOT EXISTS portfolio_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  category text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de imagens do hero
CREATE TABLE IF NOT EXISTS hero_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE portfolio_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_images ENABLE ROW LEVEL SECURITY;

-- Políticas para portfolio_images
CREATE POLICY "Qualquer um pode visualizar imagens do portfólio"
  ON portfolio_images
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir imagens"
  ON portfolio_images
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar imagens"
  ON portfolio_images
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar imagens"
  ON portfolio_images
  FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para hero_images
CREATE POLICY "Qualquer um pode visualizar imagens do hero"
  ON hero_images
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir imagens do hero"
  ON hero_images
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar imagens do hero"
  ON hero_images
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar imagens do hero"
  ON hero_images
  FOR DELETE
  TO authenticated
  USING (true);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_portfolio_images_category ON portfolio_images(category);
CREATE INDEX IF NOT EXISTS idx_portfolio_images_order ON portfolio_images(order_index);
CREATE INDEX IF NOT EXISTS idx_hero_images_active ON hero_images(is_active);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_portfolio_images_updated_at
  BEFORE UPDATE ON portfolio_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hero_images_updated_at
  BEFORE UPDATE ON hero_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
