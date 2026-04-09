# 🚀 Workout Tracker - Guia Caddy

## Pré-requisitos

### 1. Instalar o Caddy

**Windows (via Scoop - recomendado):**
```powershell
scoop install caddy
```

**Windows (via Chocolatey):**
```powershell
choco install caddy
```

**Windows (manual):**
- Baixe em: https://caddyserver.com/download
- Extraia e adicione ao `PATH`

**Verificar instalação:**
```powershell
caddy version
```

---

## 🎯 Modos de Uso

### Modo 1: Dev Server com Proxy (Recomendado para desenvolvimento)

Ideal para iterar rapidamente com hot-reload.

```bash
# Terminal 1: Inicia o app na porta 3001
npm run dev -- --port 3001

# Terminal 2: Inicia o Caddy como proxy
npm run dev:caddy
# ou: caddy run --config Caddyfile
```

**Acesse:** `http://localhost:3000`

> **Atalho:** `npm run dev:proxy` inicia ambos automaticamente (pode não funcionar bem no Windows)

---

### Modo 2: Preview Estático (Build)

Ideal para testar o build de produção localmente.

```bash
# Gera o build estático
npm run generate

# Inicia o Caddy servindo os arquivos
npm run preview:caddy
# ou: caddy run --config Caddyfile.preview
```

**Acesse:** `http://localhost:8080`

---

### Modo 3: Caddy Manual

Se preferir rodar diretamente:

```bash
# Dev proxy
caddy run --config Caddyfile

# Preview estático
caddy run --config Caddyfile.preview
```

---

## 🔧 Configuração do Supabase

### Usando Supabase Local:
```bash
npm run db:start
# Certifique-se que .env aponta para http://127.0.0.1:54321
```

### Usando Supabase Cloud:
```bash
npm run db:use-prod
# .env agora aponta para o projeto cloud
```

---

## 🌐 Acessando do Celular

### Setup Automático (Recomendado)

```bash
# 1. Reinicie o Supabase local com novas configs
npm run db:stop
npm run db:start

# 2. Inicie app + Caddy (tudo em um comando)
npm run dev:mobile:caddy

# 3. No celular, acesse:
# http://192.168.0.180:3000
```

### Setup Manual

```bash
# Terminal 1: App
npm run dev:mobile

# Terminal 2: Caddy (como Admin!)
caddy run --config Caddyfile.mobile

# Celular: http://192.168.0.180:3000
```

### ⚠️ Importante
- **Celular e PC devem estar na mesma rede WiFi**
- Se usar Windows Firewall, permita a porta 3000/3001
- IP pode mudar - se mudar, atualize os arquivos

---

## 🌐 Acessando de Outros Dispositivos

Para acessar do celular ou outro PC na mesma rede:

1. **Edite o `Caddyfile`:**
```caddy
workout-app.local:3000 {
    tls internal
    reverse_proxy localhost:3001
}
```

2. **Rode o Caddy:**
```bash
caddy run --config Caddyfile
```

3. **No celular/outra máquina:** Acesse `https://<SEU_IP_LOCAL>:3000`
   - Pode precisar aceitar o certificado auto-assinado

---

## ⚡ Comandos Rápidos

| Comando | Descrição |
|---------|-----------|
| `npm run dev:caddy` | Inicia Caddy (dev proxy) |
| `npm run preview:caddy` | Build + Caddy estático |
| `caddy stop` | Para o Caddy |
| `caddy reload --config Caddyfile` | Recarrega config sem parar |

---

## 🐛 Troubleshooting

### Erro: "bind: address already in use"
Alguém já está usando a porta. Verifique:
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Erro: "caddy: command not found"
Caddy não está no PATH. Reinstale ou use o caminho completo:
```powershell
C:\path\to\caddy.exe run --config Caddyfile
```

### Caddy pede permissão de administrador
No Windows, Caddy precisa de admin para instalar certificados TLS.
- Execute o terminal como **Administrador**
- Ou use portas > 1024 sem TLS

### App não conecta ao Supabase
Verifique o `.env`:
```bash
# Local
npm run db:use-local

# Cloud
npm run db:use-prod
```
