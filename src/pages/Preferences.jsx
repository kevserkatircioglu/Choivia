import { useState } from 'react'
import { Accessibility, Check, Download, KeyRound, LogOut, Pencil, Upload } from 'lucide-react'
import { Avatar, AvatarPicker } from '../components/Avatar.jsx'
import { changePassword, renameAccount } from '../lib/auth.js'
import { useStored } from '../lib/useStored.js'
import { parseBackup, todayKey } from '../utils/hobbies.js'
import { getMotionPreference, saveMotionPreference } from '../utils/motionPreference.js'

function Msg({ m }) {
  if (!m) return null
  const tone = m.ok ? 'ok' : m.neutral ? 'neutral' : 'bad'
  return <p className={`cv-msg ${tone}`} role="status">{m.text}</p>
}

export default function Preferences({ user, onUpdateUser, onLogout }) {
  const [name, setName] = useState(user.username)
  const [nameMsg, setNameMsg] = useState(null)
  const [pw, setPw] = useState({ cur: '', next: '', again: '' })
  const [pwMsg, setPwMsg] = useState(null)
  const [hobbies, setHobbies] = useStored(`choivia:hobbies:${user.id}`, [])
  const [backupMsg, setBackupMsg] = useState(null)
  const [motionPreference, setMotionPreference] = useState(
    () => getMotionPreference(user.id),
  )

  function saveName(e) {
    e.preventDefault()
    const err = renameAccount(user.id, name)
    if (err) return setNameMsg({ text: err })
    onUpdateUser({ username: name.trim() }); setNameMsg({ ok: true, text: 'Username updated.' })
  }
  async function savePw(e) {
    e.preventDefault()
    if (pw.next !== pw.again) return setPwMsg({ text: 'New passwords do not match.' })
    const err = await changePassword(user.id, pw.cur, pw.next)
    if (err) return setPwMsg({ text: err })
    setPw({ cur: '', next: '', again: '' }); setPwMsg({ ok: true, text: 'Password changed.' })
  }

  function exportBackup() {
    const backup = {
      app: 'choivia',
      version: 1,
      exportedAt: new Date().toISOString(),
      hobbies,
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `choivia-hobbies-${todayKey()}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setBackupMsg({ ok: true, text: 'Backup downloaded. Keep the file somewhere safe.' })
  }

  async function importBackup(event) {
    const input = event.currentTarget
    const file = input.files?.[0]
    input.value = ''
    if (!file) return

    try {
      const imported = parseBackup(await file.text())
      if (!window.confirm(`Import ${imported.length} hobby backup entries? Hobbies with the same id will be replaced.`)) {
        setBackupMsg({ neutral: true, text: 'Import canceled. Nothing was changed.' })
        return
      }

      const byId = new Map(hobbies.map((hobby) => [hobby.id, hobby]))
      imported.forEach((hobby) => byId.set(hobby.id, hobby))
      setHobbies([...byId.values()])
      setBackupMsg({ ok: true, text: 'Backup imported.' })
    } catch {
      setBackupMsg({
        text: 'That file is not a valid Choivia hobby backup. Nothing was changed.',
      })
    }
  }

  function updateMotionPreference(event) {
    const value = saveMotionPreference(user.id, event.target.value)
    setMotionPreference(value)
    window.dispatchEvent(new Event('choivia:motion-preference-change'))
  }

  return (
    <div className="cv-pref">
      <header className="cv-pref-hero">
        <Avatar id={user.avatar} size={84} className="cv-hero-avatar" />
        <div><p className="eyebrow">PREFERENCES</p><h1>{user.username}</h1></div>
      </header>

      <section className="cv-pref-card">
        <h2><Download size={18} /> Hobby data</h2>
        <p>Your hobbies are stored in this browser. Export a backup regularly so you can restore them later.</p>
        <div className="cv-pref-data-actions">
          <button
            type="button"
            className="cv-pref-btn"
            onClick={exportBackup}
            disabled={hobbies.length === 0}
          >
            <Download size={16} /> Download backup
          </button>
          <label className="cv-pref-btn cv-pref-file">
            <Upload size={16} /> Import backup
            <input
              type="file"
              accept=".json,application/json"
              onChange={importBackup}
              className="sr-only"
            />
          </label>
        </div>
        <Msg m={backupMsg} />
      </section>

      <section className="cv-pref-card">
        <h2><Accessibility size={18} /> Accessibility</h2>
        <p>Choose how much movement you want in the interface.</p>
        <label className="cv-pref-setting">
          <span>Motion preference</span>
          <select
            className="cv-pref-select"
            value={motionPreference}
            onChange={updateMotionPreference}
          >
            <option value="system">Use device setting</option>
            <option value="reduce">Reduce motion</option>
          </select>
        </label>
        <small className="cv-pref-setting-hint">
          Device setting follows your operating system’s accessibility preference.
        </small>
      </section>

      <section className="cv-pref-card">
        <h2>Your buddy</h2><p>Tap an icon to change your avatar.</p>
        <AvatarPicker value={user.avatar} onChange={(avatar) => onUpdateUser({ avatar })} />
      </section>

      <section className="cv-pref-card">
        <h2><Pencil size={18} /> Change username</h2>
        <form onSubmit={saveName} className="cv-pref-form">
          <label>New username<input value={name} onChange={(e) => { setName(e.target.value); setNameMsg(null) }} minLength={3} required autoComplete="username" /></label>
          <button type="submit" className="cv-pref-btn"><Check size={16} /> Save</button>
        </form>
        <Msg m={nameMsg} />
      </section>

      <section className="cv-pref-card">
        <h2><KeyRound size={18} /> Change password</h2>
        <form onSubmit={savePw} className="cv-pref-form">
          <label>Current password<input type="password" value={pw.cur} onChange={(e) => setPw({ ...pw, cur: e.target.value })} autoComplete="current-password" required /></label>
          <label>New password<input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" minLength={8} required /></label>
          <label>Repeat new password<input type="password" value={pw.again} onChange={(e) => setPw({ ...pw, again: e.target.value })} autoComplete="new-password" required /></label>
          <button type="submit" className="cv-pref-btn"><Check size={16} /> Update password</button>
        </form>
        <Msg m={pwMsg} />
      </section>

      <button type="button" className="cv-pref-logout" onClick={onLogout}><LogOut size={18} /> Log out</button>
    </div>
  )
}
