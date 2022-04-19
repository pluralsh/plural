import { ModalHeader } from 'forge-core'
import { Box, Layer, Text } from 'grommet'

import { Code } from '../incidents/Markdown'

function BundleInstall({ recipe, repository, setOpen }) {
  return (
    <Layer
      modal
      position="center"
      onEsc={() => setOpen(false)}
    >
      <Box width="80vw">
        <ModalHeader
          text={recipe.name}
          setOpen={setOpen}
        />
        <Box
          pad="medium"
          gap="medium"
        >
          <Text size="small">In your installation repository, run:</Text>
          <Code className="lang-bash">
            {`plural bundle install ${repository.name} ${recipe.name}`}
          </Code>
        </Box>
      </Box>
    </Layer>
  )
}

export default function Recipe({ recipe, setOpen, repository }) {
  return (
    <BundleInstall
      recipe={recipe}
      repository={repository}
      setOpen={setOpen}
    />
  )
}
