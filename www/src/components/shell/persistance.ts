import {
  CONSOLE_LOCAL_STORAGE_KEY,
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

export function persistStack(stack: any) {
  localStorage.setItem(STACK_NAME_LOCAL_STORAGE_KEY, JSON.stringify(stack))
}

export function retrieveStack() {
  try {
    return JSON.parse(localStorage.getItem(STACK_NAME_LOCAL_STORAGE_KEY) as string) as any
  }
  catch (error) {
    return null
  }
}

export function persistConsole(shouldUseConsole: boolean) {
  localStorage.setItem(CONSOLE_LOCAL_STORAGE_KEY, shouldUseConsole.toString())
}

export function retrieveConsole() {
  return localStorage.getItem(PROVIDER_LOCAL_STORAGE_KEY) === 'true'
}
