import { css } from 'styled-components'

const boxStyle = css`
  outline: none;
`;

export const DEFAULT_COLOR_THEME = {
  brand: '#3B1D98',
  action: '#3B1D98',
  sidebar: '#1A1D21',
  sidebarHover: '#000000',
  sidebarActive: '#000000',
  focus: '#3B1D98',
  tagMedium: '#3B1D98',
  tagLight: '#624aad',
  progress: '#007bff',
  error: '#CC4400',
  success: '#007a5a',
  console: '#222222'
}

export const DEFAULT_THEME = {
  anchor: {
    color: {light: 'sidebar'},
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
  tab: {
    active: {color: 'focus'},
    border: {active: {color: 'focus'}, hover: {color: 'focus'}},
  },
  textArea: {
    extend: {
      fontWeight: 400
    }
  },
  box: {
    extend: boxStyle
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
  textField: {
    extend: {
      fontWeight: 400
    }
  },
  select: {
    options: {
      text: {size: 'small'}
    }
  },
  global: {
    colors: DEFAULT_COLOR_THEME,
    drop: {
      border: {
        radius: '2px'
      }
    },
    font: {
      family: 'Roboto',
      size: '14px',
      height: '20px',
    },
  },
}