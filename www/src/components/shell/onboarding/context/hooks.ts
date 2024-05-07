import { Dispatch, useCallback, useContext, useEffect, useMemo } from 'react'
import {
  // AppsIcon,
  ChecklistIcon,
  // CloudIcon,
  ListIcon,
  TerminalIcon,
  // WorkspaceIcon,
} from '@pluralsh/design-system'

import {
  ContextProps,
  OnboardingContext,
  SerializableContextProps,
  toSerializableContext,
} from './onboarding'
import {
  CloudProvider,
  CloudProviderBase,
  CloudType,
  Impersonation,
  Section,
  SectionKey,
  Sections,
  WorkspaceProps,
} from './types'

// const defaultSections = (): Sections => {
//   const sections: Sections = {
//     [SectionKey.WELCOME]: {
//       index: 0,
//       key: SectionKey.WELCOME,
//       title: 'Welcome to Plural!',
//       IconComponent: AppsIcon,
//     },
//     [SectionKey.ONBOARDING_OVERVIEW]: {
//       index: 1,
//       key: SectionKey.ONBOARDING_OVERVIEW,
//       title: 'Onboarding overview',
//       IconComponent: ChecklistIcon,
//     },
//     [SectionKey.CONFIGURE_CLOUD]: {
//       index: 2,
//       key: SectionKey.CONFIGURE_CLOUD,
//       title: 'Configure credentials',
//       IconComponent: CloudIcon,
//     },
//     [SectionKey.CONFIGURE_WORKSPACE]: {
//       index: 3,
//       key: SectionKey.CONFIGURE_WORKSPACE,
//       title: 'Configure workspace',
//       IconComponent: WorkspaceIcon,
//     },
//     [SectionKey.CREATE_CLOUD_SHELL]: {
//       index: 4,
//       key: SectionKey.CREATE_CLOUD_SHELL,
//       title: 'Create cloud shell',
//       IconComponent: TerminalIcon,
//     },
//   }

//   // build sections flow
//   sections[SectionKey.WELCOME]!.next = sections[SectionKey.ONBOARDING_OVERVIEW]

//   sections[SectionKey.ONBOARDING_OVERVIEW]!.next =
//     sections[SectionKey.CONFIGURE_CLOUD]
//   sections[SectionKey.ONBOARDING_OVERVIEW]!.prev = sections[SectionKey.WELCOME]

//   sections[SectionKey.CONFIGURE_CLOUD]!.prev =
//     sections[SectionKey.ONBOARDING_OVERVIEW]
//   sections[SectionKey.CONFIGURE_CLOUD]!.next =
//     sections[SectionKey.CONFIGURE_WORKSPACE]

//   sections[SectionKey.CONFIGURE_WORKSPACE]!.prev =
//     sections[SectionKey.CONFIGURE_CLOUD]
//   sections[SectionKey.CONFIGURE_WORKSPACE]!.next =
//     sections[SectionKey.CREATE_CLOUD_SHELL]

//   sections[SectionKey.CREATE_CLOUD_SHELL]!.prev =
//     sections[SectionKey.CONFIGURE_WORKSPACE]

//   return sections
// }

const localCLISections = (): Sections => {
  const sections: Sections = {
    [SectionKey.WELCOME]: {
      index: 0,
      key: SectionKey.WELCOME,
      title: 'Welcome to Plural!',
      IconComponent: ChecklistIcon,
    },
    // [SectionKey.ONBOARDING_OVERVIEW]: {
    //   index: 1,
    //   key: SectionKey.ONBOARDING_OVERVIEW,
    //   title: 'Onboarding overview',
    //   IconComponent: ChecklistIcon,
    // },
    // [SectionKey.CONFIGURE_CLOUD]: {
    //   index: 2,
    //   key: SectionKey.CONFIGURE_CLOUD,
    //   title: 'Configure credentials',
    //   IconComponent: CloudIcon,
    // },
    [SectionKey.INSTALL_CLI]: {
      index: 1,
      key: SectionKey.INSTALL_CLI,
      title: 'Install Plural CLI',
      IconComponent: TerminalIcon,
    },
    [SectionKey.COMPLETE_SETUP]: {
      index: 2,
      key: SectionKey.COMPLETE_SETUP,
      title: 'Complete Setup',
      IconComponent: ListIcon,
    },
  }

  // build sections flow
  // sections[SectionKey.WELCOME]!.next = sections[SectionKey.ONBOARDING_OVERVIEW]
  sections[SectionKey.WELCOME]!.next = sections[SectionKey.INSTALL_CLI]

  // sections[SectionKey.ONBOARDING_OVERVIEW]!.next =
  //   sections[SectionKey.CONFIGURE_CLOUD]
  // sections[SectionKey.ONBOARDING_OVERVIEW]!.prev = sections[SectionKey.WELCOME]

  // sections[SectionKey.CONFIGURE_CLOUD]!.prev =
  //   sections[SectionKey.ONBOARDING_OVERVIEW]
  // sections[SectionKey.CONFIGURE_CLOUD]!.next = sections[SectionKey.INSTALL_CLI]

  // sections[SectionKey.INSTALL_CLI]!.prev = sections[SectionKey.CONFIGURE_CLOUD]
  sections[SectionKey.INSTALL_CLI]!.prev = sections[SectionKey.WELCOME]
  sections[SectionKey.INSTALL_CLI]!.next = sections[SectionKey.COMPLETE_SETUP]

  sections[SectionKey.COMPLETE_SETUP]!.prev = sections[SectionKey.INSTALL_CLI]

  return sections
}

const useToken = (): string | undefined => {
  const {
    scm: { token },
  } = useContext(OnboardingContext)

  return token
}

const useSection = (s?: Section) => {
  const { section, setSection } = useContext(OnboardingContext)

  useEffect(() => {
    if (s) setSection((section) => ({ ...section, ...s }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s?.key, setSection])

  return {
    section,
    setSection,
  }
}

const useCloudType = (): CloudType =>
  // const {
  //   cloud: { type },
  // } = useContext(OnboardingContext)

  // return type || CloudType.Cloud
  CloudType.Local

const usePath = (): Dispatch<void> => {
  // const usePath = (path: CloudType): Dispatch<void> => {
  const { setSections, setSection } = useContext(OnboardingContext)

  return useCallback(() => {
    const sections = localCLISections()
    // let sections: Sections

    // switch (path) {
    //   case CloudType.Cloud:
    //     sections = defaultSections()
    //     break
    //   case CloudType.Demo:
    //     sections = defaultSections()
    //   break
    //   case CloudType.Local:
    //     sections = localCLISections()
    // }

    setSections(sections)
    setSection((section) => ({ ...section, ...sections[section.key] }))
    // }, [path, setSection, setSections])
  }, [setSection, setSections])
}

const useSectionState = () => {
  const { setSection } = useContext(OnboardingContext)

  return useCallback(
    (state: Section['state']) => {
      setSection((section) => ({ ...section, state }))
    },
    [setSection]
  )
}

const useSectionError = () => {
  const { setSection } = useContext(OnboardingContext)

  return useCallback(
    (hasError: boolean) => {
      setSection((section) => ({ ...section, hasError }))
    },
    [setSection]
  )
}

const useSetWorkspaceKeys = (): Dispatch<Partial<WorkspaceProps>> => {
  const { setWorkspace } = useContext(OnboardingContext)

  return useCallback(
    (partial: Partial<WorkspaceProps>) =>
      setWorkspace((w) => ({ ...w, ...partial })),
    [setWorkspace]
  )
}

const useSetCloudProviderKeys = <T extends CloudProviderBase>(
  provider: CloudProvider
): Dispatch<Partial<T>> => {
  const { setCloud } = useContext(OnboardingContext)

  return useCallback(
    (partial: Partial<T>) =>
      setCloud((c) => ({ ...c, [provider]: { ...c[provider], ...partial } })),
    [provider, setCloud]
  )
}

const useContextStorage = () => {
  const LOCAL_STORAGE_KEY = 'plural-onboarding-context'

  const save = useCallback(
    (context: ContextProps, impersonation?: Impersonation) => {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(toSerializableContext(context, impersonation))
      )
    },
    []
  )

  const restoredContext = useMemo(
    (): SerializableContextProps =>
      JSON.parse(
        localStorage.getItem(LOCAL_STORAGE_KEY) ?? '{}'
      ) as SerializableContextProps,
    []
  )

  const reset = useCallback(
    () => localStorage.removeItem(LOCAL_STORAGE_KEY),
    []
  )

  return { save, restoredContext, reset }
}

export {
  useToken,
  useCloudType,
  // defaultSections,
  localCLISections as defaultSections,
  useSection,
  usePath,
  useSetWorkspaceKeys,
  useSetCloudProviderKeys,
  useSectionState,
  useContextStorage,
  useSectionError,
}
