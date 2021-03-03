import React from 'react'
import { Divider } from 'forge-core'
import { formatDate } from './MessageDivider'

export const LastMessage = ({date}) => <Divider text={formatDate(date)} />