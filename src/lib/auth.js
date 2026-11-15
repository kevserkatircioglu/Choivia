
export const AUTH_STORAGE_KEY = 'choivia:accounts:v1'
export const SESSION_STORAGE_KEY = 'choivia:session:v1'

// Password hashing
export async function hashPassword(password, salt) {
  if (!window.crypto?.subtle) {
    throw new Error(
      'Password encryption is unavailable. Please open Choivia using localhost or HTTPS.'
    )
  }

  const bytes = new TextEncoder().encode(`${salt}:${password}`)

  const digest = await window.crypto.subtle.digest(
    'SHA-256',
    bytes
  )

  return Array.from(
    new Uint8Array(digest),
    (b) => b.toString(16).padStart(2, '0')
  ).join('')
}

// Read registered accounts
export function readAccounts() {
  try {
    return JSON.parse(
      localStorage.getItem(AUTH_STORAGE_KEY) || '[]'
    )
  } catch {
    return []
  }
}

// Save accounts
export function saveAccounts(accounts) {
  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify(accounts)
  )
}

// Find account by ID
export function findAccount(userId) {
  return readAccounts().find(
    (account) => account.id === userId
  ) || null
}

// Update account profile
export function updateAccount(userId, updates) {
  const accounts = readAccounts()

  const index = accounts.findIndex(
    (account) => account.id === userId
  )

  if (index === -1) {
    throw new Error('Account not found.')
  }

  accounts[index] = {
    ...accounts[index],
    ...updates,
  }

  saveAccounts(accounts)

  return accounts[index]
}

// Save logged-in session
export function saveSession(user) {
  localStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify(user)
  )
}

// Read logged-in session
export function readSession() {
  try {
    return JSON.parse(
      localStorage.getItem(SESSION_STORAGE_KEY) || 'null'
    )
  } catch {
    return null
  }
}

// Remove logged-in session
export function clearSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY)
}
