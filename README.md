# 💸 Control Finance — Open Finance

Aplicação **Angular 16+** para integração com o ecossistema **Open Finance**, permitindo:

- Conectar bancos parceiros  
- Consultar contas e transações  
- Visualizar dashboard financeiro  
- Acompanhar metas  
- Realizar autenticação própria  

Backend utilizado: **http://localhost:4000**

---

## 📄 Índice
1. [Tecnologias](#-tecnologias)
2. [Funcionalidades](#-funcionalidades)
3. [Arquitetura](#-arquitetura)
4. [Instalação e Execução](#-instalação-e-execução)
5. [Scripts Disponíveis](#-scripts-disponíveis)
6. [Ambiente](#-ambiente)
7. [Fluxo Open Finance](#-fluxo-open-finance)
8. [Estrutura de Pastas](#-estrutura-de-pastas)
9. [Principais Services](#-principais-services)
10. [Build de Produção](#-build-de-produção)
11. [Autores](#-autores)

---

## 📌 Tecnologias

| Tecnologia                 | Uso            |
|----------------------------|----------------|
| **Angular 16+**            | App standalone |
| **Angular Material**       | UI             |
| **Chart.js**               | Gráficos       |
| **RxJS**                   | Reatividade    |
| **Typescript**             | Tipagem        |
| **SCSS**                   | Estilos        |
| **Node/Express (Backend)** | API            |

---

## 🚀 Funcionalidades

### 🔐 Autenticação
- Login / Registro  
- AuthGuard  
- Interceptor com JWT  

### 🏦 Open Finance
- Conexão com bancos  
- Criação e finalização de consentimento  
- Detecção automática do banco  
- Salvamento de connectionId (sessionStorage)  

### 📊 Dashboard
- Resumo mensal  
- Gráficos com Chart.js  
- Comparação: real x planejado  

### 💰 Transações
- Consolidadas de todos os bancos  
- Organização por categoria  
- Metadados (banco, conta, conexão)  

### 🎯 Metas
- Cálculo automático baseado em percentuais:  
  - 60% despesas  
  - 20% poupança  
  - 15% lazer  
  - 5% imprevistos  

### 👤 Contas
- Lista de contas conectadas  
- Informações agrupadas por conexão  

---

## 🏗️ Arquitetura

- Standalone Components  
- Interceptor global  
- Guards de autenticação  
- Services reativos  
- Rotas modulares  

---

## 🛠️ Instalação e Execução

```bash
git clone https://github.com/usuario/control-finance-fe.git
cd control-finance-fe
npm install
npm start
```

Acesse: **http://localhost:4200**

---

## 📦 Scripts Disponíveis

| Script          | Descrição            |
|-----------------|----------------------|
| `npm start`     | Modo desenvolvimento |
| `npm run build` | Build de produção    |
| `npm run watch` | Build contínuo       |
| `npm test`      | Testes               |

---

## ⚙️ Ambiente

Arquivo: `src/environments/environment.ts`

```ts
export const environment = {
  production: true,
  controlFinanceBackendUrl: 'http://localhost:4000',
  institutionsFinancial: {
    bruna: 'http://localhost:4001',
    guilherme: 'http://3.22.97.3:4002',
    larissa: 'http://3.22.97.3:4003',
    leonardo: 'http://3.22.97.3:4004',
    rodrigo: 'http://3.22.97.3:4005',
  }
};
```

---

## 🔄 Fluxo Open Finance

1. Usuário inicia conexão  
   ```http
   POST /connection/start
   ```
2. Usuário é redirecionado ao banco  
3. Banco retorna: `apiKey`, `consentId`, `userId`  
4. Front finaliza a conexão:  
   ```http
   PATCH /connection/complete
   ```
5. Contas e transações são importadas  
6. Dashboard exibe tudo consolidado  

---

## 🗂️ Estrutura de Pastas

```
src/
│ app/
│   ├ components/
│   ├ guards/
│   ├ interceptors/
│   ├ model/
│   ├ pages/
│   ├ services/
│   ├ app.routes.ts
│   ├ app.config.ts
│   └ app.component.ts
│ environments/
│ styles.scss
│ index.html
```

---

## 📚 Principais Services

### 🔗 ConnectionService
- Recupera conexões
- Identifica instituição pela URL
- Armazena connectionId

### 🔐 OpenFinanceConnectionService
- Inicia e finaliza conexão Open Finance  
- Consulta instituições parceiras  

### 💳 TransactionService
- Consolida transações  
- Enriquecimento com metadados  
- Analytics por categoria  

---

## 🏗️ Build de Produção

```bash
ng build --configuration production
```

Saída em:

```
dist/control-finance-fe/browser
```

---

## ✍️ Autores
- [Bruna Letícia](https://github.com/Bruna-Leticia12)
- [Guilherme](https://github.com/g-fe-p-b)
- [Leonardo](https://github.com/wchrLeonardo)
- [Larissa](https://github.com/larissatoyohashi)
- [Rodrigo](https://github.com/RcmSantos274)