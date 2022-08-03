import { Children, memo } from 'react'
import {
  A, Blockquote, Code, Div, H1, H2, H3, H4, H5, H6, Img, Li, Ol, P, Ul,
} from 'honorable'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

import MultilineCode from '../utils/Code'

function MdImg({ src, gitUrl, ...props }) {
  // Convert local image paths to full path on github
  // Only works if primary git branch is named "master"
  if (gitUrl && src && !src.match(/^https*/)) {
    src = `${gitUrl}/raw/master/${src}`
  }

  return (
    <Img
      src={src}
      maxWidth="100%"
      display="inline"
      {...props}
    />
  )
}

function getLastStringChild(children, depth = 0) {
  let lastChild = null

  Children.forEach(children, child => {
    if (typeof child === 'string') {
      lastChild = child
    }
    else if (child.props && child.props.children && depth < 3) {
      lastChild = getLastStringChild(child.props.children, depth + 1)
    }
  })

  return lastChild
}

function MdPre({ children, ...props }) {
  let lang

  if (children.props?.className?.startsWith('lang-')) {
    lang = children.props.className.slice(5)
  }
  const stringChild = getLastStringChild(children) || ''

  return (
    <Div mb={1}>
      <MultilineCode
        language={lang}
        {...props}
      >
        {stringChild}
      </MultilineCode>
    </Div>
  )
}

const codeStyle = {
  background: 'fill-one',
  borderRadius: '4px',
}

const toReactMarkdownComponent = ({ component: Component, props }) => function renderComponent(p) {
  return (
    <Component
      {...{
        ...p,
        ...props,
      }}
    />
  )
}

export default memo(({ text, gitUrl }) => (
  <Div>
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]}
      components={{
        blockquote: toReactMarkdownComponent({
          component: Blockquote,
          props: {
            borderLeft: '4px solid',
            borderColor: 'border',
            mx: 0,
            pl: '1em',
          },
        }),
        ul: toReactMarkdownComponent({
          component: Ul,
          props: { paddingLeft: 'xlarge', marginBottom: 'small' },
        }),
        ol: toReactMarkdownComponent({
          component: Ol,
          props: { paddingLeft: 'xlarge', marginBottom: 'small' },
        }),
        li: toReactMarkdownComponent({
          component: Li,
          props: { body2: true, marginTop: 'xxsmall' },
        }),
        h1: toReactMarkdownComponent({
          component: H1,
          props: {
            subtitle1: true,
            marginTop: 'large',
            marginBottom: 'small',
            ':first-child': { marginTop: '0px' },
          },
        }),
        h2: toReactMarkdownComponent({
          component: H2,
          props: {
            subtitle2: true,
            marginTop: 'large',
            marginBottom: 'small',
            ':first-child': { marginTop: '0px' },
          },
        }),
        h3: toReactMarkdownComponent({
          component: H3,
          props: {
            body1: true,
            bold: true,
            marginTop: 'large',
            marginBottom: 'small',
            ':first-child': { marginTop: '0px' },
          },
        }),
        h4: toReactMarkdownComponent({
          component: H4,
          props: {
            body2: true,
            bold: true,
            marginTop: 'large',
            marginBottom: 'small',
            ':first-child': { marginTop: '0px' },
          },
        }),
        h5: toReactMarkdownComponent({
          component: H5,
          props: {
            body2: true,
            bold: true,
            marginTop: 'large',
            marginBottom: 'small',
            ':first-child': { marginTop: '0px' },
          },
        }),
        h6: toReactMarkdownComponent({ component: H6, props: {} }),
        img: props => (
          <MdImg
            {...{
              ...props,
              ...{
                gitUrl,
                style: { maxWidth: '100%' },
              },
            }}
          />
        ),
        p: toReactMarkdownComponent({
          component: P,
          props: { body2: true, marginBottom: 'medium' },
        }),
        div: toReactMarkdownComponent({
          component: Div,
          props: { body2: true, marginBottom: 'medium' },
        }),
        a: toReactMarkdownComponent({
          component: A,
          props: {
            inline: true,
            display: 'inline',
            target: '_blank',
            // display: 'inline', color: 'text-light', size: 'small', target: '_blank',
          },
        }),
        span: toReactMarkdownComponent({
          props: { style: { verticalAlign: 'bottom' } },
        }),
        code: toReactMarkdownComponent({
          component: Code,
          props: {
            ...codeStyle,
            ...{ mx: '0.2em', px: '0.3em', py: '0.2em' },
          },
        }),
        pre: toReactMarkdownComponent({
          component: MdPre,
          props: { ...codeStyle, ...{ px: '1em', py: '0.65em' } },
        }),
      }}
    >
      {text}
    </ReactMarkdown>
  </Div>
))
