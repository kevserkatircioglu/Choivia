import { AUTH_STORAGE_KEY, readAccounts } from './auth.js'

export const MIN_PASSWORD = 8

export function saveAccounts(accounts) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(accounts))
}

export const normalizeEmail = (value) =>
  String(value ?? '').trim().toLowerCase()

function validateName(value, label) {
  const name = String(value ?? '').trim()

  if (!name) return `Please enter your ${label}.`

  if (name.length < 2 || name.length > 40) {
    return `${label} must contain 2–40 characters.`
  }

  if (!/^[\p{L}]+(?:[ '\u2019-][\p{L}]+)*$/u.test(name)) {
    return `${label} can contain letters, spaces, hyphens and apostrophes only.`
  }

  return ''
}

export const validateFirstName = (value) =>
  validateName(value, 'first name')

export const validateLastName = (value) =>
  validateName(value, 'last name')

export function titleCaseTr(value) {
  return String(value ?? '')
    .trim()
    .split(/\s+/)
    .map((word) =>
      word
        .split(/([-'\u2019])/)
        .map((part) =>
          /^[-'\u2019]$/.test(part)
            ? part
            : part
              ? part.charAt(0).toLocaleUpperCase('tr-TR') +
                part.slice(1).toLocaleLowerCase('tr-TR')
              : '',
        )
        .join(''),
    )
    .join(' ')
}

export function validateUsername(value) {
  const name = String(value ?? '').trim()

  return /^[\p{L}\p{N}](?:[\p{L}\p{N}._]{1,14}[\p{L}\p{N}])$/u.test(name)
    ? ''
    : 'Use 3–16 letters, numbers, dots or underscores.'
}

export function usernameTaken(name, exceptId) {
  return readAccounts().some(
    (account) =>
      account.id !== exceptId &&
      account.username &&
      account.username.toLocaleLowerCase('tr-TR') ===
        String(name).trim().toLocaleLowerCase('tr-TR'),
  )
}

export function makeSalt() {
  return Array.from(
    crypto.getRandomValues(new Uint8Array(16)),
    (byte) => byte.toString(16).padStart(2, '0'),
  ).join('')
}

export function makeCode() {
  return String(
    crypto.getRandomValues(new Uint32Array(1))[0] % 1000000,
  ).padStart(6, '0')
}
