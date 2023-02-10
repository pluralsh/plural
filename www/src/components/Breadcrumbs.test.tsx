// Unit Test Code
import React from 'react'
import { cleanup, fireEvent, render } from '@testing-library/react'

import '@testing-library/jest-dom/extend-expect'
import { Breadcrumbs, CrumbLink } from './Breadcrumbs'

describe('Breadcrumbs', () => {
  afterEach(cleanup)

  it('should render correctly', () => {
    const { getByTestId } = render(<Breadcrumbs />)

    expect(getByTestId('breadcrumb')).toBeInTheDocument()
  })

  it('should navigate to the correct url when clicked', () => {
    const url = '/test'

    const { getByTestId } = render(<CrumbLink crumb={{ url, text: 'test' }} />)

    fireEvent.click(getByTestId('breadcrumb'))

    expect(window.location.pathname).toBe(url)
  })

  it('should not navigate when disabled', () => {
    const url = '/test'

    const { getByTestId } = render(<CrumbLink crumb={{ url, text: 'test', disable: true }} />)

    fireEvent.click(getByTestId('breadcrumb'))

    expect(window.location.pathname).not.toBe(url)
  })
})

const mockedUsedNavigate = vi.fn()

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}))
