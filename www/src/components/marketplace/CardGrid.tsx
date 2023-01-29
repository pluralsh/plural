import { Div, DivProps } from 'honorable'

export function CardGrid(props: DivProps) {
  return (
    <Div
      display="grid"
      gap="large"
      gridTemplateColumns="repeat(auto-fit, minmax(340px, 1fr))"
      {...props}
    />
  )
}
