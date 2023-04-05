import { useParams } from 'react-router-dom'

export function Cluster() {
  const { id } = useParams()

  return <>{id} cluster details</>
}
