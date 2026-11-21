import { Link } from 'react-router-dom'
import { appConfig } from '../config/app'

export function RegisterPage() {
  return (
    <main className="auth-layout">
      <div className="auth-card">
        <div className="auth-head">
          <p className="auth-kicker">Account access</p>
          <h1 className="auth-title">Registration</h1>
          <p className="auth-subtitle">{appConfig.title}</p>
        </div>

        <div className="auth-panel">
          <div className="notice">
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

          <Link to="/login" className="btn btn-primary btn-block" style={{ marginTop: '1rem' }}>
            Return to sign in
          </Link>
        </div>

        <p className="auth-foot">
          <Link to="/about" className="text-link">
            About this portal
          </Link>
        </p>
      </div>
    </main>
  )
}
