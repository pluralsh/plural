export const DEFAULT_COLOR_THEME = {
  brand: '#3B1D98',
  action: '#3B1D98',
  sidebar: '#1E2436',
  sidebarLight: '#353a4a',
  sidebarHover: '#34394A',
  sidebarActive: '#0F121B',
  focus: '#3B1D98',
  tagMedium: '#3B1D98',
  tagLight: '#624aad'
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