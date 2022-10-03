import {
  useCallback,
  useContext,
  useState,
} from 'react'

import CreateShellContext from '../../www/src/contexts/CreateShellContext'
import DemoProject from '../../www/src/components/shell/onboarding/demo/DemoProject'

import CloudSelect from '../../www/src/components/shell/onboarding/steps/OnboardingSelect'

function ProviderForm() {
  const {
    // @ts-ignore
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
      // @ts-ignore
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
