import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createBrowserHistory } from 'history'
import { Link, Route, Routes, useLocation } from 'react-router-dom'

import { HistoryRouter } from './component'

function Location() {
  const location = useLocation()

  return <output>{location.pathname}</output>
}

describe('HistoryRouter', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/')
  })

  it('keeps declarative navigation and browser back navigation in sync', async () => {
    const history = createBrowserHistory()
    history.replace('/')

    render(
      <HistoryRouter history={history}>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Link to="/next">Next</Link>
                <Location />
              </>
            }
          />
          <Route
            path="/next"
            element={<Location />}
          />
        </Routes>
      </HistoryRouter>
    )

    expect(screen.getByText('/')).toBeTruthy()

    fireEvent.click(screen.getByRole('link', { name: 'Next' }))

    await waitFor(() => expect(screen.getByText('/next')).toBeTruthy())

    history.back()

    await waitFor(() => expect(screen.getByText('/')).toBeTruthy())
  })
})
