import {
  ClipboardEvent,
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  FormEvent,
  KeyboardEvent,
  RefObject,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import styled from 'styled-components'
import { applyNodeToRefs } from './applyNodeToRefs'

export function EditableDiv({
  divRef, // workaround until react 19 upgrade
  initialValue,
  setValue,
  onEnter,
  placeholder,
  ...props
}: {
  divRef?: RefObject<HTMLDivElement>
  initialValue?: string
  setValue: (value: string) => void
  onEnter?: () => void
  placeholder?: string
} & ComponentPropsWithoutRef<'div'>) {
  const internalRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    // sets the initial value of the div on first render
    const domNode = internalRef.current
    if (isFirstRender.current && domNode) {
      if (initialValue && initialValue !== '\n')
        domNode.innerText = initialValue
      else domNode.innerHTML = ''
    }
    isFirstRender.current = false
  }, [initialValue])

  const onInput = useCallback(
    (e: FormEvent<HTMLDivElement>) => {
      const content = e.currentTarget.innerText || ''
      // sometimes clearing the input manually leaves a straggler newline
      setValue(content === '\n' ? '' : content)
      if (content === '\n') e.currentTarget.innerHTML = ''
    },
    [setValue]
  )

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      // for handling enter key when onEnter callback is defined
      // if any modifier key is pressed, just allow default behavior (which is adding a new line usually)
      if (e.key === 'Enter' && onEnter) {
        if (e.shiftKey || e.ctrlKey || e.altKey) return
        e.preventDefault()
        onEnter?.()
      }
    },
    [onEnter]
  )

  const onPaste = useCallback(
    (e: ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault()
      const text = e.clipboardData?.getData('text/plain')
      // take the current selection, remove whatever's there if anything, and insert the pasted text
      const selection = document.getSelection()
      if (!selection?.rangeCount || !text) return
      selection.deleteFromDocument()
      selection.getRangeAt(0).insertNode(document.createTextNode(text))
      selection.collapseToEnd()
      setValue(internalRef.current?.innerText ?? '')
    },
    [setValue]
  )

  return (
    <ContentEditableDivSC
      ref={(node) => applyNodeToRefs([internalRef, divRef], node)}
      contentEditable
      data-placeholder={placeholder}
      onInput={onInput}
      onPaste={onPaste}
      onKeyDown={onKeyDown}
      {...props}
    />
  )
}

const ContentEditableDivSC = styled.div(({ theme }) => ({
  ...theme.partials.text.body2,
  flex: 1,
  border: 'none',
  outline: 'none',
  overflowY: 'auto',
  whiteSpace: 'pre-wrap',
  '&:empty:before': {
    content: 'attr(data-placeholder)',
    color: theme.colors['text-xlight'],
    pointerEvents: 'none',
  },
}))
