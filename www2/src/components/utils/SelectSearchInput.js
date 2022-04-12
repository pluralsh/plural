import React, {useState, createRef, Component, createContext} from 'react';
import { css } from 'styled-components';
import { Box, ThemeContext, TextInput } from 'grommet';
import {normalizeColor} from './colors'

const searchingStyle = css`
  position: relative;
  outline: none;
  box-shadow: none;
  &:before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: ${props => normalizeColor('light-2', props.theme)};
  }
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    will-change: left, right;
    background: ${props => normalizeColor('brand', props.theme)};
    animation: progress 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    transform: translateX(-50%) scaleX(0);
  }
  @keyframes progress {
    0% {
      transform: translateX(-50%) scaleX(0);
    }
    50% {
      transform: translateX(12.5%) scaleX(0.75);
    }
    100% {
      transform: translateX(50%) scaleX(0);
    }
  }
`;

const defaultStyle = css`
  position: relative;
  outline: none;
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background: transparent;
    transition: width 0.2s ease, background 0.2s ease, left 0.2s ease;
  }
  ${props =>
    props.focus &&
    `
    box-shadow: none;
    &:after {
      left: 0;
      width: 100%;
      background: ${normalizeColor('brand', props.theme)};
    }
  `};
`;

const boxBorderTheme = {
  box: {
    extend: props => (props.searching ? searchingStyle : defaultStyle),
  },
};

export const SearchInputContext = createContext({});

export function SearchBorderBox(props) {
  const [focus, setFocus] = useState(false)
  const { children, searching, ...rest } = props
  return (
    <SearchInputContext.Consumer>
    {({searching}) => (
      <ThemeContext.Extend value={boxBorderTheme}>
        <Box
          focus={focus}
          searching={searching}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          {...rest}
        >
          {children}
        </Box>
      </ThemeContext.Extend>
    )}
    </SearchInputContext.Consumer>
  )
}

export class SearchInput extends Component {
  textInputRef = createRef();

  componentDidMount() {
    this.focusTimeout = setTimeout(() => {
      this.textInputRef.current.focus();
    }, 300);
  }

  componentWillUnmount() {
    clearTimeout(this.focusTimeout);
  }

  render() {
    return (
      <SearchInputContext.Consumer>
        {({ searching }) => (
          <SearchBorderBox searching={searching}>
            <TextInput {...this.props} plain ref={this.textInputRef} />
          </SearchBorderBox>
        )}
      </SearchInputContext.Consumer>
    );
  }
}