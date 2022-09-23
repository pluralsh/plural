import {
  PROVIDER_LOCAL_STORAGE_KEY,
  SELECTED_APPLICATIONS_LOCAL_STORAGE_KEY,
  STACK_NAME_LOCAL_STORAGE_KEY,
} from './constants'

export function persistApplications(applications: any[]) {
  localStorage.setItem(SELECTED_APPLICATIONS_LOCAL_STORAGE_KEY, JSON.stringify(applications))
}

export function retrieveApplications() {
  try {
    return JSON.parse(localStorage.getItem(SELECTED_APPLICATIONS_LOCAL_STORAGE_KEY) as string) as any[]
  }
  catch (error) {
    return []
  }
}

export function persistProvider(provider: string) {
  localStorage.setItem(PROVIDER_LOCAL_STORAGE_KEY, provider)
}

export function retrieveProvider() {
  return localStorage.getItem(PROVIDER_LOCAL_STORAGE_KEY)
}

export function persistStackName(stackName: string) {
  localStorage.setItem(STACK_NAME_LOCAL_STORAGE_KEY, stackName)
}

export function retrieveStackName() {
  return localStorage.getItem(STACK_NAME_LOCAL_STORAGE_KEY)
}
