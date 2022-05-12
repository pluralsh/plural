import { useContext, useState } from 'react'
import { Div, Flex, Form, H2, P } from 'honorable'
import { FormField, Input } from 'pluralsh-design-system'

import RepositoryContext from '../../contexts/RepositoryContext'
import { capitalize } from '../../utils/string'

function RepositoryEdit() {
  const { name, description, editable } = useContext(RepositoryContext)
  const [nameUpdate, setNameUpdate] = useState(name)
  const [descriptionUpdate, setDescriptionUpdate] = useState(description)

  function handleSubmit(event) {
    event.preventDefault()
  }

  if (!editable) {
    return (
      <H2>
        You cannot edit this repository
      </H2>
    )
  }

  const textStartIcon = (
    <P
      body3
      marginTop={-2}
      color="text-xlight"
    >
      Abc
    </P>
  )

  return (
    <>
      <H2>
        Edit {capitalize(name)}
      </H2>
      <Form
        onSubmit={handleSubmit}
        mt={2}
      >
        <FormField label="Name">
          <Input
            startIcon={textStartIcon}
            placeholder={name}
            value={nameUpdate}
            onChange={event => setNameUpdate(event.target.value)}
          />
        </FormField>
        <FormField
          mt={1}
          label="Description"
        >
          <Input
            multiline
            startIcon={textStartIcon}
            placeholder={description}
            value={descriptionUpdate}
            onChange={event => setDescriptionUpdate(event.target.value)}
          />
        </FormField>
      </Form>
    </>
  )
}

export default RepositoryEdit
