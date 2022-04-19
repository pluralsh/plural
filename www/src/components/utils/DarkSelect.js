import { Select } from 'forge-core'

export function DarkSelect({ options, value, onChange }) {
  return (
    <Select
      options={options}
      value={value}
      colors={{
        neutral0: 'card',
        neutral80: '#fff',
        neutral60: '#fff',
        primary: 'blue-light',
        primary25: 'blue-light',
        neutral20: 'plrl-black',
        neutral30: 'blue-light',
      }}
      onChange={onChange}
    />
  )
}
