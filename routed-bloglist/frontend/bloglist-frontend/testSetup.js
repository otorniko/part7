import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { beforeEach } from 'vitest'

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (key) => {
        if (key === 'loggedBlogAppUser') {
          return JSON.stringify({ username: 'testuser' })
        }
        return null
      },
      setItem: vi.fn(),
      removeItem: vi.fn(),
    }
  })
})

afterEach(() => {
  cleanup()
})
