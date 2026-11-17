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

// ---------- Validation helpers (sign-up) ----------
const VOWELS = /[aeıioöuüAEIİOÖUÜ]/
function checkNamePart(raw, label, maxWords) {
  const words = raw.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return `Please enter your ${label}.`
  if (words.length > maxWords) return maxWords === 1 ? `Please enter only one word for your ${label}.` : `Your ${label} can have at most ${maxWords} words.`
  for (const w of words) {
    if (!/^\p{L}+$/u.test(w)) return `Your ${label} can only contain letters.`
    if (w.length < 2 || w.length > 20) return `Your ${label} should be 2–20 letters.`
    if (!VOWELS.test(w) || /(.)\1\1/iu.test(w)) return `That ${label} doesn’t look right. Please check it.`
  }
  return ''
}
export const validateFirstName = (v) => checkNamePart(v, 'first name', 2)
export const validateLastName = (v) => checkNamePart(v, 'last name', 1)
export const titleCaseTr = (v) => v.trim().split(/\s+/).map((w) => w.charAt(0).toLocaleUpperCase('tr') + w.slice(1).toLocaleLowerCase('tr')).join(' ')
export const normalizeEmail = (v) => v.trim().toLowerCase()
export const isGmail = (v) => /^[a-z0-9](?:[a-z0-9]|\.(?!\.)){4,28}[a-z0-9]@gmail\.com$/i.test(v.trim())
export const MIN_PASSWORD = 4
export const validateUsername = (v) => (/^[\p{L}0-9_.]{3,16}$/u.test(v.trim()) ? '' : 'Use 3–16 letters, numbers, “_” or “.”.')
export const makeSalt = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('')
export const makeCode = () => String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, '0')

export function saveAccounts(list) { localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(list)) }
export const usernameTaken = (name, exceptId) =>
  readAccounts().some((a) => a.id !== exceptId && a.username && a.username.toLowerCase() === name.trim().toLowerCase())

// ---------- Used by the Preferences page ----------
export function renameAccount(uid, name) {
  const err = validateUsername(name)
  if (err) return err
  if (usernameTaken(name, uid)) return 'This username is already taken.'
  saveAccounts(readAccounts().map((a) => (a.id === uid ? { ...a, username: name.trim() } : a)))
  return ''
}

export async function changePassword(uid, current, next) {
  const acc = readAccounts().find((a) => a.id === uid)
  if (!acc) return 'Account not found.'
  if (await hashPassword(current, acc.salt) !== acc.passwordHash) return 'Your current password is not correct.'
  if (next.length < MIN_PASSWORD) return `New password must be at least ${MIN_PASSWORD} characters.`
  const salt = makeSalt()
  const passwordHash = await hashPassword(next, salt)
  saveAccounts(readAccounts().map((a) => (a.id === uid ? { ...a, salt, passwordHash } : a)))
  return ''
}
