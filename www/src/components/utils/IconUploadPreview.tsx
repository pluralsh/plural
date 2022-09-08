import { MouseEventHandler } from 'react'
import {
  Flex,
  Img,
  P,
} from 'honorable'

type IconUploadPreviewProps = {
  src: string | null;
  onClick: MouseEventHandler;
}

function IconUploadPreview({
  src = null,
  onClick,
}: IconUploadPreviewProps) {
  if (!src) {
    return (
      <Flex
        width={96}
        height={96}
        backgroundColor="fill-two"
        _hover={{
          backgroundColor: 'fill-two-hover',
        }}
        border="1px solid border-fill-two"
        borderRadius="medium"
        align="center"
        justify="center"
        cursor="pointer"
        onClick={onClick}
      >
        <P
          title2
          color="text-light"
        >
          +
        </P>
      </Flex>
    )
  }

  return (
    <Img
      src={src}
      alt="Icon"
      width={96}
      height={96}
      objectFit="cover"
      backgroundColor="fill-one"
      cursor="pointer"
      border="1px solid border"
      onClick={onClick}
    />
  )
}

export default IconUploadPreview
