import { useMemo, useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ArrowRight, Building2, Info, ShieldCheck, UserRound } from 'lucide-react'
import { appConfig } from '../config/app'
import { AuthVisual } from '../ui/AuthVisual'
import { Field, PasswordField, useFeature } from '../features/feature-pack'
import {
  friendlyRole,
  isActiveAssociation,
  normalizeError,
  validateLogin,
} from '../features/feature-pack/utils'
import { useFieldValidation, useSubmitGuard } from '../features/feature-pack/hooks'
import type { Association } from './associations'
import { LaundryChoiceRequired, useAuth } from './AuthContext'

export function LoginPage() {
  const { isAuthenticated, signIn, lastSignIn } = useAuth()
  const { toast, announce } = useFeature()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  // 53 — Credentials are held only until one laundry is chosen; no token is
  // written before the server confirms the scoped account.
  const [choices, setChoices] = useState<Association[] | null>(null)
  const guard = useSubmitGuard()
  const errors = useMemo(() => validateLogin(username, password), [username, password])
  const validation = useFieldValidation(errors)
  const canSubmit = Object.keys(errors).length === 0 && !guard.busy

  if (isAuthenticated) return <Navigate to="/" replace />

  const isClient = appConfig.authKind === 'client'
  const sideLabel = appConfig.clientType === 'SHOP' ? 'Shop login' : 'Hotel login'

  async function attempt(laundryId?: string) {
    const key = `${username.trim()}:${password.length}:${laundryId ?? ''}`
    const sent = await guard.run(key, async () => {
      setError(null)
      try {
        await signIn({ username, password, laundryId })
        toast('Signed in. Welcome back.', 'success')
        announce('Signed in successfully.')
      } catch (caught) {
        if (caught instanceof LaundryChoiceRequired) {
          setChoices(caught.laundries)
          announce(`${caught.laundries.length} laundry accounts need a choice.`)
        } else {
          setError(normalizeError(caught))
          announce('Sign in failed. Check the message below.')
        }
        throw caught
      }
    })
    // Let the user correct the form or pick a different laundry after a fail.
    if (!sent) guard.reset()
    else if (laundryId) guard.reset()
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSubmit) {
      validation.markTouched('username')
      validation.markTouched('password')
      announce('Enter a username and password before signing in.')
      return
    }
    void attempt().catch(() => undefined)
  }

  return (
    <main className="auth-layout" id="main-content" tabIndex={-1}>
      <div className="auth-frame">
        <AuthVisual />

        <div className="auth-card">
          <div className="auth-head">
            <p className="auth-kicker">Secure access</p>
            <h1 className="auth-title">{appConfig.title}</h1>
            <p className="auth-subtitle">{appConfig.tagline}</p>
            <p className="fp-login-meta">
              <span className="chip">{appConfig.clientType} account</span>
              {lastSignIn ? <span>Last sign-in {lastSignIn.username}</span> : null}
            </p>
          </div>

          {choices ? (
            <div className="auth-panel">
              <h2 className="panel-title">Choose a laundry</h2>
              <p className="panel-note">
                This login is registered with more than one laundry. Each one keeps its own records.
              </p>
              <div className="choice-list" role="group" aria-label="Laundry choices">
                {choices.map((choice) => {
                  const active = isActiveAssociation(choice)
                  return (
                    <button
                      key={`${choice.laundry_id}-${choice.client_name}`}
                      type="button"
                      disabled={guard.busy || !active}
                      onClick={() => void attempt(choice.laundry_id).catch(() => undefined)}
                      className="choice-button"
                      aria-label={`${choice.laundry_name || choice.laundry_id}, ${friendlyRole(choice.role_id)}${active ? '' : ', suspended'}`}
                    >
                      <span className="flex items-center gap-2">
                        <Building2 size={16} className="text-accent" aria-hidden="true" />
                        <span>
                          <span className="block font-medium">{choice.laundry_name || choice.laundry_id}</span>
                          <span className="block text-xs text-slate-400">
                            {choice.client_name || 'Customer account'} · {friendlyRole(choice.role_id)}
                          </span>
                        </span>
                      </span>
                      {active ? <ArrowRight size={15} aria-hidden="true" /> : <span className="chip chip-danger">{choice.status.toLowerCase()}</span>}
                    </button>
                  )
                })}
              </div>
              <button
                type="button"
                onClick={() => {
                  setChoices(null)
                  guard.reset()
                }}
                className="btn btn-ghost"
                style={{ marginTop: '0.9rem' }}
              >
                Use a different login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-panel" noValidate>
              <div className="auth-fields">
                <Field
                  label={isClient ? sideLabel : 'Username'}
                  htmlFor="login-username"
                  required
                  error={validation.errorFor('username')}
                  help="Use the account username issued by your administrator."
                >
                  <span className="input-with-icon">
                    <UserRound className="input-icon" aria-hidden="true" />
                    <input
                      id="login-username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      onBlur={() => validation.markTouched('username')}
                      autoComplete="username"
                      className="field-input"
                      placeholder="Your account username"
                      aria-invalid={Boolean(validation.errorFor('username'))}
                      aria-describedby={validation.errorFor('username') ? 'login-username-error' : undefined}
                    />
                  </span>
                </Field>

                <PasswordField
                  id="login-password"
                  label="Password"
                  value={password}
                  onChange={setPassword}
                  onBlur={() => validation.markTouched('password')}
                  error={validation.errorFor('password')}
                  showStrength
                />

                {error ? (
                  <p role="alert" className="auth-error" aria-live="assertive">
                    <ShieldCheck aria-hidden="true" />
                    {error}
                  </p>
                ) : null}

                <button type="submit" disabled={!canSubmit} className="btn btn-primary btn-block">
                  {guard.busy ? 'Signing in…' : 'Sign in'}
                  {!guard.busy ? <ArrowRight aria-hidden="true" /> : null}
                </button>

                <p className="auth-foot">
                  Don't have an account? Contact your platform administrator.
                </p>
              </div>
            </form>
          )}

          <p className="auth-foot">
            <Link to="/about" className="text-link">
              <Info aria-hidden="true" />
              About this portal
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
