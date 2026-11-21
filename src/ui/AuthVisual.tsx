import { ReceiptText, Shirt, Sparkles, Truck, WashingMachine } from 'lucide-react'
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
      <span className="visual-pill">
        <Sparkles />
        Operations, in focus
      </span>

      <div className="visual-orbit">
        <span className="visual-core">
          <WashingMachine />
        </span>
        <span className="visual-node node-a">
          <ReceiptText />
        </span>
        <span className="visual-node node-b">
          <Truck />
        </span>
        <span className="visual-node node-c">
          <Shirt />
        </span>
        <span className="visual-node node-d">
          <Sparkles />
        </span>
      </div>

      <div className="visual-caption">
        <h2>{title ?? (isShop ? 'Every order, bill and balance in view.' : 'Every handoff, tracked with confidence.')}</h2>
        <p>
          {copy ??
            (isShop
              ? 'A calmer workspace for shop teams to follow what moves between their business and the laundry.'
              : 'A calmer workspace for hotel teams to coordinate linens, gate passes and deliveries.')}
        </p>
      </div>
    </aside>
  )
}
