import {
  Dispatch,
  useCallback,
  useContext,
  useEffect,
} from 'react'

import {
  CloudIcon,
  GitMerge,
  ListIcon,
  PackageIcon,
  TerminalIcon,
  WorkspaceIcon,
} from '@pluralsh/design-system'

import { OnboardingContext } from './onboarding'
import {
  CloudProvider,
  CloudProviderBase,
  CloudType,
  SCMProps,
  SectionKey,
  Sections,
  WorkspaceProps,
} from './types'

const defaultSections = (): Sections => {
  const sections: Sections = {
    [SectionKey.CREATE_REPOSITORY]: {
      index: 0, key: SectionKey.CREATE_REPOSITORY, title: 'Create a repository', IconComponent: GitMerge,
    },
    [SectionKey.CONFIGURE_CLOUD]: {
      index: 1, key: SectionKey.CONFIGURE_CLOUD, title: 'Configure cloud', IconComponent: CloudIcon,
    },
    [SectionKey.CONFIGURE_WORKSPACE]: {
      index: 2, key: SectionKey.CONFIGURE_WORKSPACE, title: 'Configure workspace', IconComponent: WorkspaceIcon,
    },
    [SectionKey.CREATE_CLOUD_SHELL]: {
      index: 3, key: SectionKey.CREATE_CLOUD_SHELL, title: 'Create cloud shell', IconComponent: TerminalIcon,
    },
  }

  // build sections flow
  sections[SectionKey.CREATE_REPOSITORY]!.next = sections[SectionKey.CONFIGURE_CLOUD]

  sections[SectionKey.CONFIGURE_CLOUD]!.prev = sections[SectionKey.CREATE_REPOSITORY]
  sections[SectionKey.CONFIGURE_CLOUD]!.next = sections[SectionKey.CONFIGURE_WORKSPACE]

  sections[SectionKey.CONFIGURE_WORKSPACE]!.prev = sections[SectionKey.CONFIGURE_CLOUD]
  sections[SectionKey.CONFIGURE_WORKSPACE]!.next = sections[SectionKey.CREATE_CLOUD_SHELL]

  sections[SectionKey.CREATE_CLOUD_SHELL]!.prev = sections[SectionKey.CONFIGURE_WORKSPACE]

  return sections
}

const localCLISections = (): Sections => {
  const sections: Sections = {
    [SectionKey.CREATE_REPOSITORY]: {
      index: 0, key: SectionKey.CREATE_REPOSITORY, title: 'Create a repository', IconComponent: PackageIcon,
    },
    [SectionKey.CONFIGURE_CLOUD]: {
      index: 1, key: SectionKey.CONFIGURE_CLOUD, title: 'Configure cloud', IconComponent: CloudIcon,
    },
    [SectionKey.INSTALL_CLI]: {
      index: 2, key: SectionKey.INSTALL_CLI, title: 'Install Plural CLI', IconComponent: TerminalIcon,
    },
    [SectionKey.COMPLETE_SETUP]: {
      index: 3, key: SectionKey.COMPLETE_SETUP, title: 'Complete Setup', IconComponent: ListIcon,
    },
  }

  // build sections flow
  sections[SectionKey.CREATE_REPOSITORY]!.next = sections[SectionKey.CONFIGURE_CLOUD]

  sections[SectionKey.CONFIGURE_CLOUD]!.prev = sections[SectionKey.CREATE_REPOSITORY]
  sections[SectionKey.CONFIGURE_CLOUD]!.next = sections[SectionKey.INSTALL_CLI]

  sections[SectionKey.INSTALL_CLI]!.prev = sections[SectionKey.CONFIGURE_CLOUD]
  sections[SectionKey.INSTALL_CLI]!.next = sections[SectionKey.COMPLETE_SETUP]

  sections[SectionKey.COMPLETE_SETUP]!.prev = sections[SectionKey.INSTALL_CLI]

  return sections
}

const useToken = (): string | undefined => {
  const { scm: { token } } = useContext(OnboardingContext)

  return token
}

const useSection = (key?: SectionKey) => {
  const { section, setSection, sections } = useContext(OnboardingContext)

  useEffect(() => {
    if (key) setSection(sections[key]!)
  }, [key, sections, setSection])

  return {
    section,
    setSection,
  }
}

const useCloudType = (): CloudType => {
  const { cloud: { type } } = useContext(OnboardingContext)

  return type || CloudType.Cloud
}

const useSCM = (): SCMProps => {
  const { scm } = useContext(OnboardingContext)

  return scm
}

const usePath = (path: CloudType): Dispatch<void> => {
  const { setSections, section, setSection } = useContext(OnboardingContext)

  return useCallback(() => {
    let sections: Sections

    switch (path) {
    case CloudType.Cloud:
      sections = defaultSections()
      break
    case CloudType.Local:
      sections = localCLISections()
    }

    const updatedSection = sections[section.key]

    setSections(sections)
    setSection(updatedSection!)
  }, [path, setSections])
}

const useSetWorkspaceKeys = (): Dispatch<Partial<WorkspaceProps>> => {
  const { setWorkspace } = useContext(OnboardingContext)

  return useCallback((partial: Partial<WorkspaceProps>) => setWorkspace(w => ({ ...w, ...partial })), [setWorkspace])
}

const useSetCloudProviderKeys = <T extends CloudProviderBase>(provider: CloudProvider): Dispatch<Partial<T>> => {
  const { setCloud } = useContext(OnboardingContext)

  return useCallback((partial: Partial<T>) => setCloud(c => ({ ...c, [provider]: { ...c[provider], ...partial } })), [provider, setCloud])
}

export {
  useToken, useCloudType, useSCM, defaultSections, useSection, usePath, useSetWorkspaceKeys, useSetCloudProviderKeys,
}
