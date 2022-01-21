import styled, { keyframes } from 'styled-components'


const scale3d = (a, b, c) => `scale3d(${a}, ${b}, ${c})`

const pulse = {
  from: {
    transform: scale3d(1, 1, 1)
  },
  '50%': {
    transform: scale3d(0.8, 0.8, 0.8)
  },
  to: {
    transform: scale3d(1, 1, 1)
  }
}

const pulseAnimation = keyframes`${pulse}`;

export const PulsyDiv = styled.div`
  animation: 2s ${pulseAnimation} infinite;
`;