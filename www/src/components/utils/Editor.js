import React, {useState} from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/lib/codemirror.css'
import './codemirror.css'
require('codemirror/mode/javascript/javascript');

function Editor({value, onChange}) {
  const [state, setState] = useState(value)
  return (
    <CodeMirror value={state}
                options={{mode: 'javascript', lineNumbers: true}}
                onChange={(val) => {
                  setState(val)
                  onChange(val)
                 }} />
  )
}

export default Editor