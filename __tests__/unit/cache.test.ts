/**
 * @jest-environment node
 */
import { cache, TTL } from '@/lib/cache'

describe('MemoryCache', () => {
  beforeEach(() => cache.clear())

  it('stores and retrieves a value', () => {
    cache.set('test:1', { name: 'Alice' }, TTL.SHORT)
    expect(cache.get('test:1')).toEqual({ name: 'Alice' })
  })

  it('returns null for missing key', () => {
    expect(cache.get('no:such:key')).toBeNull()
  })

  it('returns null for expired entry', async () => {
    cache.set('expire:1', 'value', 50) // 50ms TTL
    await new Promise((r) => setTimeout(r, 100))
    expect(cache.get('expire:1')).toBeNull()
  })

  it('has() returns true for valid key', () => {
    cache.set('has:1', 42, TTL.MEDIUM)
    expect(cache.has('has:1')).toBe(true)
  })

  it('has() returns false for missing key', () => {
    expect(cache.has('missing:key')).toBe(false)
  })

  it('delete removes a key', () => {
    cache.set('del:1', 'value', TTL.LONG)
    cache.delete('del:1')
    expect(cache.get('del:1')).toBeNull()
  })

  it('clear removes all keys', () => {
    cache.set('a', 1, TTL.LONG)
    cache.set('b', 2, TTL.LONG)
    cache.clear()
    expect(cache.get('a')).toBeNull()
    expect(cache.get('b')).toBeNull()
  })

  it('overwrites existing entry', () => {
    cache.set('ow:1', 'original', TTL.LONG)
    cache.set('ow:1', 'updated', TTL.LONG)
    expect(cache.get('ow:1')).toBe('updated')
  })

  it('stores complex objects', () => {
    const data = { items: [1, 2, 3], nested: { deep: true } }
    cache.set('obj:1', data, TTL.MEDIUM)
    expect(cache.get('obj:1')).toEqual(data)
  })
})

describe('TTL constants', () => {
  it('are in ascending order', () => {
    expect(TTL.VERY_SHORT).toBeLessThan(TTL.SHORT)
    expect(TTL.SHORT).toBeLessThan(TTL.MEDIUM)
    expect(TTL.MEDIUM).toBeLessThan(TTL.LONG)
    expect(TTL.LONG).toBeLessThan(TTL.VERY_LONG)
  })
})
