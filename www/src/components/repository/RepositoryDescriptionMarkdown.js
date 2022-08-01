import { Children, memo } from 'react'
import { Markdown } from 'grommet'
import {
  A, Blockquote, Box, Code, H1, H2, H3, H4, H5, H6, Img, Li, Ol, P, Ul,
} from 'honorable'

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

function getLastStringChild(children) {
  let lastChild = null

  Children.forEach(children, child => {
    if (typeof child === 'string') {
      lastChild = child
    }
    else if (child.props && child.props.children) {
      lastChild = getLastStringChild(child.props.children)
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
    <Box mb={1}>
      <MultilineCode
        language={lang}
        {...props}
      >{stringChild}
      </MultilineCode>
    </Box>
  )
}

const codeStyle = {
  background: 'fill-one',
  borderRadius: '4px',
  marginRight: 'medium',
}

export default memo(({ text, gitUrl }) => (
  <Markdown
    components={{
      blockquote: {
        component: Blockquote,
        props: {
          borderLeft: '4px solid', borderColor: 'border', mx: 0, pl: '1em',
        },
      },
      ul: { component: Ul, props: { paddingLeft: 'xlarge', marginBottom: 'small' } },
      ol: { component: Ol, props: { paddingLeft: 'xlarge', marginBottom: 'small' } },
      li: { component: Li, props: { body1: true, marginTop: 'xxsmall' } },
      h1: {
        component: H1,
        props: {
          title2: true, color: 'text', marginTop: 'large', marginBottom: 'small', ':first-of-type': { marginTop: '0px' },
        },
      },
      h2: {
        component: H2,
        props: {
          subtitle1: true, color: 'text', marginTop: 'large', marginBottom: 'small', ':first-of-type': { marginTop: '0px' },
        },
      },
      h3: {
        component: H3,
        props: {
          subtitle2: true, bold: true, color: 'text', marginTop: 'large', marginBottom: 'small', ':first-of-type': { marginTop: '0px' },
        },
      },
      h4: {
        component: H4,
        props: {
          body1: true, bold: true, color: 'text', marginTop: 'large', marginBottom: 'small', ':first-of-type': { marginTop: '0px' },
        },
      },
      h5: {
        component: H5,
        props: {
          body1: true, bold: true, color: 'text', marginTop: 'large', marginBottom: 'small', ':first-of-type': { marginTop: '0px' },
        },
      },
      h6: {
        component: H6,
        props: {
          body1: true, bold: true, color: 'text', marginTop: 'large', marginBottom: 'small', ':first-of-type': { marginTop: '0px' },
        },
      },
      img: {
        component: MdImg,
        props: {
          gitUrl, style: { maxWidth: '100%' },
        },
      },
      p: { component: P, props: { body1: true, marginBottom: 'medium' } },
      a: {
        component: A,
        props: {
          inline: true,
          display: 'inline',
          target: '_blank',
          // display: 'inline', color: 'text-light', size: 'small', target: '_blank',
        },
      },
      span: { props: { style: { verticalAlign: 'bottom' } } },
      code: {
        component: Code,
        props: {
          ...codeStyle,
          ...{ mx: '0.2em', px: '0.3em', py: '0.2em' },
        },
      },
      pre: {
        component: MdPre,
        props: { ...codeStyle, ...{ px: '1em', py: '0.65em' } },
      },
    }}
  >
    {text}
  </Markdown>
))
