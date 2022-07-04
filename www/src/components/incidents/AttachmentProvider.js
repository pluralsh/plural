import { createContext, useContext, useMemo, useState } from 'react'
import { DndProvider, useDrop } from 'react-dnd'
import { HTML5Backend, NativeTypes } from 'react-dnd-html5-backend'
import { Div } from 'honorable'

const FILE_DROP_PROPS = {
  borderColor: 'action-link-inline',
  background: 'fill-two-hover', 
}

export const AttachmentContext = createContext({})

export function Dropzone({ children, loaded }) {
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
    <Div
      ref={drop}
      backgroundColor="fill-two"
      border="1px solid border-fill-two"
      borderRadius="medium"
      borderColor={loaded ? 'action-link-inline' : 'border-fill-two'}
      {...(dragActive ? FILE_DROP_PROPS : {})}
    >
      {children}
    </Div>
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
