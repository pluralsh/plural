import { gql } from '@apollo/client'

import { DependenciesFragment } from './repo'

export const ChartFragment = gql`
  fragment ChartFragment on Chart {
    id
    name
    description
    latestVersion
    dependencies { ...DependenciesFragment }
  }
  ${DependenciesFragment}
`

export const VersionTagFragment = gql`
  fragment VersionTagFragment on VersionTag {
    id
    tag
    version { id }
  }
`

export const VersionFragment = gql`
  fragment VersionFragment on Version {
    id
    helm
    readme
    valuesTemplate
    version
    insertedAt
    chart { ...ChartFragment }
    terraform { id name }
    dependencies { ...DependenciesFragment }
  }
  ${ChartFragment}
  ${DependenciesFragment}
`

export const ChartInstallationFragment = gql`
  fragment ChartInstallationFragment on ChartInstallation {
    id
    version { id version }
  }
`

export const ScanViolation = gql`
  fragment ScanViolation on ScanViolation {
    ruleName
    description
    ruleId
    severity
    category
    resourceName
    resourceType
    file
    line
  }
`

export const ScanError = gql`
  fragment ScanError on ScanError {
    message
  }
`

export const PackageScan = gql`
  fragment PackageScan on PackageScan {
    id
    grade
    violations { ...ScanViolation }
    errors { ...ScanError }
  }
  ${ScanViolation}
  ${ScanError}
`
