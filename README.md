
# studio-main

## Como rodar o projeto

1. **Clone o repositório:**
	```bash
	git clone https://github.com/SEU_USUARIO/studio-main.git
	cd studio-main
	```

2. **Instale as dependências:**
	```bash
	npm install
	```

3. **Configure as variáveis de ambiente:**
	- Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:
	  ```env
	  VITE_EMAILJS_SERVICE_ID=seu_service_id
	  VITE_EMAILJS_TEMPLATE_ID=seu_template_id
	  VITE_EMAILJS_USER_ID=seu_user_id
	  ```
	- Ou edite o arquivo `.env.example` e renomeie para `.env`.

4. **Inicie o projeto em modo desenvolvimento:**
	```bash
	npm run dev
	```

5. **Acesse no navegador:**
	- Normalmente em `http://localhost:5173` ou conforme indicado no terminal.

## Segurança

- O arquivo `.env` **não deve ser versionado**. Use apenas `.env.example` no repositório.
- Nunca exponha dados sensíveis no front-end.

## Deploy

- Configure as variáveis de ambiente no painel do serviço de hospedagem (Vercel, Netlify, etc).


