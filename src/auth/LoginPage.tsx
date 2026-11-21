import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { errorMessage } from '../api/client'
import { appConfig } from '../config/app'
import type { Association } from './associations'
import { LaundryChoiceRequired, useAuth } from './AuthContext'

export function LoginPage() {
  const { isAuthenticated, signIn } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Set when the same login exists under several laundries: we hold the
  // credentials and ask which one, instead of guessing and showing the wrong
  // company's figures.
  const [choices, setChoices] = useState<Association[] | null>(null)

  if (isAuthenticated) return <Navigate to="/" replace />

  const isClient = appConfig.authKind === 'client'
  const sideLabel = appConfig.clientType === 'SHOP' ? 'Shop login' : 'Hotel login'

  async function attempt(laundryId?: string) {
    if (pending) return
    setPending(true)
    setError(null)
    try {
      await signIn({ username, password, laundryId })
    } catch (caught) {
      if (caught instanceof LaundryChoiceRequired) {
        setChoices(caught.laundries)
      } else {
        setError(caught instanceof Error && caught.message ? caught.message : errorMessage(caught))
      }
    } finally {
      setPending(false)
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    void attempt()
  }

  return (
    <main className="auth-layout">
      <div className="auth-card">
        <div className="auth-head">
          <p className="auth-kicker">Secure access</p>
          <h1 className="auth-title">{appConfig.title}</h1>
          <p className="auth-subtitle">{appConfig.tagline}</p>
        </div>

        {choices ? (
          <div className="auth-panel">
            <h2 className="panel-title">Choose a laundry</h2>
            <p className="panel-note">
              This login is registered with more than one laundry. Each one keeps its own
              records.
            </p>
            <div className="choice-list">
              {choices.map((choice) => (
                <button
                  key={`${choice.laundry_id}-${choice.client_name}`}
                  type="button"
                  disabled={pending || choice.status.toUpperCase() !== 'ACTIVE'}
                  onClick={() => void attempt(choice.laundry_id)}
                  className="choice-button"
                >
                  <span>
                    <span className="block font-medium text-slate-900">
                      {choice.laundry_name || choice.laundry_id}
                    </span>
                    <span className="block text-xs text-slate-500">{choice.client_name}</span>
                  </span>
                  {choice.status.toUpperCase() !== 'ACTIVE' ? (
                    <span className="chip">{choice.status}</span>
                  ) : null}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setChoices(null)} className="btn btn-ghost" style={{ marginTop: '0.9rem' }}>
              Use a different login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-panel">
            <div className="auth-fields">
              <label className="block">
                <span className="field-label">{isClient ? sideLabel : 'Username'}</span>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  required
                  className="field-input"
                />
              </label>

              <label className="block">
                <span className="field-label">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  className="field-input"
                />
              </label>

              {error ? (
                <p role="alert" className="auth-error">
                  {error}
                </p>
              ) : null}

              <button type="submit" disabled={pending} className="btn btn-primary btn-block">
                {pending ? 'Signing in…' : 'Sign in'}
              </button>

              <p className="auth-foot">
                Don't have an account? Contact your platform administrator.
              </p>
            </div>
          </form>
        )}

        <p className="auth-foot">
          <Link to="/about" className="text-link">
            About this portal
          </Link>
        </p>
      </div>
    </main>
  )
}
