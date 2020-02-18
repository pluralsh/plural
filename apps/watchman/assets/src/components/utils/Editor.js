import React, {useState} from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/theme/nord.css'
import './codemirror.css'
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/yaml/yaml');


function Editor({value, onChange, lang}) {
  const [state, setState] = useState(value)
  return (
    <CodeMirror
      value={state}
      options={{mode: lang || 'javascript', lineNumbers: true}}
      onChange={(val) => {
        setState(val)
        onChange(val)
        }} />
  )
}

export default Editor