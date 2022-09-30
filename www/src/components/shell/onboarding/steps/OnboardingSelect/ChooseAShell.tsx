import {
  Div,
  H2,
  P,
  RadioGroup,
} from 'honorable'
import { Radio } from 'pluralsh-design-system'

function ChooseAShell({ options, selected, setSelected }) {
  return (
    <Div
      width="100%"
      marginTop="large"
    >
      <H2
        overline
        color="text-xlight"
        marginBottom="xsmall"
        width="100%"
      >
        Choose a shell
      </H2>
      <P
        body1
        color="text-light"
        marginBottom="medium"
      >
        Determine which shell you'll use to get started. The cloud shell comes fully equipped with the Plural CLI and all required dependencies.
      </P>
      <RadioGroup>
        {options.map(({ label, value }) => (
          <Radio
            key={value}
            value={value}
            defaultChecked={value === 'cloud'}
            checked={value === selected}
            onClick={() => setSelected(value)}
          >
            {label}
          </Radio>
        ))}
      </RadioGroup>
    </Div>
  )
}

export default ChooseAShell
