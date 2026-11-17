// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { webcrypto } from 'node:crypto'
import AuthScreen from './components/AuthScreen.jsx'
import Diary from './pages/Diary.jsx'
import { specialsFor } from './data/specialDays.js'
import { validateFirstName, validateLastName, isGmail, readAccounts } from './lib/auth.js'

Object.defineProperty(window, 'crypto', { value: webcrypto, configurable: true })
afterEach(() => { cleanup(); localStorage.clear() })

describe('validation', () => {
  it('rejects messy names and non-gmail', () => {
    expect(validateFirstName('kevser tatrzı biş')).toBeTruthy()
    expect(validateLastName('Tat Biş')).toBeTruthy()
    expect(validateFirstName('K3vser')).toBeTruthy()
    expect(validateFirstName('Ayşe Nur')).toBe('')
    expect(validateLastName('Yılmaz')).toBe('')
    expect(isGmail('kevser.t@gmail.com')).toBe(true)
    expect(isGmail('kevser@outlook.com')).toBe(false)
  })
})
describe('special days', () => {
  it('marks 10 Nov as memorial and national holidays', () => {
    expect(specialsFor(2026, 10, 10).some((s) => s.type === 'memorial')).toBe(true)
    for (const [m, d] of [[3, 23], [4, 19], [6, 15], [7, 30], [9, 29]]) expect(specialsFor(2026, m, d).some((s) => s.type === 'national')).toBe(true)
    expect(specialsFor(2026, 10, 12).some((s) => s.type === 'week')).toBe(true)
  })
})
describe('sign-up flow', () => {
  it('details -> code -> account', async () => {
    const user = userEvent.setup(), onOk = vi.fn()
    render(<AuthScreen onAuthSuccess={onOk} />)
    await user.type(screen.getByLabelText('First name'), 'kevser')
    await user.type(screen.getByLabelText('Last name'), 'yılmaz')
    await user.type(screen.getByLabelText('Gmail'), 'kevser.t@gmail.com')
    await user.type(screen.getByLabelText('Password'), 'abc')
    await user.click(screen.getByRole('button', { name: /Continue/ }))
    expect(screen.getByRole('alert').textContent).toMatch(/at least 4/)
    await user.type(screen.getByLabelText('Password'), 'd')
    await user.click(screen.getByRole('button', { name: /Continue/ }))
    const demo = await screen.findByText(/Demo mode/)
    const code = demo.querySelector('b').textContent
    expect(code).toMatch(/^\d{6}$/)
    const input = screen.getByLabelText('Verification code').querySelector('input')
    await user.type(input, code === '000000' ? '111111' : '000000')
    await user.click(screen.getByRole('button', { name: /Verify/ }))
    expect(screen.getByRole('alert').textContent).toMatch(/not correct/)
    await user.clear(input); await user.type(input, code)
    await user.click(screen.getByRole('button', { name: /Verify/ }))
    await waitFor(() => expect(onOk).toHaveBeenCalled())
    expect(onOk.mock.calls[0][0]).toMatchObject({ email: 'kevser.t@gmail.com', firstName: 'Kevser', lastName: 'Yılmaz', username: null, avatar: null })
    expect(readAccounts()).toHaveLength(1)
  })
})
describe('diary pin', () => {
  it('create PIN, confirm, writes entry; relock needs the PIN', async () => {
    const user = userEvent.setup(), u = { id: 'u1' }
    const view = render(<MemoryRouter><Diary user={u} /></MemoryRouter>)
    for (const k of '1234') await user.click(screen.getByRole('button', { name: k }))
    expect(await screen.findByText('Confirm your PIN')).toBeTruthy()
    for (const k of '1234') await user.click(screen.getByRole('button', { name: k }))
    const ta = await screen.findByPlaceholderText('Dear diary…')
    await user.type(ta, 'Hello page')
    await waitFor(() => expect(JSON.parse(localStorage.getItem('choivia:diary:u1'))).toBeTruthy(), { timeout: 2000 })
    view.unmount()
    render(<MemoryRouter><Diary user={u} /></MemoryRouter>)
    for (const k of '9999') await user.click(screen.getByRole('button', { name: k }))
    expect(await screen.findByText('Wrong PIN, try again.')).toBeTruthy()
    await new Promise((r) => setTimeout(r, 600))
    for (const k of '1234') await user.click(screen.getByRole('button', { name: k }))
    expect((await screen.findByPlaceholderText('Dear diary…')).value).toBe('Hello page')
  })
})
