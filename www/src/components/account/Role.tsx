import { Box } from 'grommet'
import { ValidatedInput } from '@pluralsh/design-system'
import { useState } from 'react'

import { BindingInput } from './Typeaheads'

export function GeneralAttributes({
  attributes,
  setAttributes,
  bindings,
  setBindings,
}: any) {
  const [repositories, setRepositories] = useState(attributes.repositories.join(', '))

  return (
    <Box
      flex={false}
      gap="small"
    >
      <ValidatedInput
        label="Name"
        value={attributes.name}
        onChange={({ target: { value } }) => setAttributes({ ...attributes, name: value })}
      />
      <ValidatedInput
        label="Description"
        value={attributes.description}
        onChange={({ target: { value } }) => setAttributes({ ...attributes, description: value })}
      />
      <ValidatedInput
        label="Repositories"
        hint="Repositories for the role to apply to. Comma separated or * for any."
        value={repositories}
        onChange={({ target: { value } }) => {
          setRepositories(value)
          setAttributes({ ...attributes, repositories: value.split(',') })
        }}
      />
      <BindingInput
        type="user"
        hint="Users that will receive this role"
        bindings={bindings
          .filter(({ user }) => !!user)
          .map(({ user: { email } }) => email)}
        add={user => setBindings([...bindings, { user }])}
        remove={email => setBindings(bindings.filter(({ user }) => !user || user.email !== email))}
      />
      <BindingInput
        type="group"
        hint="Groups that will receive this role"
        bindings={bindings
          .filter(({ group }) => !!group)
          .map(({ group: { name } }) => name)}
        add={group => setBindings([...bindings, { group }])}
        remove={name => setBindings(bindings.filter(({ group }) => !group || group.name !== name))}
      />
    </Box>
  )
}
