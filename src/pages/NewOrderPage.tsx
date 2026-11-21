import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Send, Trash2 } from 'lucide-react'
import { dataApi, errorMessage } from '../api/client'
import { Notice, PageHeader, Panel } from '../ui/kit'

interface Line {
  item_name: string
  quantity: string
  unit: string
}

const EMPTY: Line = { item_name: '', quantity: '', unit: 'pcs' }

export function NewOrderPage() {
  const navigate = useNavigate()
  const [lines, setLines] = useState<Line[]>([{ ...EMPTY }])
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showValidation, setShowValidation] = useState(false)

  function update(index: number, patch: Partial<Line>) {
    setLines((current) => current.map((line, i) => (i === index ? { ...line, ...patch } : line)))
  }

  function isLineValid(line: Line): boolean {
    return Boolean(line.item_name.trim()) && Number(line.quantity) > 0
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setShowValidation(true)

    const items = lines
      .filter(isLineValid)
      .map((line) => ({
        item_name: line.item_name.trim(),
        quantity: Number(line.quantity),
        unit: line.unit.trim() || 'pcs',
      }))

    if (items.length === 0 || items.length !== lines.length) {
      setError('Give every line an item name and a quantity above zero, or remove the empty line.')
      return
    }

    setBusy(true)
    try {
      await dataApi.post('/client-portal/shop/orders', { items, notes: notes.trim() || null })
      navigate('/orders', { replace: true, state: { created: true } })
    } catch (caught) {
      // The server validates quantities and rejects a hotel session here, so
      // its message is more useful than anything that could be guessed.
      setError(errorMessage(caught))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader
        title="New order"
        subtitle="Tell the laundry what you are sending. It stays a draft until they confirm receipt."
      />

      <form onSubmit={submit} noValidate className="space-y-5">
        <Panel>
          <fieldset disabled={busy} className="min-w-0">
            <legend className="sr-only">Order lines</legend>
            <div className="space-y-3">
              {lines.map((line, index) => {
                const invalid = showValidation && !isLineValid(line)
                return (
                  <div key={index} className="form-grid">
                    <label className="span-6 block">
                      <span className="field-label">Item {index + 1}</span>
                      <input
                        className="field-input"
                        placeholder="Bed sheet"
                        value={line.item_name}
                        aria-invalid={invalid}
                        aria-label={`Item ${index + 1} name`}
                        onChange={(event) => update(index, { item_name: event.target.value })}
                      />
                    </label>
                    <label className="span-3 block">
                      <span className="field-label">Quantity</span>
                      <input
                        className="field-input"
                        type="number"
                        min="1"
                        step="1"
                        inputMode="numeric"
                        placeholder="0"
                        value={line.quantity}
                        aria-invalid={invalid}
                        aria-label={`Item ${index + 1} quantity`}
                        onChange={(event) => update(index, { quantity: event.target.value })}
                      />
                    </label>
                    <label className="span-2 block">
                      <span className="field-label">Unit</span>
                      <input
                        className="field-input"
                        placeholder="pcs"
                        value={line.unit}
                        aria-label={`Item ${index + 1} unit`}
                        onChange={(event) => update(index, { unit: event.target.value })}
                      />
                    </label>
                    <div className="span-1 flex items-end justify-center">
                      <button
                        type="button"
                        onClick={() =>
                          setLines((current) =>
                            current.length === 1 ? [{ ...EMPTY }] : current.filter((_, i) => i !== index),
                          )
                        }
                        disabled={lines.length === 1}
                        className="btn btn-secondary"
                        aria-label={lines.length === 1 ? 'At least one line is required' : `Remove item ${index + 1}`}
                        title={lines.length === 1 ? 'At least one line is required' : 'Remove line'}
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              type="button"
              onClick={() => setLines((current) => [...current, { ...EMPTY }])}
              className="btn btn-ghost mt-3"
            >
              <Plus />
              Add another line
            </button>

            <label className="mt-4 block" htmlFor="order-notes">
              <span className="field-label">Notes for the laundry</span>
              <textarea
                id="order-notes"
                rows={3}
                className="field-input"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Collection time, gate code, anything the driver should know"
              />
            </label>
          </fieldset>
        </Panel>

        {error ? (
          <Notice tone="danger" title="Check the order before sending">
            {error}
          </Notice>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={busy} className="btn btn-primary">
            <Send />
            {busy ? 'Sending…' : 'Send order'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/orders')}
            disabled={busy}
            className="btn btn-secondary"
          >
            <ArrowLeft />
            Cancel
          </button>
        </div>
      </form>
    </>
  )
}
