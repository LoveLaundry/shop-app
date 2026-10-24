import { useState } from 'react'
import { formatMoney, useQuery } from '../api/hooks'
import { PageHeader, Panel, StateBox } from '../ui/kit'

interface DayCloseSnapshot {
  id?: string
  entity_id?: string
  occurred_at?: string
  payload?: Record<string, unknown>
  [key: string]: unknown
}

function todayIso(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

export function DayClosePage() {
  const [date, setDate] = useState(todayIso())
  const { data, error, loading, reload } = useQuery<DayCloseSnapshot | null>('/day-close', { date })

  return (
    <>
      <PageHeader title="Day close" subtitle="The recorded snapshot for a business day" />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Business day</span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          />
        </label>
        <button
          onClick={reload}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      <StateBox loading={loading} error={error} onRetry={reload}>
        {data ? (
          <Panel>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Closed at
            </p>
            <p className="mt-1 text-lg font-semibold">
              {typeof data.occurred_at === 'string'
                ? new Date(data.occurred_at).toLocaleString('en-GB')
                : '—'}
            </p>

            <dl className="mt-5 grid gap-3 sm:grid-cols-3">
              {Object.entries(data.payload ?? {})
                .filter(([, value]) => typeof value === 'number' || typeof value === 'string')
                .slice(0, 12)
                .map(([key, value]) => (
                  <div key={key} className="rounded-xl bg-slate-50 px-3 py-2">
                    <dt className="text-[11px] uppercase tracking-wide text-slate-500">
                      {key.replaceAll('_', ' ')}
                    </dt>
                    <dd className="mt-0.5 text-sm font-semibold tabular-nums">
                      {typeof value === 'number' && /amount|total|cash|revenue|paid/.test(key)
                        ? formatMoney(value)
                        : String(value)}
                    </dd>
                  </div>
                ))}
            </dl>
          </Panel>
        ) : (
          <Panel>
            <p className="text-sm text-slate-600">
              No day close has been recorded for {date}. Closing the day is a deliberate,
              staff-only action; this screen only displays the snapshot.
            </p>
          </Panel>
        )}
      </StateBox>
    </>
  )
}
