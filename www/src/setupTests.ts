import { fetch } from 'cross-fetch'
import 'regenerator-runtime/runtime'

// Polyfill fetch
global.fetch = fetch

// Mock the intercom calls
global.Intercom = () => {}
