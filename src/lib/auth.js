export const AUTH_STORAGE_KEY = 'choivia:accounts:v1'
export const SESSION_STORAGE_KEY = 'choivia:session:v1'

export async function hashPassword(password, salt) {
  if (!window.crypto?.subtle) {
    throw new Error('Şifreleme kullanılamıyor. Choivia’yı localhost veya HTTPS üzerinde aç.')
  }
  const bytes = new TextEncoder().encode(`${salt}:${password}`)
  const digest = await window.crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}

export function readAccounts() {
  try { return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || '[]') }
  catch { return [] }
}

const writeAccounts = (list) => localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(list))

// Returns an error message, or null on success.
export function renameAccount(id, name) {
  const next = name.trim()
  if (next.length < 3) return 'Username must be at least 3 characters.'
  const accounts = readAccounts()
  if (accounts.some((a) => a.id !== id && a.username.toLowerCase() === next.toLowerCase())) return 'This username is taken.'
  writeAccounts(accounts.map((a) => (a.id === id ? { ...a, username: next } : a)))
  return null
}

export async function changePassword(id, current, next) {
  const accounts = readAccounts()
  const me = accounts.find((a) => a.id === id)
  if (!me) return 'Account not found.'
  if (await hashPassword(current, me.salt) !== me.passwordHash) return 'Your current password is wrong.'
  if (next.length < 8) return 'New password must be at least 8 characters.'
  const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('')
  writeAccounts(accounts.map((a) => (a.id === id ? { ...a, salt, passwordHash: '' } : a)))
  const passwordHash = await hashPassword(next, salt)
  writeAccounts(readAccounts().map((a) => (a.id === id ? { ...a, salt, passwordHash } : a)))
  return null
}
