import React from 'react'
import {Box, Text} from 'grommet'

function BotIcon(props) {
  return (
    <Box pad='xxsmall' margin={props.margin || {right: '5px'}} round='xxsmall' background={props.color || 'light-4'}>
      <Text size='10px'>BOT</Text>
    </Box>
  )
}

export default BotIcon