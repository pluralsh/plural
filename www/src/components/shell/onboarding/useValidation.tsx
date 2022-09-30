import { deepFetch } from '../../../utils/graphql'

import {
  SECTION_REPOSITORY,
  SECTION_SELECT,
  SECTION_WORKSPACE,
} from '../constants'

import {
  usePersistedGitData,
  usePersistedProvider,
  usePersistedWorkspace,
} from '../usePersistance'

import Provider from './common/providerTypes'

const GITHUB_VALIDATIONS = [
  { field: 'scm.name', name: 'repository', func: isAlphanumeric },
]

const GITLAB_VALIDATIONS = [
  { field: 'scm.name', name: 'repository', func: isValidGitlabName },
]

const SCM_VALIDATIONS = {
  [Provider.GITHUB]: GITHUB_VALIDATIONS,
  [Provider.GITLAB]: GITLAB_VALIDATIONS,
}

const AWS_VALIDATIONS = [
  { field: 'credentials.aws.accessKeyId', func: stringExists, name: 'access key id' },
  { field: 'credentials.aws.secretAccessKey', func: stringExists, name: 'secret access key' },
]

const GCP_VALIDATIONS = [
  { field: 'credentials.gcp.applicationCredentials', func: stringExists, name: 'application credentials' },
  { field: 'workspace.project', func: isAlphanumeric, name: 'project' },
]

const CLOUD_VALIDATIONS = {
  AWS: AWS_VALIDATIONS,
  GCP: GCP_VALIDATIONS,
}

const CLOUD_WORKSPACE_VALIDATIONS = [
  { field: 'workspace.cluster', func: isAlphanumeric, name: 'cluster' },
  { field: 'workspace.bucketPrefix', func: isAlphanumeric, name: 'bucket prefix' },
  { field: 'workspace.subdomain', func: isSubdomain, name: 'subdomain' },
]

const VALIDATIONS = {
  [SECTION_REPOSITORY]: GITHUB_VALIDATIONS,
  [SECTION_WORKSPACE]: CLOUD_WORKSPACE_VALIDATIONS,
}

function getValidations(provider, scmProvider, section) {
  if (section === SECTION_SELECT) return CLOUD_VALIDATIONS[provider]
  if (section === SECTION_REPOSITORY) return SCM_VALIDATIONS[scmProvider]

  return VALIDATIONS[section]
}

function useValidation(section: string) {
  const [provider] = usePersistedProvider()
  const [{ scmProvider, scm }] = usePersistedGitData()
  const [workspace] = usePersistedWorkspace()
  const validations = getValidations(provider, scmProvider, section)

  return getExceptions(validations, { workspace, scm })
}

export function validator(
  object,
  field,
  name,
  func
) {
  const val = deepFetch(object, field)

  if (!val) {
    if (typeof val === 'string') {
      return { ...stringExists(val), ...{ field: name } }
    }

    return { ...exists(val), ...{ field: name } }
  }

  const res = func(val)

  return res && { ...res, ...{ field: name } }
}

export function exists(val) {
  if (val) return null

  return {
    message: 'is not set',
    type: 'no-empty',
    empty: true,
  }
}

export function stringExists(val) {
  if (val.length > 0) return null

  return {
    message: 'cannot be an empty string',
    type: 'no-empty',
    empty: true,
  }
}

export function isAlphanumeric(val) {
  if (/^[a-zA-Z0-9-]+$/.test(val)) return null

  return { message: "may contain only letters, numbers, or '-'", type: 'alpha-numeric' }
}

export function isValidGitlabName(val) {
  if (!/^[a-zA-Z0-9._-]+$/.test(val)) {
    return { type: 'alpha-numeric', message: "can contain only letters, digits, '_', '-' and '.'" }
  } if (/^[._-]/.test(val)) {
    return { type: 'alpha-numeric', message: "cannot start with '-', '_' or '.'" }
  } if (/[._-]$/.test(val)) {
    return { type: 'alpha-numeric', message: "cannot end with '-', '_' or '.'" }
  } if (/(.atom|.git)$/.test(val)) {
    return { type: 'alpha-numeric', message: "cannot end in '.git' or end in '.atom'" }
  } if (/[._-]{2}/.test(val)) {
    return { type: 'alpha-numeric', message: 'cannot contain consecutive special characters' }
  }

  return null
  // "Path must not start or end with a special character and must not contain consecutive special characters."
}

export function isSubdomain(val) {
  if (/^[a-z][a-z0-9-]*$/.test(val)) return null

  return { type: 'subdomain', message: 'must be a valid subdomain' }
}

export function getExceptions(validations, object) {
  if (!validations) return { error: false }

  const allExceptions = validations
    .map(({ field, name, func }) => validator(
      object, field, name, func
    ))
    .filter(v => !!v)

  return { error: allExceptions.length > 0, exceptions: allExceptions }
}

export default useValidation
