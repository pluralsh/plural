import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'

import { HistoryContext } from './context'

interface History {
  pop(defaultPath: string): string
  navigate(defaultPath: string): void
}

function useHistory(): History {
  const history = useContext(HistoryContext)
  const navigate = useNavigate()

  return {
    pop: (defaultPath: string) => history.pop(defaultPath),
    navigate: (defaultPath: string) => navigate(history.pop(defaultPath)),
  }
}

export { useHistory }
