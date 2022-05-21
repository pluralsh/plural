import React from 'react'
import { GithubRepositoryInput, GITHUB_VALIDATIONS } from './github'
import { GitlabRepositoryInput, GITLAB_VALIDATIONS } from './gitlab'
import { Provider } from './types'

export const SCM_VALIDATIONS = {
    [Provider.GITHUB]: GITHUB_VALIDATIONS,
    [Provider.GITLAB]: GITLAB_VALIDATIONS,
}

export function ScmInput({provider, accessToken, scm, setScm}) {
    if (provider === Provider.GITHUB) {
        return (
            <GithubRepositoryInput
                accessToken={accessToken}
                scm={scm}
                setScm={setScm}
            />
        )
    }

    if (provider === Provider.GITLAB) {
        return (
            <GitlabRepositoryInput
                accessToken={accessToken}
                scm={scm}
                setScm={setScm}
            />
        )
    }

    return null
}