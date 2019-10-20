export const DEFAULT_COLOR_THEME = {
  brand: '#2F415B',
  sidebar: '#2F415B',
  action: '#2F415B',
  actionHover: '#2a3b52',
  focus: '#CF6D57',
  sidebarHover: '#263449',
  tagLight: '#6d7a8c',
  tagMedium: '#59677c',
  focusText: '#FFFFFF',
  activeText: '#FFFFFF',
  sidebarText: '#C0C0C0',
  sidebarTextHover: '#FFFFFF',
  highlight: '#cdd7e5',
  highlightDark: '#a4acb7',
  notif: '#EB4D5C',
  lightHover: '#EDEDED',
  presence: '#006633'
}

export const DEFAULT_THEME = {
  anchor: {
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