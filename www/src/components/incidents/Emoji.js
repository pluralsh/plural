import 'emoji-mart/css/emoji-mart.css'
import emojiData from 'emoji-mart/data/google.json'
import { NimblePicker } from 'emoji-mart'

export function EmojiPicker(props) {
  return (
    <NimblePicker
      set="google"
      data={emojiData}
      sheetSize={16}
      {...props}
    />
  )
}
