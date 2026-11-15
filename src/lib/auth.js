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
