import {
  Button,
  CloseIcon,
  DiscordIcon,
  IconFrame,
  Modal,
  StarIcon,
  ThumbsUpFilledIcon,
  ThumbsUpIcon,
} from '@pluralsh/design-system'
import { Flex, P, Span } from 'honorable'
import {
  cloneElement,
  useContext,
  useEffect,
  useState,
} from 'react'
import Fireworks from '@fireworks-js/react'

import useOnboarded from '../hooks/useOnboarded'

import { State, TerminalContext } from './context/terminal'

function HoveredIcon({
  icon,
  color,
  hoveredColor,
  textValue,
  ...props
}: any) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <IconFrame
      cursor="pointer"
      padding="xsmall"
      textValue={textValue}
      icon={cloneElement(icon, {
        color: isHovered ? hoveredColor : color,
      })}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    />
  )
}

function NextStepsModal() {
  const [open, setOpen] = useState(false)
  const [feedback, setFeedback] = useState<'good' | 'bad'>()
  const { state } = useContext(TerminalContext)
  const { fresh: isOnboarding } = useOnboarded()

  useEffect(() => (state === State.Installed && isOnboarding ? setOpen(true) : undefined), [state, isOnboarding])

  return (
    <>
      {open && (
        <Fireworks
          options={{}}
          style={{
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            position: 'fixed',
            background: 'transparent',
            zIndex: 999,
          }}
        />
      )}

      <Modal
        size="large"
        open={open}
        style={{ padding: 0 }}
        onClose={() => setOpen(false)}
      >
        <Flex
          direction="column"
          gap="large"
        >
          <Flex
            justify="space-between"
            align="center"
          >
            <Span
              color="text-xlight"
              body2
            >NEXT STEPS
            </Span>
            <IconFrame
              clickable
              onClick={() => setOpen(false)}
              icon={<CloseIcon color="icon-light" />}
            />
          </Flex>
          <Flex
            gap="medium"
            direction="column"
          >
            <Span body1>Congratulations! You’ve started your first deployment.</Span>
            <Span body1>It may take up to thirty minutes for your Plural Console and applications to be fully up and running.</Span>
          </Flex>
          <Flex
            justify="space-between"
            align="center"
          >
            <Span
              body2
              fontWeight={600}
            >How was your experience?
            </Span>
            <Flex>
              <HoveredIcon
                size="small"
                icon={feedback === 'bad' ? <ThumbsUpFilledIcon transform="scale(1, -1)" /> : <ThumbsUpIcon transform="scale(1, -1)" />}
                color={feedback === 'bad' ? 'icon-danger' : 'icon-light'}
                hoveredColor="icon-danger"
                textValue="Bad"
                onClick={() => setFeedback('bad')}
              />
              <HoveredIcon
                size="small"
                icon={feedback === 'good' ? <ThumbsUpFilledIcon /> : <ThumbsUpIcon />}
                color={feedback === 'good' ? 'icon-success' : 'icon-light'}
                hoveredColor="icon-success"
                textValue="Good"
                onClick={() => setFeedback('good')}
              />
            </Flex>
          </Flex>
        </Flex>

        {feedback === 'good' && (
          <Flex
            align="center"
            justify="space-between"
            marginTop="medium"
          >
            <P
              body2
              color="text-light"
            >
              Great! Support our project with a star.
            </P>
            <Button
              secondary
              small
              startIcon={<StarIcon />}
              as="a"
              href="https://github.com/pluralsh/plural"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </Button>
          </Flex>
        )}
        {feedback === 'bad' && (
          <Flex
            align="center"
            justify="space-between"
            marginTop="medium"
          >
            <P
              body2
              color="text-light"
            >
              We're here to help. Ping us on Discord.
            </P>
            <Button
              secondary
              small
              startIcon={<DiscordIcon />}
              as="a"
              href="https://discord.gg/pluralsh"
              target="_blank"
              rel="noopener noreferrer"
            >
              Discord
            </Button>
          </Flex>
        )}
      </Modal>
    </>
  )
}

export { NextStepsModal }
