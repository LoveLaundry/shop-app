import { useState, type FormEvent } from 'react'
import { dataApi, errorMessage } from '../api/client'
import { formatMoney } from '../api/hooks'
import { PageHeader, Panel } from '../ui/kit'

interface Line {
  item_name: string
  quantity: string
  unit_price: string
}

interface SavedBill {
  bill_number?: string
  grand_total?: number
  client_name?: string
}

const EMPTY_LINE: Line = { item_name: '', quantity: '1', unit_price: '' }

export function QuickBillPage() {
  const [clientName, setClientName] = useState('')
  const [lines, setLines] = useState<Line[]>([{ ...EMPTY_LINE }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState<SavedBill | null>(null)

  function updateLine(index: number, patch: Partial<Line>) {
    setLines((current) => current.map((line, i) => (i === index ? { ...line, ...patch } : line)))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (saving) return

    const items = lines
      .filter((line) => line.item_name.trim() && Number(line.quantity) > 0)
      .map((line) => ({
        item_name: line.item_name.trim(),
        quantity: Number(line.quantity),
        unit_price: Number(line.unit_price || 0),
      }))

    if (items.length === 0) {
      setError('Add at least one item with a name and a quantity.')
      return
    }

    setSaving(true)
    setError(null)
    setSaved(null)
    try {
      const response = await dataApi.post<SavedBill>('/shop-bills/quick-bill', {
        client_name: clientName.trim(),
        items,
      })
      setSaved(response.data)
      // Reset only after the server confirmed the bill exists.
      setClientName('')
      setLines([{ ...EMPTY_LINE }])
    } catch (caught) {
      setError(errorMessage(caught))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="Quick bill" subtitle="A counter sale without a customer record" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Panel>
          <label className="block max-w-sm">
            <span className="text-sm font-medium text-slate-700">Customer (optional)</span>
            <input
              value={clientName}
              onChange={(event) => setClientName(event.target.value)}
              placeholder="Walk-in"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </label>
        </Panel>

        <Panel>
          <div className="space-y-3">
            {lines.map((line, index) => (
              <div key={index} className="grid gap-2 sm:grid-cols-[2fr_80px_120px_40px]">
                <input
                  value={line.item_name}
                  onChange={(event) => updateLine(index, { item_name: event.target.value })}
                  placeholder="Item, e.g. Shirt"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                />
                <input
                  value={line.quantity}
                  onChange={(event) => updateLine(index, { quantity: event.target.value })}
                  inputMode="numeric"
                  placeholder="Qty"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums outline-none focus:border-slate-900"
                />
                <input
                  value={line.unit_price}
                  onChange={(event) => updateLine(index, { unit_price: event.target.value })}
                  inputMode="decimal"
                  placeholder="Unit price"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums outline-none focus:border-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setLines((current) => current.filter((_, i) => i !== index))}
                  disabled={lines.length === 1}
                  aria-label="Remove line"
                  className="rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setLines((current) => [...current, { ...EMPTY_LINE }])}
            className="mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
          >
            Add item
          </button>
        </Panel>

        {error ? (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {saved ? (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Bill {saved.bill_number ?? '(number pending)'} saved · total{' '}
            <strong>{formatMoney(saved.grand_total)}</strong> as calculated by the billing service.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save bill'}
        </button>
      </form>
    </>
  )
}
