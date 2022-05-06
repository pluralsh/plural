import { useContext, useEffect } from 'react'

import { BreadcrumbsContext } from '../components/Breadcrumbs'

function useBreadcrumbs(breadcrumbs) {
  const { setBreadcrumbs } = useContext(BreadcrumbsContext)

  useEffect(() => {
    if (!breadcrumbs) return

    setBreadcrumbs(breadcrumbs)

    return () => setBreadcrumbs([])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setBreadcrumbs, JSON.stringify(breadcrumbs)])
}

export default useBreadcrumbs
