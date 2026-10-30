import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { Character, NewCharacter } from './types'
import './App.css'

const API_URL = 'http://localhost:5285/api/Characters'

const CLASSES = ['Warrior', 'Mage', 'Rogue', 'Archer']

const emptyForm: NewCharacter = { name: '', class: CLASSES[0], level: 1, health: 100, mana: 0 }

async function readError(response: Response): Promise<string> {
  const body = await response.json().catch(() => null)
  const validation = body?.errors && Object.values(body.errors).flat().join(' ')
  const message = body?.error ?? body?.message ?? validation
  if (message) return body?.detail ? `${message} (${body.detail})` : message
  return `Request failed: ${response.status}`
}

function errorText(err: unknown): string {
  if (err instanceof TypeError) return 'Cannot reach the server. Is the backend running?'
  return err instanceof Error ? err.message : 'Unknown error'
}

function App() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<NewCharacter>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    async function loadCharacters() {
      try {
        const response = await fetch(API_URL)
        if (!response.ok) throw new Error(await readError(response))
        const data: Character[] = await response.json()
        setCharacters(data)
      } catch (err) {
        setError(errorText(err))
      } finally {
        setLoading(false)
      }
    }
    loadCharacters()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    try {
      if (editingId) {
        const updated: Character = { id: editingId, ...form }
        const response = await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        })
        if (!response.ok) throw new Error(await readError(response))
        setCharacters((prev) => prev.map((c) => (c.id === editingId ? updated : c)))
      } else {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!response.ok) throw new Error(await readError(response))
        const created: Character = await response.json()
        setCharacters((prev) => [...prev, created])
      }
      cancelEdit()
    } catch (err) {
      setFormError(errorText(err))
    }
  }

  function startEdit(c: Character) {
    setEditingId(c.id)
    setForm({ name: c.name, class: c.class, level: c.level, health: c.health, mana: c.mana })
    setFormError(null)
  }

  async function handleDelete(c: Character) {
    if (!window.confirm(`Delete ${c.name}?`)) return
    setFormError(null)
    try {
      const response = await fetch(`${API_URL}/${c.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error(await readError(response))
      setCharacters((prev) => prev.filter((x) => x.id !== c.id))
      if (editingId === c.id) cancelEdit()
    } catch (err) {
      setFormError(errorText(err))
    }
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  return (
    <div>
      <h1>Characters</h1>
      {error && <p role="alert">Error loading characters: {error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          value={form.name}
          maxLength={20}
          required
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <select
          value={form.class}
          onChange={(e) => setForm({ ...form, class: e.target.value })}
        >
          {(CLASSES.includes(form.class) ? CLASSES : [...CLASSES, form.class]).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Level"
          value={form.level}
          min={1}
          max={50}
          required
          onChange={(e) => setForm({ ...form, level: Number(e.target.value) })}
        />
        <input
          type="number"
          placeholder="Health"
          value={form.health}
          min={1}
          required
          onChange={(e) => setForm({ ...form, health: Number(e.target.value) })}
        />
        <input
          type="number"
          placeholder="Mana"
          value={form.mana}
          min={0}
          required
          onChange={(e) => setForm({ ...form, mana: Number(e.target.value) })}
        />
        <button type="submit">{editingId ? 'Save Changes' : 'Add Character'}</button>
        {editingId && <button type="button" onClick={cancelEdit}>Cancel</button>}
        {formError && <p role="alert">Error: {formError}</p>}
      </form>
      {loading && (
        <p role="status">
          <span className="spinner" /> Loading characters...
        </p>
      )}
      <ul>
        {characters.map((c) => (
          <li key={c.id}>
            <strong>{c.name}</strong> — Class: {c.class} | Level: {c.level} | Health: {c.health} | Mana: {c.mana}{' '}
            <button onClick={() => startEdit(c)}>Edit</button>{' '}
            <button onClick={() => handleDelete(c)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
