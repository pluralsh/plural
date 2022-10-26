import { Box, CheckBox, Text } from 'grommet'

export function NotificationPreferences({ preferences, setPreferences }) {
  return (
    <Box
      pad="small"
      gap="small"
      round="xsmall"
      background="light-2"
    >
      <Text
        size="small"
        weight={500}
      >Notify me on:
      </Text>
      <CheckBox
        toggle
        label="every message"
        checked={preferences.message}
        onChange={({ target: { checked } }) => setPreferences({ ...preferences, message: checked })}
      />
      <CheckBox
        toggle
        label="every update"
        checked={preferences.incidentUpdate}
        onChange={({ target: { checked } }) => setPreferences({ ...preferences, incidentUpdate: checked })}
      />
      <CheckBox
        toggle
        label="every mention"
        checked={preferences.mention}
        onChange={({ target: { checked } }) => setPreferences({ ...preferences, incidentUpdate: checked })}
      />
    </Box>
  )
}
