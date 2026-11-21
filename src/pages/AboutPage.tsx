import { Link } from 'react-router-dom'
import { ArrowRight, BadgeCheck, Building2, Info, ShieldCheck, Store, WashingMachine } from 'lucide-react'
import { appConfig } from '../config/app'
import { useAuth } from '../auth/AuthContext'

export function AboutPage() {
  const { isAuthenticated } = useAuth()
  const isShop = appConfig.clientType === 'SHOP'

  return (
    <main className="about-layout">
      <div className="about-card">
        <div className="about-banner">
          <span className="about-banner-icon" aria-hidden="true">
            <WashingMachine />
          </span>
          <div>
            <h2>Built for daily laundry operations</h2>
            <p>Scoped records, clear handoffs and a focused workspace.</p>
          </div>
        </div>

        <div className="about-brand">
          <span className="about-mark" aria-hidden="true">
            LL
          </span>
          <div>
            <p className="about-name">LoveLaundry</p>
            <p className="about-role">Platform operator</p>
          </div>
          <BadgeCheck size={17} style={{ marginLeft: 'auto', color: 'var(--accent)' }} aria-hidden="true" />
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
              <dt><Info size={12} aria-hidden="true" /> Portal</dt>
              <dd>{appConfig.title}</dd>
            </div>
            <div>
              <dt>
                {isShop ? <Store size={12} aria-hidden="true" /> : <Building2 size={12} aria-hidden="true" />}
                {' '}Account type
              </dt>
              <dd>{isShop ? 'Shop' : 'Hotel'}</dd>
            </div>
            <div>
              <dt><ShieldCheck size={12} aria-hidden="true" /> Operator</dt>
              <dd>LoveLaundry</dd>
            </div>
          </dl>
        </div>

        <div className="about-actions">
          <Link to={isAuthenticated ? '/' : '/login'} className="btn btn-primary">
            {isAuthenticated ? 'Back to portal' : 'Back to sign in'}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </main>
  )
}
