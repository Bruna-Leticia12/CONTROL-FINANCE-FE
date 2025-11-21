# 🏦 Guia de Configuração: Conexão Open Finance

## 📋 Visão Geral

Este guia documenta o novo fluxo de conexão com instituições financeiras via Open Finance implementado no Control Finance.

## 🏗️ Arquitetura do Fluxo

### Fluxo Completo

```
┌─────────────┐         ┌──────────────────┐         ┌────────────────┐         ┌──────────────┐
│  Dashboard  │         │  Dialog Confirm  │         │   Backend      │         │  Bank Login  │
└──────┬──────┘         └────────┬─────────┘         └────────┬───────┘         └──────┬───────┘
       │                         │                            │                         │
       │ 1. Clicar "Conectar"    │                            │                         │
       ├────────────────────────>│                            │                         │
       │                         │                            │                         │
       │ 2. Exibir confirmação   │                            │                         │
       │    "Tem certeza?"       │                            │                         │
       │<────────────────────────┤                            │                         │
       │                         │                            │                         │
       │ 3. Usuário confirma     │                            │                         │
       ├────────────────────────>│                            │                         │
       │                         │                            │                         │
       │                         │  4. POST /connection/start │                         │
       │                         ├───────────────────────────>│                         │
       │                         │                            │                         │
       │                         │  5. Retorna connectionId + │                         │
       │                         │     linkingUrl             │                         │
       │                         │<───────────────────────────┤                         │
       │                         │                            │                         │
       │ 6. Redireciona para     │                            │                         │
       │    /bank-login          │                            │                         │
       ├─────────────────────────────────────────────────────────────────────────────>│
       │                         │                            │                         │
       │                         │                            │  7. Exibe tela de login │
       │                         │                            │     com cor do banco    │
       │                         │                            │<────────────────────────┤
       │                         │                            │                         │
       │                         │                            │  8. Usuário insere CPF  │
       │                         │                            │     e senha             │
       │                         │                            │<────────────────────────┤
       │                         │                            │                         │
       │                         │  9. POST /complete com     │                         │
       │                         │     apiKey, userId, etc    │                         │
       │                         │<───────────────────────────────────────────────────┤
       │                         │                            │                         │
       │ 10. Redireciona de volta│                            │                         │
       │     para /dashboard     │                            │                         │
       │<────────────────────────────────────────────────────────────────────────────┤
       │                         │                            │                         │
```

## 🔧 Configuração das URLs

### 1. Environment Configuration

**Arquivo**: `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  controlFinanceBackendUrl: 'http://localhost:4000',
  institutionsFinancial: {
    bruna: 'http://localhost:4001',
    guilherme: 'http://localhost:4002',
    larissa: 'http://localhost:4003',
    leonardo: 'http://localhost:4004',
    rodrigo: 'http://localhost:4005',
  }
};
```

**Portas configuradas:**
- Bruna: `http://localhost:4001`
- Guilherme: `http://localhost:4002`
- Larissa: `http://localhost:4003`
- Leonardo: `http://localhost:4004`
- Rodrigo: `http://localhost:4005`

## 🎨 Componentes

### 1. Confirmation Dialog

**Arquivo**: `src/app/components/confirmation-dialog/confirmation-dialog.component.ts`

**Funcionalidade:**
- Exibe diálogo de confirmação antes de iniciar conexão
- Mostra informações sobre Open Finance
- Lista permissões que serão compartilhadas
- Recebe o nome do banco como parâmetro

**Uso:**
```typescript
const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
  width: '480px',
  disableClose: true,
  data: { bankName: 'Bruna' }
});
```

### 2. Bank Login Page

**Arquivo**: `src/app/pages/bank-login/bank-login.component.ts`

**Funcionalidade:**
- Tela de login simulada da instituição financeira
- Aplica cores dinâmicas baseadas no banco selecionado
- Captura CPF e senha do usuário
- Chama endpoint `/connection/complete` automaticamente
- Redireciona de volta ao dashboard após sucesso

**Temas por banco:**
```typescript
bruna: {
  primaryColor: '#e63946',
  gradient: 'linear-gradient(135deg, #e63946 0%, #d62828 100%)'
}

guilherme: {
  primaryColor: '#ffd60a',
  gradient: 'linear-gradient(135deg, #ffd60a 0%, #ffc300 100%)'
}

larissa: {
  primaryColor: '#4361ee',
  gradient: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)'
}

leonardo: {
  primaryColor: '#f77f00',
  gradient: 'linear-gradient(135deg, #f77f00 0%, #d62828 100%)'
}

rodrigo: {
  primaryColor: '#9e25bd',
  gradient: 'linear-gradient(135deg, #9e25bd 0%, #7209b7 100%)'
}
```

## 🔄 Serviço de Conexão

### OpenFinanceConnectionService

**Arquivo**: `src/app/services/open-finance-connection.service.ts`

#### Método: `startOpenFinanceConnection(bankName: string)`

**Descrição**: Inicia o fluxo de conexão com uma instituição financeira.

**Parâmetros:**
- `bankName` (string): Nome do banco (bruna, guilherme, larissa, leonardo, rodrigo)

**Retorno**: `Observable<StartConnectionResponse>`
```typescript
{
  connectionId: string;
  linkingUrl: string;
  status: 'PENDING';
}
```

**Exemplo:**
```typescript
this.openFinanceService
  .startOpenFinanceConnection('bruna')
  .subscribe(response => {
    console.log('Connection ID:', response.connectionId);
    // Redirecionar para login
  });
```

#### Método: `completeOpenFinanceConnection()`

**Descrição**: Completa a conexão após autenticação do usuário.

**Parâmetros:**
- `connectionId` (string): ID da conexão obtido no start
- `apiKey` (string): Chave de API fornecida pelo banco
- `userIdInChildApi` (string): ID do usuário na API do banco
- `consentIdInChildApi` (string): ID do consentimento

**Retorno**: `Observable<any>`

**Exemplo:**
```typescript
this.openFinanceService
  .completeOpenFinanceConnection(
    connectionId,
    apiKey,
    userIdInChildApi,
    consentIdInChildApi
  )
  .subscribe(response => {
    console.log('Conexão completada!');
  });
```

#### Método Privado: `getIfUrl(bankName: string)`

Mapeia o nome do banco para a URL da instituição financeira.

## 🛣️ Rotas

### Nova Rota: /bank-login

**Arquivo**: `src/app/app.routes.ts`

```typescript
{ path: 'bank-login', component: BankLoginComponent }
```

**Query Parameters:**
- `connectionId`: ID único da conexão
- `callbackUrl`: URL de callback para completar conexão
- `bank`: Nome do banco (usado para tema visual)
- `linkingUrl`: URL completa de linking

## 📊 Fluxo no Dashboard

### DashboardComponent

**Método**: `onConnectBank(bankName: string)`

```typescript
onConnectBank(bankName: string): void {
  // 1. Abrir dialog de confirmação
  const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
    width: '480px',
    disableClose: true,
    data: { bankName }
  });

  // 2. Se confirmado, iniciar conexão
  dialogRef.afterClosed().subscribe((confirmed: boolean) => {
    if (confirmed) {
      this.startBankConnection(bankName);
    }
  });
}
```

**Método**: `startBankConnection(bankName: string)`

```typescript
private startBankConnection(bankName: string): void {
  this.openFinanceService
    .startOpenFinanceConnection(bankName.toLowerCase())
    .subscribe({
      next: (res: StartConnectionResponse) => {
        // Redirecionar para tela de login do banco
        this.router.navigate(['/bank-login'], {
          queryParams: {
            connectionId: res.connectionId,
            callbackUrl: res.linkingUrl.split('callbackUrl=')[1],
            bank: bankName,
            linkingUrl: res.linkingUrl
          }
        });
      },
      error: (err) => {
        alert(err.message || 'Erro ao conectar com o banco');
      }
    });
}
```

## 🔐 Segurança

### Dados Armazenados

**sessionStorage:**
- `cpf`: CPF do usuário (pré-preenchido no login do banco)
- `connectionId`: ID da conexão atual
- `customerId`: ID do cliente retornado pelo banco

**localStorage:**
- `ctrlf_token`: JWT token para autenticação

### Criptografia

- API Keys são criptografadas no backend (AES-256-CBC)
- Tokens JWT têm validade de 1 hora
- Comunicação via HTTPS em produção

## 🧪 Testando o Fluxo

### 1. Iniciar Backend Control Finance
```bash
cd CONTROL-FINANCE
npm start
# Servidor rodando em http://localhost:4000
```

### 2. Iniciar API IF (Instituição Financeira)
```bash
cd api_IF
docker-compose up
# Ou ajustar porta para cada banco (4001-4005)
```

### 3. Iniciar Frontend
```bash
cd CONTROL-FINANCE-FE
npm start
# http://localhost:4200
```

### 4. Testar Conexão

1. Fazer login no Control Finance
2. Ir para Dashboard
3. Clicar em "Conectar" em um banco
4. Confirmar no diálogo
5. Preencher CPF e senha na tela do banco
6. Verificar redirecionamento de volta ao Dashboard

## 📝 Endpoints Backend Utilizados

### POST /connection/start

**Corpo da requisição:**
```json
{
  "targetApiUrl": "http://localhost:4001"
}
```

**Resposta (201):**
```json
{
  "connectionId": "a1b2c3d4...",
  "linkingUrl": "http://localhost:4001/open-finance/login?connectionId=...",
  "status": "PENDING"
}
```

### PATCH /connection/complete

**Corpo da requisição:**
```json
{
  "connectionId": "a1b2c3d4...",
  "apiKey": "sk_live_...",
  "userIdInChildApi": "user_123456",
  "consentIdInChildApi": "consent_789012"
}
```

**Resposta (200):**
```json
{
  "_id": "a1b2c3d4...",
  "userId": "507f1f77...",
  "targetApiUrl": "http://localhost:4001",
  "status": "ACTIVE",
  ...
}
```

## 🐛 Troubleshooting

### Erro: "Instituição Financeira não encontrada"
- Verificar se o nome do banco está correto em `environment.ts`
- Verificar se a URL está acessível

### Erro: "Falha ao completar conexão"
- Verificar se o backend está rodando
- Verificar token JWT no localStorage
- Verificar logs do console

### Banco de dados não responde
- Verificar se MongoDB está rodando
- Verificar connection string no backend

## 📚 Documentação Adicional

- [CONNECTION_API.md](./CONNECTION_API.md) - Documentação completa da API de conexões
- [swagger.yaml](./swagger/swagger.yaml) - Especificação OpenAPI
- [README_DOCS.md](./README_DOCS.md) - Documentação geral

## 🎯 Próximos Passos

- [ ] Implementar verificação de status de conexões ativas
- [ ] Adicionar tratamento de timeout na tela de login
- [ ] Implementar refresh de transações após conexão
- [ ] Adicionar indicador visual de bancos conectados
- [ ] Implementar revogação de conexões pelo Dashboard

---

**Última atualização**: 19 de Novembro de 2025  
**Versão**: 1.0.0
