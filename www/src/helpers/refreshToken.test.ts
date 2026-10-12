import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  fetchRefreshToken: vi.fn(() => 'refresh-token-1'),
  query: vi.fn(),
  setRefreshToken: vi.fn(),
}))

vi.mock('./authentication', () => ({
  fetchRefreshToken: mocks.fetchRefreshToken,
  setRefreshToken: mocks.setRefreshToken,
  setToken: vi.fn(),
}))
vi.mock('./authlessClient', () => ({
  authlessClient: { query: mocks.query },
}))
vi.mock('./localStorage', () => ({
  clearLocalStorage: vi.fn(),
}))
vi.mock('../components/users/utils', () => ({
  getLoginUrlWithReturn: vi.fn(() => '/login'),
}))
vi.mock('../generated/graphql', () => ({
  RefreshDocument: {},
}))

import { getRefreshedToken, isTransientRefreshFailure } from './refreshToken'

describe('getRefreshedToken', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shares one refresh request between concurrent callers', async () => {
    let resolveRefresh:
      | ((value: {
          data: {
            refresh: { jwt: string; refreshToken: { token: string } }
          }
        }) => void)
      | undefined
    const response = new Promise((resolve) => {
      resolveRefresh = resolve
    })

    mocks.query.mockReturnValue(response)

    const firstRefresh = getRefreshedToken()
    const secondRefresh = getRefreshedToken()

    expect(mocks.query).toHaveBeenCalledTimes(1)

    resolveRefresh?.({
      data: {
        refresh: {
          jwt: 'jwt-2',
          refreshToken: { token: 'refresh-token-2' },
        },
      },
    })

    await expect(Promise.all([firstRefresh, secondRefresh])).resolves.toEqual([
      'jwt-2',
      'jwt-2',
    ])
    expect(mocks.setRefreshToken).toHaveBeenCalledOnce()
    expect(mocks.setRefreshToken).toHaveBeenCalledWith('refresh-token-2')
  })

  it('starts a new request after the current refresh completes', async () => {
    mocks.query.mockResolvedValue({
      data: {
        refresh: {
          jwt: 'jwt',
          refreshToken: { token: 'refresh-token' },
        },
      },
    })

    await getRefreshedToken()
    await getRefreshedToken()

    expect(mocks.query).toHaveBeenCalledTimes(2)
  })
})

describe('isTransientRefreshFailure', () => {
  it('treats transport and 5xx failures as transient', () => {
    expect(
      isTransientRefreshFailure({
        networkError: { message: 'Failed to fetch' },
      })
    ).toBe(true)
    expect(
      isTransientRefreshFailure({
        networkError: { message: 'Service Unavailable', statusCode: 503 },
      })
    ).toBe(true)
  })

  it('does not treat credential rejections as transient', () => {
    expect(
      isTransientRefreshFailure({
        graphQLErrors: [{ message: 'could not fetch refresh token' }],
      })
    ).toBe(false)
    expect(
      isTransientRefreshFailure({
        networkError: { message: 'Unauthorized', statusCode: 401 },
      })
    ).toBe(false)
  })
})
