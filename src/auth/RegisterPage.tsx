import { Link } from 'react-router-dom'
import { ArrowLeft, Info, ShieldAlert } from 'lucide-react'
import { appConfig } from '../config/app'
import { AuthVisual } from '../ui/AuthVisual'

export function RegisterPage() {
  return (
    <main className="auth-layout">
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
          </div>

          <div className="auth-panel">
            <div className="notice">
              <ShieldAlert aria-hidden="true" />
              <div>
                <strong>Managed administrator accounts</strong>
                <p style={{ margin: 0 }}>
                  Laundry, shop, and hotel administrator accounts are created directly by the platform
                  administrator.
                </p>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.72rem', opacity: 0.85 }}>
                  If you require access or staff credentials, please contact your laundry platform
                  administrator.
                </p>
              </div>
            </div>

            <Link to="/login" className="btn btn-primary btn-block" style={{ marginTop: '1rem' }}>
              <ArrowLeft />
              Return to sign in
            </Link>
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
