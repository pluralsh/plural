import React from 'react'
import { Box } from 'grommet' 
import './logo-animation.css'

const BOTTOM_LEFT = process.env.PUBLIC_URL + '/plural-logomark-mechanical-for-animation-blk_bottom-left_100px.svg'
const BOTTOM_RIGHT = process.env.PUBLIC_URL + '/plural-logomark-mechanical-for-animation-blk_bottom-right_100px.svg'
const TOP_LEFT = process.env.PUBLIC_URL + '/plural-logomark-mechanical-for-animation-blk_top-left_100px.svg'
const TOP_RIGHT = process.env.PUBLIC_URL + '/plural-logomark-mechanical-for-animation-blk_top-right_100px.svg'
const DOT = process.env.PUBLIC_URL + '/plural-logomark-mechanical-for-animation-blk_dot_100px.svg'

function scaling(scale) {
  if (!scale) return null
  return {transform: `scale(${scale})`}
}

export function LoopingLogo({height, scale}) {
  return (
    <Box fill height={height} align='center' justify='center'>
      <div class="plrl-logomark-anim anim01 looping">
        <div class="plrl-logomark-outer-wrapper">
          <div style={scaling(scale)} class="plrl-logomark-inner-wrapper">
            <div class="plrl-logo-layer bottom-left">
              <div class="plrl-logo-layer-mask">
                <div class="plrl-logo-layer-mask-inner">
                  <img src={BOTTOM_LEFT} alt="" />
                </div>
              </div>
            </div>
            <div class="plrl-logo-layer bottom-right">
              <div class="plrl-logo-layer-mask">
                <div class="plrl-logo-layer-mask-inner">
                  <img src={BOTTOM_RIGHT} alt="" />
                </div>
              </div>
            </div>
            <div class="plrl-logo-layer top-left">
              <div class="plrl-logo-layer-mask">
                <div class="plrl-logo-layer-mask-inner">
                  <img src={TOP_LEFT} alt="" />
                </div>
              </div>
            </div>
            <div class="plrl-logo-layer top-right">
              <div class="plrl-logo-layer-mask">
                <div class="plrl-logo-layer-mask-inner">
                  <img src={TOP_RIGHT} alt="" />
                </div>
              </div>
            </div>
            <div class="plrl-logo-layer dot">
              <div class="plrl-logo-layer-mask">
                <div class="plrl-logo-layer-mask-inner">
                  <img src={DOT} alt="" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Box>
  )
}