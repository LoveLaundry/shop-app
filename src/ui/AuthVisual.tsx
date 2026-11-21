import { CircleCheck, ReceiptText, Shirt, Truck, WashingMachine } from 'lucide-react'
import { appConfig } from '../config/app'

export function AuthVisual({
  title,
  copy,
}: {
  title?: string
  copy?: string
}) {
  const isShop = appConfig.clientType === 'SHOP'

  return (
    <aside className="auth-visual" aria-hidden="true">
      <div className="visual-top">
        <span className="visual-mark">
          <WashingMachine />
        </span>
        <div>
          <p className="visual-kicker">{isShop ? 'Shop portal' : 'Hotel desk'}</p>
          <p className="visual-title">Operations overview</p>
        </div>
      </div>

      <div className="visual-checks">
        <p className="visual-check">
          <CircleCheck />
          <span>{isShop ? 'Bills and balances kept in one place' : 'Gate passes and deliveries in one place'}</span>
        </p>
        <p className="visual-check">
          <ReceiptText />
          <span>{isShop ? 'Order history with each laundry' : 'Invoices with each laundry'}</span>
        </p>
        <p className="visual-check">
          <Truck />
          <span>Clear records for every handoff</span>
        </p>
        <p className="visual-check">
          <Shirt />
          <span>Linen and item counts you can trust</span>
        </p>
      </div>

      <div className="visual-caption">
        <h2>{title ?? 'A calmer way to run your laundry account.'}</h2>
        <p>
          {copy ??
            'A focused workspace for your team, with only the records that belong to your account.'}
        </p>
      </div>
    </aside>
  )
}
