import { fetch } from 'cross-fetch'
import 'regenerator-runtime/runtime'
import styled from 'styled-components'

// Polyfill fetch
global.fetch = fetch

global.styled = styled
