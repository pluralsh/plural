import {
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Switch } from 'honorable'
import StartCase from 'lodash/startCase'
import { FormField, Input } from '@pluralsh/design-system'

import { TerminalContext } from '../context/terminal'
import { ShellConfiguration } from '../../../../generated/graphql'

import { ConfigurationType } from './types'

type ModifierFunction = (value: string, trim?: boolean) => string

const modifierFactory = (type: ConfigurationType, configuration: ShellConfiguration): ModifierFunction => {
  switch (type) {
  case ConfigurationType.STRING:
  case ConfigurationType.INT:
  case ConfigurationType.PASSWORD:
    return stringModifier
  case ConfigurationType.BUCKET:
    return bucketModifier.bind({ configuration })
  case ConfigurationType.DOMAIN:
    return domainModifier.bind({ configuration })
  }

  return stringModifier
}

const stringModifier = value => value

function bucketModifier(this: {configuration: ShellConfiguration}, value: string, trim = false) {
  const { configuration } = this
  const bucketPrefix = configuration?.workspace?.bucketPrefix
  const cluster = configuration?.workspace?.cluster
  const prefix = `${bucketPrefix}-${cluster}-`

  if (trim) return value?.replace(prefix, '')

  return bucketPrefix && cluster ? `${prefix}${value}` : value
}
function domainModifier(this: {configuration: ShellConfiguration}, value: string, trim = false) {
  const { configuration } = this
  const subdomain = configuration?.workspace?.network?.subdomain || ''
  const suffix = subdomain ? `.${subdomain}` : ''

  if (trim) return value?.replace(suffix, '')

  return subdomain ? `${value}${suffix}` : value
}

const createValidator = (regex: RegExp, optional: boolean, error: string) => (value): {valid: boolean, message: string} => ({
  valid: (value ? regex.test(value) : optional),
  message: error,
})

function ConfigurationField({
  config, type, ctx, setValue,
}) {
  const {
    name, default: defaultValue, placeholder, documentation, validation, optional,
  } = config
  const { configuration } = useContext(TerminalContext)

  const value = useMemo(() => ctx[name]?.value, [ctx, name])
  const validator = useMemo(() => createValidator(new RegExp(validation?.regex ? `^${validation?.regex}$` : /.*/), config.optional, validation?.message), [config.optional, validation?.message, validation?.regex])
  const { valid, message } = useMemo(() => validator(value), [validator, value])
  const modifier = useMemo(() => modifierFactory(config.type, configuration), [config.type, configuration])

  const [local, setLocal] = useState(modifier(value, true) || defaultValue)

  useEffect(() => (local ? setValue(
    name, modifier(local), valid, config?.type
  ) : setValue(
    name, local, valid, config?.type
  )), [local, setValue, modifier, name, valid, config])

  return (
    <FormField
      label={StartCase(name)}
      hint={message || documentation}
      error={!valid}
      required={!optional}
    >
      <Input
        placeholder={placeholder}
        value={local}
        type={type}
        error={!valid}
        prefix={config.type === ConfigurationType.BUCKET ? configuration?.workspace?.bucketPrefix : ''}
        suffix={config.type === ConfigurationType.DOMAIN ? `.${configuration?.workspace?.network?.subdomain}` : ''}
        onChange={({ target: { value } }) => setLocal(value)}
      />
    </FormField>
  )
}

function BoolConfiguration({
  config: { name, default: def }, ctx, setValue,
}) {
  const value: boolean = ctx[name]?.value

  useEffect(() => {
    if (value === undefined && def) {
      setValue(name, def)
    }
  }, [value, def, name, setValue])

  return (
    <Switch
      checked={value}
      onChange={({ target: { checked } }) => setValue(name, checked)}
    >
      {StartCase(name)}
    </Switch>
  )
}

export function ConfigurationItem({
  config, ctx, setValue,
}) {
  const isInt = config.type === ConfigurationType.INT
  const renderAsPassword = ['private_key', 'public_key']
  const isPassword = config.type === ConfigurationType.PASSWORD || renderAsPassword.includes(config.name)

  switch (config.type) {
  case ConfigurationType.BOOL:
    return (
      <BoolConfiguration
        config={config}
        ctx={ctx}
        setValue={setValue}
      />
    )
  default:
    return (
      <ConfigurationField
        config={config}
        ctx={ctx}
        setValue={setValue}
        type={isInt ? 'number' : isPassword ? 'password' : 'text'}
      />
    )
  }
}
