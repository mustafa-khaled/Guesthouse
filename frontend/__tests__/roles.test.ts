import { describe, it, expect } from 'vitest'
import { hasMinimumRole } from '@guesthouse/shared'

describe('hasMinimumRole', () => {
  it('admin has access to editor routes', () => {
    expect(hasMinimumRole('admin', 'editor')).toBe(true)
  })

  it('user cannot access admin routes', () => {
    expect(hasMinimumRole('user', 'admin')).toBe(false)
  })

  it('moderator has access to editor routes', () => {
    expect(hasMinimumRole('moderator', 'editor')).toBe(true)
  })
})
