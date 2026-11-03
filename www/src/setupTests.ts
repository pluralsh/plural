import { fetch } from 'cross-fetch'
import 'regenerator-runtime/runtime'
import styled from 'styled-components'

// Polyfill fetch
globalThis.fetch = fetch

globalThis.styled = styled
