import { Link } from 'react-router-dom'
import { appConfig } from '../config/app'
import { useAuth } from '../auth/AuthContext'

export function AboutPage() {
  const { isAuthenticated } = useAuth()
  const isShop = appConfig.clientType === 'SHOP'

  return (
    <main className="about-layout">
      <div className="about-card">
        <div className="about-brand">
          <span className="about-mark" aria-hidden="true">
            LL
          </span>
          <div>
            <p className="about-name">LoveLaundry</p>
            <p className="about-role">Platform operator</p>
          </div>
        </div>

        <div className="about-body">
          <p className="auth-kicker">About this portal</p>
          <h1 className="auth-title">{appConfig.title}</h1>
          <p className="auth-subtitle">{appConfig.tagline}</p>

          <p className="about-copy">
            {isShop
              ? 'This portal gives your shop a clear, scoped view of orders, bills and balances with the laundry account you sign in under.'
              : 'This portal gives your property a clear, scoped view of gate passes, linen tags, deliveries and invoices with the laundry account you sign in under.'}
          </p>

          <p className="about-copy">
            It is operated by LoveLaundry as part of its laundry management platform. Records are
            isolated per laundry, and access is issued by your platform administrator.
          </p>

          <dl className="about-meta">
            <div>
              <dt>Portal</dt>
              <dd>{appConfig.title}</dd>
            </div>
            <div>
              <dt>Account type</dt>
              <dd>{isShop ? 'Shop' : 'Hotel'}</dd>
            </div>
            <div>
              <dt>Operator</dt>
              <dd>LoveLaundry</dd>
            </div>
          </dl>
        </div>

        <div className="about-actions">
          <Link to={isAuthenticated ? '/' : '/login'} className="btn btn-primary">
            {isAuthenticated ? 'Back to portal' : 'Back to sign in'}
          </Link>
        </div>
      </div>
    </main>
  )
}
