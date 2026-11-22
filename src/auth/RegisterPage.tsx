import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Info, Mail, ShieldAlert } from 'lucide-react'
import { appConfig } from '../config/app'
import { AuthVisual } from '../ui/AuthVisual'
import { CharacterCounter, ErrorSummary, Field, useFeature } from '../features/feature-pack'
import { useFieldValidation } from '../features/feature-pack/hooks'
import { normalizeError, validateAccessRequest, type AccessRequestView } from '../features/feature-pack/utils'

const EMPTY: AccessRequestView = { name: '', email: '', laundry: '', reason: '' }

export function RegisterPage() {
  const { toast, announce, safeSignOut } = useFeature()
  const [form, setForm] = useState<AccessRequestView>(EMPTY)
  const [submitted, setSubmitted] = useState(false)
  const errors = useMemo(() => validateAccessRequest(form), [form])
  const validation = useFieldValidation(errors)
  const errorList = submitted ? errors : {}

  function update(key: keyof AccessRequestView, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function summary(): string {
    return [
      'Shop portal access request',
      `Account type: ${appConfig.clientType}`,
      `Name: ${form.name.trim()}`,
      `Work email: ${form.email.trim()}`,
      `Laundry / account: ${form.laundry.trim()}`,
      '',
      'Why access is needed:',
      form.reason.trim(),
    ].join('\n')
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (Object.keys(errors).length > 0) {
      announce(`${Object.keys(errors).length} fields need attention before the request can be prepared.`)
      return
    }
    announce('Access request is ready. Copy it or open an email draft.')
  }

  async function copyRequest() {
    try {
      await navigator.clipboard.writeText(summary())
      toast('Access request copied to the clipboard.', 'success')
    } catch (caught) {
      toast(normalizeError(caught) === 'Something went wrong. Try again.' ? 'Clipboard access was blocked in this browser.' : normalizeError(caught), 'error')
    }
  }

  return (
    <main className="auth-layout" id="main-content" tabIndex={-1}>
      <div className="auth-frame">
        <AuthVisual
          title="Access is managed, not improvised."
          copy="Accounts are provisioned by your platform administrator so every login has the correct scope from day one."
        />

        <div className="auth-card">
          <div className="auth-head">
            <p className="auth-kicker">Account access</p>
            <h1 className="auth-title">Registration</h1>
            <p className="auth-subtitle">{appConfig.title}</p>
            <p className="fp-login-meta"><span className="chip">{appConfig.clientType} account</span></p>
          </div>

          <div className="auth-panel">
            <div className="notice">
              <ShieldAlert aria-hidden="true" />
              <div>
                <strong>Managed administrator accounts</strong>
                <p style={{ margin: 0 }}>
                  Shop accounts are created directly by the platform administrator. This form
                  prepares the details they need; it does not create an account itself.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="fp-request-form">
              <ErrorSummary errors={errorList} idFor={(key) => `request-${key}`} />

              <Field label="Full name" htmlFor="request-name" required error={validation.errorFor('name') ?? errorList.name}>
                <input
                  id="request-name"
                  className="field-input"
                  value={form.name}
                  onChange={(event) => update('name', event.target.value)}
                  onBlur={() => validation.markTouched('name')}
                  autoComplete="name"
                  aria-invalid={Boolean(validation.errorFor('name') ?? errorList.name)}
                />
              </Field>

              <Field label="Work email" htmlFor="request-email" required error={validation.errorFor('email') ?? errorList.email}>
                <input
                  id="request-email"
                  type="email"
                  className="field-input"
                  value={form.email}
                  onChange={(event) => update('email', event.target.value)}
                  onBlur={() => validation.markTouched('email')}
                  autoComplete="email"
                  aria-invalid={Boolean(validation.errorFor('email') ?? errorList.email)}
                />
              </Field>

              <Field label="Laundry or account name" htmlFor="request-laundry" required error={validation.errorFor('laundry') ?? errorList.laundry}>
                <input
                  id="request-laundry"
                  className="field-input"
                  value={form.laundry}
                  onChange={(event) => update('laundry', event.target.value)}
                  onBlur={() => validation.markTouched('laundry')}
                  aria-invalid={Boolean(validation.errorFor('laundry') ?? errorList.laundry)}
                />
              </Field>

              <Field label="Why access is needed" htmlFor="request-reason" required error={validation.errorFor('reason') ?? errorList.reason}>
                <textarea
                  id="request-reason"
                  rows={3}
                  className="field-input"
                  value={form.reason}
                  onChange={(event) => update('reason', event.target.value)}
                  onBlur={() => validation.markTouched('reason')}
                  aria-invalid={Boolean(validation.errorFor('reason') ?? errorList.reason)}
                />
                <CharacterCounter value={form.reason} max={400} />
              </Field>

              <div className="fp-row-actions">
                <button type="submit" className="btn btn-primary">Prepare request</button>
                <button type="button" className="btn btn-secondary" onClick={() => void copyRequest()} disabled={Object.keys(errors).length > 0}>
                  Copy details
                </button>
                <a
                  className="btn btn-ghost"
                  aria-disabled={Object.keys(errors).length > 0}
                  onClick={(event) => {
                    if (Object.keys(errors).length > 0) event.preventDefault()
                  }}
                  href={`mailto:?subject=${encodeURIComponent('Shop portal access request')}&body=${encodeURIComponent(summary())}`}
                >
                  <Mail aria-hidden="true" /> Email draft
                </a>
              </div>
            </form>

            <div className="fp-row-actions" style={{ marginTop: '1rem' }}>
              <Link to="/login" className="btn btn-secondary">
                <ArrowLeft />
                Return to sign in
              </Link>
              {/* 64 — No support mode exists here; the safe exit is sign-out. */}
              <button type="button" className="btn btn-ghost" onClick={safeSignOut}>Sign out safely</button>
            </div>
          </div>

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
