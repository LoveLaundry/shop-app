import { useMemo, useState } from 'react'
import { Copy, Search } from 'lucide-react'
import { FEATURE_AREAS, FEATURE_MANIFEST, filterFeatures, type FeatureEntry } from './manifest'
import { formatNumber, pluralize } from './utils'
import { useDebouncedValue } from './hooks'

/** 100 — The manifest is rendered from the same list that builds this document. */
export function FeaturePanel({ onToast }: { onToast?: (message: string) => void }) {
  const [term, setTerm] = useState('')
  const [area, setArea] = useState<FeatureEntry['area'] | 'All'>('All')
  const debounced = useDebouncedValue(term, 150)
  const features = useMemo(() => filterFeatures(debounced, area), [debounced, area])

  async function copyManifest() {
    const lines = FEATURE_MANIFEST.map((feature) => `${feature.id}. ${feature.title} — ${feature.detail} (${feature.file})`)
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      onToast?.(`Copied ${pluralize(FEATURE_MANIFEST.length, 'feature')} to the clipboard.`)
    } catch {
      onToast?.('Clipboard access was blocked. Copy is unavailable in this browser.')
    }
  }

  return (
    <div className="fp-manifest">
      <div className="fp-manifest-tools">
        <label className="fp-search" htmlFor="fp-feature-search">
          <span className="sr-only">Search features</span>
          <Search aria-hidden="true" />
          <input
            id="fp-feature-search"
            className="field-input"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search features by name, area or file…"
            autoComplete="off"
          />
        </label>
        <label className="fp-toolbar-field">
          <span className="sr-only">Filter by area</span>
          <select
            className="field-input select-input"
            value={area}
            onChange={(event) => setArea(event.target.value as FeatureEntry['area'] | 'All')}
          >
            <option value="All">All areas</option>
            {FEATURE_AREAS.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <button type="button" className="btn btn-secondary" onClick={() => void copyManifest()}>
          <Copy aria-hidden="true" /> Copy list
        </button>
      </div>

      <p className="fp-manifest-count" aria-live="polite">
        Showing {formatNumber(features.length)} of {formatNumber(FEATURE_MANIFEST.length)} shipped features
      </p>

      <ol className="fp-manifest-list">
        {features.map((feature) => (
          <li key={feature.id} className="fp-manifest-item">
            <span className="fp-manifest-number" aria-hidden="true">{String(feature.id).padStart(3, '0')}</span>
            <div>
              <div className="fp-manifest-heading">
                <strong>{feature.title}</strong>
                <span className="chip">{feature.area}</span>
              </div>
              <p>{feature.detail}</p>
              <code>{feature.file}</code>
            </div>
          </li>
        ))}
        {features.length === 0 ? <li className="fp-manifest-empty">No features match that search.</li> : null}
      </ol>
    </div>
  )
}
