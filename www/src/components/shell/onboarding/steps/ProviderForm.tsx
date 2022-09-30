import {
  useCallback,
  useContext,
  useState,
} from 'react'

import CreateShellContext from '../../../../contexts/CreateShellContext'
import DemoProject from '../demo/DemoProject'

import CloudSelect from './OnboardingSelect'

function ProviderForm() {
  const {
    setProvider, workspace, setWorkspace, credentials, setCredentials, demo, setDemo, next,
  } = useContext(CreateShellContext)
  const [path, setPath] = useState(null)

  const doSetPath = useCallback(path => {
    if (path === 'demo') {
      setDemo(true)
    }
    setPath(path)
  }, [setPath, setDemo])

  if (!path) {
    return (
      <CloudSelect doSetPath={doSetPath} />
    )
  }

  if (demo) {
    return (
      <DemoProject
        setDemo={setDemo}
        setProvider={setProvider}
        workspace={workspace}
        setWorkspace={setWorkspace}
        credentials={credentials}
        setCredentials={setCredentials}
        next={next}
      />
    )
  }
}

export default ProviderForm
