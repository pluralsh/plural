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
import { Datatype, ShellConfiguration } from '../../../../generated/graphql'

import ConfigurationFileInput from './ConfigurationFileInput'

type ModifierFunction = (value: string, trim?: boolean) => string

const modifierFactory = (type: Datatype,
  configuration: ShellConfiguration): ModifierFunction => {
  switch (type) {
  case Datatype.String:
  case Datatype.Int:
  case Datatype.Password:
    return stringModifier
  case Datatype.Bucket:
    return bucketModifier.bind({ configuration })
  case Datatype.Domain:
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
  config, ctx, setValue,
}) {
  const {
    name,
    default: defaultValue,
    placeholder,
    documentation,
    validation,
    optional,
    type,
  } = config
  const { configuration } = useContext(TerminalContext)

  const value = useMemo(() => ctx[name]?.value, [ctx, name])
  const validator = useMemo(() => createValidator(new RegExp(validation?.regex ? `^${validation?.regex}$` : /.*/),
    config.optional,
    validation?.message),
  [config.optional, validation?.message, validation?.regex])
  const { valid, message } = useMemo(() => validator(value), [validator, value])
  const modifier = useMemo(() => modifierFactory(config.type, configuration),
    [config.type, configuration])

  const isFile = type === Datatype.File

  const [local, setLocal] = useState(modifier(value, true) || (isFile ? null : defaultValue))

  useEffect(() => (local
    ? setValue(
      name, modifier(local), valid, type
    )
    : setValue(
      name, local, valid, type
    )),
  [local, modifier, name, setValue, type, valid])

  const isInt = type === Datatype.Int
  const isPassword
      = type === Datatype.Password
      || ['private_key', 'public_key'].includes(config.name)

  const inputFieldType = isInt
    ? 'number'
    : isPassword
      ? 'password'
      : 'text'

  return (
    <FormField
      label={StartCase(name)}
      hint={message || documentation}
      error={!valid}
      required={!optional}
    >
      {isFile ? (
        <ConfigurationFileInput
          value={local ?? ''}
          onChange={val => {
            setLocal(val?.text ?? '')
          }}
        />
      ) : (
        <Input
          placeholder={placeholder}
          value={local}
          type={inputFieldType}
          error={!valid}
          prefix={
            config.type === Datatype.Bucket
              ? `${configuration?.workspace?.bucketPrefix}-`
              : ''
          }
          suffix={
            config.type === Datatype.Domain
              ? `.${configuration?.workspace?.network?.subdomain}`
              : ''
          }
          onChange={({ target: { value } }) => setLocal(value)}
        />
      )}
    </FormField>
  )
}

function BoolConfiguration({ config: { name, default: def }, ctx, setValue }) {
  const value: boolean = `${ctx[name]?.value}`.toLowerCase() === 'true'

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

export function ConfigurationItem({ config, ctx, setValue }) {
  switch (config.type) {
  case Datatype.Bool:
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
      />
    )
  }
}
