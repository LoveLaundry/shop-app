import { Link } from 'react-router-dom'
import { appConfig } from '../config/app'

export function RegisterPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Love Laundry
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Shop Account Registration
          </h1>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-semibold mb-1">Managed Administrator Accounts</p>
            <p>
              In accordance with system policy, laundry, shop, and hotel administrator accounts
              must be created directly by the platform administrator.
            </p>
            <p className="mt-2 text-xs text-amber-700">
              If you require access or staff credentials, please contact your laundry platform administrator.
            </p>
          </div>

          <Link
            to="/login"
            className="block w-full rounded-lg bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Return to Sign In
          </Link>
        </div>
      </div>
    </main>
  )
}
