import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Plus, Send, Trash2 } from 'lucide-react'
import {
  AutosaveIndicator,
  CharacterCounter,
  CollapsibleSection,
  DraftBanner,
  ErrorSummary,
  Field,
  Steps,
  useFeature,
} from '../features/feature-pack'
import {
  duplicateKeys,
  makeIdempotencyKey,
  normalizeError,
  pluralize,
  validateOrderLines,
  type OrderLineView,
} from '../features/feature-pack/utils'
import { useDraft, useFieldValidation, useSubmitGuard } from '../features/feature-pack/hooks'
import { useAuth } from '../auth/AuthContext'
import { Notice, PageHeader, Panel } from '../ui/kit'

const EMPTY: OrderLineView = { item_name: '', quantity: '', unit: 'pcs' }
const EMPTY_DRAFT = { lines: [{ ...EMPTY }], notes: '' }
const STEPS = ['Lines', 'Review', 'Send']

export function NewOrderPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast, announce, confirm, queueOrder } = useFeature()
  const scope = user?.laundry ?? user?.clientName ?? 'account'
  const draft = useDraft<typeof EMPTY_DRAFT>(`ll_shop_order_draft_${scope}`, EMPTY_DRAFT)
  const lines = draft.value.lines
  const notes = draft.value.notes
  const guard = useSubmitGuard()
  const [step, setStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [showAllErrors, setShowAllErrors] = useState(false)

  const errors = useMemo(() => validateOrderLines(lines), [lines])
  const validation = useFieldValidation(errors)
  const duplicates = useMemo(() => duplicateKeys(lines, (line) => line.item_name), [lines])
  const isValid = lines.length > 0 && Object.keys(errors).length === 0

  function updateLines(next: OrderLineView[]) {
    draft.setValue((current) => ({ ...current, lines: next }))
  }

  function update(index: number, patch: Partial<OrderLineView>) {
    updateLines(lines.map((line, i) => (i === index ? { ...line, ...patch } : line)))
  }

  function updateNotes(value: string) {
    draft.setValue((current) => ({ ...current, notes: value }))
  }

  async function removeLine(index: number) {
    const agreed = await confirm({
      title: 'Remove this line?',
      message: `Item ${index + 1} will be removed from this order. This cannot be undone after sending.`,
      confirmLabel: 'Remove line',
    })
    if (!agreed) return
    updateLines(lines.length === 1 ? [{ ...EMPTY }] : lines.filter((_, i) => i !== index))
    validation.resetTouched()
    announce(`Item ${index + 1} removed.`)
  }

  async function resetForm() {
    const agreed = await confirm({
      title: 'Reset this order?',
      message: 'All lines and notes will be cleared. A saved draft on this device will be discarded.',
      confirmLabel: 'Reset form',
    })
    if (!agreed) return
    draft.discard()
    validation.resetTouched()
    setStep(0)
    setError(null)
    setShowAllErrors(false)
    toast('Order form reset.', 'info')
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!isValid) {
      lines.forEach((_, index) => {
        validation.markTouched(`line-${index}-name`)
        validation.markTouched(`line-${index}-quantity`)
      })
      setStep(0)
      setShowAllErrors(true)
      announce('Fix the highlighted lines before continuing.')
      return
    }

    if (step === 0) {
      setStep(1)
      announce('Review the order before sending.')
      return
    }
    if (step !== 1) return

    // 36, 96, 97 — one idempotency key per logical order, reused by retries.
    const key = makeIdempotencyKey()
    const items = lines.map((line) => ({
      item_name: line.item_name.trim(),
      quantity: Number(line.quantity),
      unit: line.unit.trim() || 'pcs',
    }))
    const sent = await guard.run(key, async () => {
      setStep(2)
      announce('Order queued. You can return to the order list while it sends.')
      queueOrder({ items, notes: notes.trim() || null }, `${pluralize(items.length, 'line')} · ${items.length} item types`, key)
      draft.discard()
      navigate('/orders', { replace: true, state: { created: true } })
    })
    if (!sent) setError('This order is already being sent. Wait for the confirmation before trying again.')
  }

  const visibleErrors = showAllErrors ? errors : {}
  const totalPieces = lines.reduce((sum, line) => sum + (Number(line.quantity) > 0 ? Number(line.quantity) : 0), 0)

  return (
    <>
      <PageHeader
        title="New order"
        subtitle="Tell the laundry what you are sending. It stays a draft until they confirm receipt."
      />

      <Steps steps={STEPS} active={step} />

      <div className="fp-page-actions">
        <AutosaveIndicator status={draft.saveStatus} />
        <button type="button" className="btn btn-ghost" onClick={() => void resetForm()}>Reset form</button>
      </div>

      {draft.hasDraft ? <DraftBanner onRestore={draft.restore} onDiscard={draft.discard} /> : null}

      <form onSubmit={(event) => void submit(event)} noValidate className="space-y-5">
        {step === 0 ? (
          <Panel>
            <fieldset disabled={guard.busy} className="min-w-0">
              <legend className="sr-only">Order lines</legend>
              <ErrorSummary errors={visibleErrors} idFor={(key) => `order-${key}`} />

              <div className="space-y-3">
                {lines.map((line, index) => {
                  const nameError = validation.errorFor(`line-${index}-name`) ?? visibleErrors[`line-${index}-name`]
                  const quantityError = validation.errorFor(`line-${index}-quantity`) ?? visibleErrors[`line-${index}-quantity`]
                  return (
                    <div key={index} className="form-grid fp-order-line">
                      <Field
                        label={`Item ${index + 1}`}
                        htmlFor={`order-line-${index}-name`}
                        required
                        error={nameError}
                        help="Use the name your laundry recognises, for example 'Bed sheet'."
                      >
                        <input
                          id={`order-line-${index}-name`}
                          className="field-input"
                          placeholder="Bed sheet"
                          value={line.item_name}
                          aria-label={`Item ${index + 1} name`}
                          aria-invalid={Boolean(nameError)}
                          onChange={(event) => update(index, { item_name: event.target.value })}
                          onBlur={() => validation.markTouched(`line-${index}-name`)}
                        />
                      </Field>
                      <Field
                        label="Quantity"
                        htmlFor={`order-line-${index}-quantity`}
                        required
                        error={quantityError}
                        help="Whole pieces only. The laundry recounts on arrival."
                      >
                        <input
                          id={`order-line-${index}-quantity`}
                          className="field-input"
                          type="number"
                          min="1"
                          step="1"
                          inputMode="numeric"
                          placeholder="0"
                          value={line.quantity}
                          aria-label={`Item ${index + 1} quantity`}
                          aria-invalid={Boolean(quantityError)}
                          onChange={(event) => update(index, { quantity: event.target.value })}
                          onBlur={() => validation.markTouched(`line-${index}-quantity`)}
                        />
                      </Field>
                      <Field label="Unit" htmlFor={`order-line-${index}-unit`}>
                        <input
                          id={`order-line-${index}-unit`}
                          className="field-input"
                          placeholder="pcs"
                          value={line.unit}
                          aria-label={`Item ${index + 1} unit`}
                          onChange={(event) => update(index, { unit: event.target.value })}
                        />
                      </Field>
                      <div className="fp-order-remove">
                        <button
                          type="button"
                          onClick={() => void removeLine(index)}
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
                onClick={() => updateLines([...lines, { ...EMPTY }])}
                className="btn btn-ghost mt-3"
              >
                <Plus />
                Add another line
              </button>

              {duplicates.length > 0 ? (
                <div className="mt-3">
                  <Notice tone="warning" title="Repeated item names">
                    {pluralize(duplicates.length, 'name')} appear{duplicates.length === 1 ? 's' : ''} more than once: {duplicates.join(', ')}.
                    Combine them if that was not intentional.
                  </Notice>
                </div>
              ) : null}

              <div className="mt-4">
                <CollapsibleSection title="Notes for the laundry">
                  <label className="block" htmlFor="order-notes">
                    <span className="field-label">Anything the driver should know</span>
                    <textarea
                      id="order-notes"
                      rows={3}
                      maxLength={400}
                      className="field-input"
                      value={notes}
                      onChange={(event) => updateNotes(event.target.value)}
                      placeholder="Collection time, gate code, anything the driver should know"
                    />
                    <CharacterCounter value={notes} max={400} />
                  </label>
                </CollapsibleSection>
              </div>
            </fieldset>
          </Panel>
        ) : (
          <Panel>
            <p className="fp-detail-subtitle">Review before sending</p>
            <div className="fp-detail-grid">
              <div><span>Lines</span><strong>{pluralize(lines.length, 'line')}</strong></div>
              <div><span>Total pieces</span><strong>{totalPieces}</strong></div>
            </div>
            <div className="data-table-wrap mt-3">
              <table className="data-table">
                <caption className="sr-only">Order lines for review</caption>
                <thead><tr><th scope="col">Item</th><th scope="col">Quantity</th><th scope="col">Unit</th></tr></thead>
                <tbody>
                  {lines.map((line, index) => (
                    <tr key={index}>
                      <td>{line.item_name}</td>
                      <td className="tabular-nums">{line.quantity}</td>
                      <td>{line.unit.trim() || 'pcs'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {notes.trim() ? <p className="fp-detail-notes">Notes: {notes.trim()}</p> : null}
            <button type="button" className="btn btn-ghost mt-3" onClick={() => setStep(0)}>
              <ArrowLeft /> Edit lines
            </button>
          </Panel>
        )}

        {error ? (
          <Notice tone="danger" title="Check the order before sending">
            {normalizeError(error)}
          </Notice>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={guard.busy || (step === 0 && !isValid)} className="btn btn-primary">
            <Send />
            {guard.busy ? 'Sending…' : step === 0 ? 'Review order' : step === 1 ? 'Send order' : 'Queued'}
          </button>
          <button
            type="button"
            onClick={() => (step === 1 ? setStep(0) : void navigate('/orders'))}
            disabled={guard.busy}
            className="btn btn-secondary"
          >
            <ArrowLeft />
            {step === 1 ? 'Back' : 'Cancel'}
          </button>
          {step === 1 ? (
            <span className="fp-autosave" aria-hidden="true"><ArrowRight /> Sends as soon as you confirm</span>
          ) : null}
        </div>
      </form>
    </>
  )
}
