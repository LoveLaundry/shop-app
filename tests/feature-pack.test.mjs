import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'

/** Load a dependency-free TypeScript module without adding a test runner. */
async function loadTs(relativePath) {
  const path = new URL(`../src/features/feature-pack/${relativePath}`, import.meta.url)
  const source = readFileSync(path, 'utf8')
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText
  return import(`data:text/javascript;base64,${Buffer.from(output).toString('base64')}`)
}

const u = await loadTs('utils.ts')
const { FEATURE_MANIFEST, filterFeatures } = await loadTs('manifest.ts')

test('manifest ships exactly 100 uniquely numbered features', () => {
  assert.equal(FEATURE_MANIFEST.length, 100)
  assert.equal(new Set(FEATURE_MANIFEST.map((f) => f.id)).size, 100)
  assert.deepEqual(FEATURE_MANIFEST.map((f) => f.id), Array.from({ length: 100 }, (_, i) => i + 1))
  assert.equal(filterFeatures('pagination', 'Tables').length > 0, true)
  assert.equal(filterFeatures('', 'Shell').length > 0, true)
})

test('association candidates default to ACTIVE and a shop role', () => {
  const [row] = u.normalizeAssociations([{ laundry_id: 'L1', laundry_name: 'Central' }])
  assert.equal(row.status, 'ACTIVE')
  assert.equal(row.role_id, 'SHOP_STAFF')
  assert.equal(row.client_type, 'SHOP')
  assert.equal(u.isActiveAssociation(row), true)
  assert.equal(u.isActiveAssociation({ ...row, status: 'SUSPENDED' }), false)
  assert.equal(u.normalizeAssociations(null).length, 0)
})

test('generic entity roles are rejected and shop roles are normalised', () => {
  for (const role of ['ADMIN', 'MANAGER', 'STAFF', 'USER']) assert.equal(u.isGenericRole(role), true)
  assert.equal(u.isShopRole('SHOP_ADMIN'), true)
  assert.equal(u.isShopRole('ADMIN'), false)
  assert.equal(u.normalizeRole('ADMIN'), 'SHOP_STAFF')
  assert.equal(u.normalizeRole('SHOP_ADMIN'), 'SHOP_ADMIN')
  assert.equal(u.friendlyRole('shop_staff'), 'Shop staff')
})

test('received counts are derived only from items[].received_qty', () => {
  const order = {
    items: [
      { item_name: 'Sheets', client_qty: 10, received_qty: 7 },
      { item_name: 'Sheets', client_qty: 5, received_qty: 2 },
      { item_name: 'Towels', quantity: 4 },
    ],
  }
  assert.equal(u.receivedPiecesFromItems(order.items), 9)
  assert.equal(u.receivedPiecesFromItems(null), 0)
  const aggregate = u.aggregateItems(order.items)
  assert.equal(aggregate.sent, 19)
  assert.equal(aggregate.received, 9)
  assert.equal(aggregate.lines, 3)
  assert.equal(aggregate.byName.find((line) => line.name === 'Sheets').received, 9)
})

test('null and wrapped item collections are normalised', () => {
  assert.equal(u.normalizeItems(null).length, 0)
  assert.equal(u.normalizeItems({ items: [{ a: 1 }] }).length, 1)
  assert.equal(u.normalizeItems({ lines: [{ a: 1 }] }).length, 1)
})

test('pagination clamps stale pages and reports the real range', () => {
  assert.deepEqual(u.pageRange(9, 25, 60), { page: 2, pageCount: 3, start: 51, end: 60, total: 60 })
  assert.deepEqual(u.pageRange(-3, 25, 0), { page: 0, pageCount: 1, start: 0, end: 0, total: 0 })
  assert.deepEqual(u.paginate(['a', 'b', 'c'], 7, 2), ['c'])
})

test('filter, sort and duplicate detection work on plain rows', () => {
  const rows = [
    { id: '1', name: 'Sheet', status: 'DRAFT', date: '2026-01-02T10:00:00Z', qty: 2 },
    { id: '2', name: 'Towel', status: 'PAID', date: '2026-02-02T10:00:00Z', qty: 5 },
    { id: '3', name: 'sheet', status: 'DRAFT', date: '2026-03-02T10:00:00Z', qty: 1 },
  ]
  assert.deepEqual(u.filterRows(rows, { search: 'sheet', searchable: [(r) => r.name] }).map((r) => r.id), ['1', '3'])
  assert.deepEqual(u.filterRows(rows, { status: 'paid', statusOf: (r) => r.status }).map((r) => r.id), ['2'])
  assert.deepEqual(u.filterRows(rows, {
    dateFrom: '2026-02-01', dateTo: '2026-02-28', dateOf: (r) => r.date,
  }).map((r) => r.id), ['2'])
  assert.deepEqual(u.sortRows(rows, 'qty', 'asc', (r, k) => r[k]).map((r) => r.qty), [1, 2, 5])
  assert.deepEqual(u.duplicateKeys(rows, (r) => r.name), ['sheet'])
})

test('errors, cache keys, exports and guards are deterministic', () => {
  assert.match(u.normalizeError({ response: { status: 403 } }), /does not have access/)
  assert.match(u.normalizeError({ code: 'ECONNABORTED' }), /took too long/)
  assert.match(u.normalizeError({ response: { status: 404 } }), /not available/)
  assert.notEqual(u.cacheKey('shop-a', '/orders'), u.cacheKey('shop-b', '/orders'))
  assert.equal(u.toCsv([{ a: 'x,y', b: 'say "hi"' }], [{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }]), 'A,B\r\n"x,y","say ""hi"""')
  assert.equal(u.retryDelay(10, 300, 4000), 4000)
  assert.equal(u.isRetryableStatus(500), true)
  assert.equal(u.isRetryableStatus(400), false)
  assert.equal(u.isResponseTooLarge('x'.repeat(30), 10), true)
  assert.match(u.makeIdempotencyKey('shop-order'), /^shop-order-/)
})

test('session and form helpers cover expiry, strength and validation', () => {
  const expired = `${btoa(JSON.stringify({ exp: 1 }))}.sig`
  assert.equal(u.sessionRemainingMs(expired), 0)
  assert.equal(u.sessionRemainingMs(null), 0)
  assert.equal(u.passwordStrength('a').score, 0)
  assert.equal(u.passwordStrength('Str0ng!pass').score, 4)
  assert.equal(Object.keys(u.validateLogin('ab', '')).length, 2)
  assert.equal(Object.keys(u.validateOrderLines([{ item_name: '', quantity: '0', unit: 'pcs' }])).length, 2)
  assert.equal(Object.keys(u.validateAccessRequest({ name: 'A', email: 'bad', laundry: 'L', reason: 'short' })).length, 4)
  assert.equal(u.isOrderLineValid({ item_name: 'Sheet', quantity: '3', unit: 'pcs' }), true)
  assert.equal(u.formatNumber(1234.5, 1).length > 0, true)
  assert.equal(u.statusTone('PAID'), 'positive')
  assert.equal(u.bulkLabel(2), '2 rows selected')
})
