import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => l.trim().split('='))
)

const BASE_URL = env.SUPABASE_URL ?? 'http://127.0.0.1:54321'
const API_KEY = env.SUPABASE_KEY

const users = [
  { email: 'marcos@email.com', password: 'password123' },
  { email: 'ana@email.com', password: 'password123' },
]

for (const user of users) {
  const res = await fetch(`${BASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': API_KEY },
    body: JSON.stringify(user),
  })
  console.log(user.email, res.ok ? 'criado' : await res.text())
}
console.log('Usuários criados!')
