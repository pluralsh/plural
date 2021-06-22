import { css } from 'styled-components'

const boxStyle = css`
  outline: none;
`;

export const PLURAL_THEME = {
  'plural-blk': '#000b11',
  'tone-dark': '#01131a',
  'tone-medium':'#c9d1d3',
  'tone-light': '#edf1f2',
  'plrl-white': '#fff',
  'key-dark': '#001b8c',
  'key-light': '#0022b2',
  'alt-dark': '#006e96',
  'alt-light': '#0090c4',
  'red-dark': '#ba4348',
  'red-light': '#da4447',
  'green-dark': '#23422b',
  'green-light': '#35844d',
}

export const DEFAULT_COLOR_THEME = {
  brand: 'key-light',
  // action: '#007a5a',
  action: 'key-light',
  sidebar: 'plural-blk',
  sidebarHover: '#000000',
  sidebarActive: '#000000',
  focus: 'key-light',
  progress: '#007bff',
  tagMedium: 'key-light',
  tagLight: 'key-light',
  backgroundColor: 'tone-dark',
  orange: '#d7722c',
  error: 'red-light',
  presence: '#39E500',
  success: 'green-light',
  link: '#3366BB',
  notif: 'error',
  good: '#00ac46',
  low: '#fdc500',
  medium: '#fd8c00',
  high: '#dc0000',
  critical: '#780000',
  label: 'light-2',
  'input-border': 'light-5',
  ...PLURAL_THEME
}

export const DEFAULT_THEME = {
  anchor: {
    color: {light: 'link', dark: 'white'},
    hover: {
      textDecoration: 'none',
      extend: 'font-weight: 600'
    },
    fontWeight: 400,
  },
  button: {
    padding: {
      horizontal: '6px',
      vertical: '2px'
    }
  },
  checkBox: {
    size: '20px',
    toggle: {radius: '20px', size: '40px'},
  },
  box: {
    extend: boxStyle
  },
  tab: {
    active: {color: 'focus'},
    border: {active: {color: 'focus'}, hover: {color: 'focus'}},
  },
  textArea: {
    extend: {
      fontWeight: 400
    }
  },
  textInput: {
    extend: {
      fontWeight: 400
    }
  },
  calendar: {
    day: {
      extend: {
        borderRadius: '5px',
        fontWeight: 'normal'
      }
    }
  },
  textField: { extend: { fontWeight: 400 } },
  select: {
    options: {
      text: {size: 'small'}
    }
  },
  drop: {border: {radius: '4px'}},
  global: {
    colors: DEFAULT_COLOR_THEME,
    focus: {shadow: null, border: {color: 'brand'} },
    control: { border: {radius: '2px'} },
    drop: {
      border: { radius: '4px' }
    },
    box: { extend: boxStyle },
    font: {
      family: 'Roboto',
      size: '14px',
      height: '20px',
    },
  },
}