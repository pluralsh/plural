import {
  Chip,
  ComboBox,
  FormField,
  ListBoxFooter,
  ListBoxFooterPlus,
  ListBoxItem,
  ListBoxItemChipList,
  PeopleIcon,
  PeoplePlusIcon,
  Tooltip,
  WrapWithIf,
} from '@pluralsh/design-system'
import { debounce } from 'lodash'
import { ReactElement, useContext, useMemo, useState } from 'react'
import styled from 'styled-components'

import SubscriptionContext from '../../../contexts/SubscriptionContext'

import { GroupBase, GroupBindingsComboBoxProps } from './types'

const ChipList = styled(ListBoxItemChipList)(({ theme }) => ({
  marginTop: theme.spacing.small,
  justifyContent: 'start',
}))

const GroupBindingsComboBox = styled(GroupBindingsComboBoxUnstyled)(
  ({ theme }) => ({
    '.content': {
      color: theme.colors['text-xlight'],

      '.leftContent': {
        color: theme.colors['icon-light'],
      },
    },

    '.create-group-footer': {
      ...theme.partials.text.body2,
      color: theme.colors['action-link-inline'],
    },
  })
)

const PLACEHOLDER = 'Search for a group'

function GroupBindingsComboBoxUnstyled({
  groups,
  onSelect,
  onCreate,
  onRemove,
  isDisabled = false,
  hasMore = false,
  onViewMore,
  onInputChange,
  preselected,
  ...props
}: GroupBindingsComboBoxProps): ReactElement {
  const { isPaidPlan, isTrialPlan } = useContext(SubscriptionContext)

  const [value, setValue] = useState('')
  const [selected, setSelected] = useState<Array<GroupBase>>(preselected ?? [])

  const isFreePlan = useMemo(
    () => !isPaidPlan && !isTrialPlan,
    [isPaidPlan, isTrialPlan]
  )

  const debouncedOnInputChange = useMemo(
    () => debounce((value) => onInputChange?.(value), 750),
    [onInputChange]
  )

  const selectableGroups = useMemo(
    () => groups.filter((g) => !selected?.find((s) => g.id === s.id)),
    [groups, selected]
  )

  return (
    <WrapWithIf
      wrapper={
        <Tooltip label="Upgrade to the Professional plan to access groups." />
      }
      condition={isFreePlan}
    >
      <FormField
        label="Group bindings"
        {...props}
      >
        <ComboBox
          isDisabled={isDisabled || isFreePlan}
          inputValue={value}
          startIcon={<PeopleIcon />}
          inputProps={{
            placeholder: PLACEHOLDER,
            disabled: isDisabled || isFreePlan,
          }}
          dropdownFooterFixed={
            <ListBoxFooter
              onClick={() => onCreate?.()}
              leftContent={<PeoplePlusIcon color="icon-info" />}
              {...props}
            >
              <span className="create-group-footer">Create new group</span>
            </ListBoxFooter>
          }
          dropdownFooter={
            hasMore ? (
              <ListBoxFooterPlus>View more</ListBoxFooterPlus>
            ) : undefined
          }
          onFooterClick={() => onViewMore?.()}
          onSelectionChange={(key) => {
            if (!key) return

            const group = groups?.find((g) => g.id === key) as GroupBase

            setSelected((selected) => [...selected, group])
            onSelect?.(group)
          }}
          onInputChange={(value) => {
            setValue(value)
            debouncedOnInputChange(value)
          }}
        >
          {selectableGroups.map((g) => (
            <ListBoxItem
              leftContent={<PeopleIcon />}
              key={g.id}
              label={g.name}
              description={g.description}
              textValue={g.name}
            />
          ))}
        </ComboBox>
        <ChipList
          maxVisible={Infinity}
          chips={[...(selected ?? [])].map((group) => (
            <Chip
              size="small"
              clickable
              onClick={() => {
                setSelected((selected) => [
                  ...selected.filter((s) => s.id !== group.id),
                ])
                onRemove?.(group)
              }}
              closeButton
            >
              {group.name}
            </Chip>
          ))}
        />
      </FormField>
    </WrapWithIf>
  )
}

export default GroupBindingsComboBox
