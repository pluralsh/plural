import { createContext, useContext, useMemo, useState } from 'react'
import { Box } from 'grommet'
import { DndProvider, useDrop } from 'react-dnd'
import { HTML5Backend, NativeTypes } from 'react-dnd-html5-backend'

const DROP_BACKGROUND = 'rgba(255, 255, 255, 0.2)'
const FILE_DROP_PROPS = {
  border: { color: 'focus', style: 'dashed', size: '2px' },
  background: DROP_BACKGROUND,
}

export const AttachmentContext = createContext({})

export function Dropzone({ children }) {
  const { setAttachment } = useContext(AttachmentContext)

  const [{ canDrop, isOver }, drop] = useDrop({
    accept: [NativeTypes.FILE],
    drop: ({ files }) => setAttachment(files[0]),
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })
  const dragActive = canDrop && isOver

  return (
    <Box
      ref={drop}
      fill
      {...(dragActive ? FILE_DROP_PROPS : {})}
    >
      {children}
    </Box>
  )
}

export function AttachmentProvider({ children }) {
  const [attachment, setAttachment] = useState(null)
  const value = useMemo(() => ({ attachment, setAttachment }), [attachment, setAttachment])

  return (
    <AttachmentContext.Provider value={value}>
      <DndProvider backend={HTML5Backend}>
        {children}
      </DndProvider>
    </AttachmentContext.Provider>
  )
}
