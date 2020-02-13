import React from 'react'

export default function ScrollableContainer({children}) {
  return (
    <div style={{height: '100%', overflow: 'auto'}}>
      {children}
    </div>
  )
}