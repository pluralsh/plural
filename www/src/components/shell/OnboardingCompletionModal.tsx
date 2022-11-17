import { cloneElement, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Flex, P } from 'honorable'
import {
  ArrowTopRightIcon,
  DiscordIcon,
  IconFrame,
  Modal,
  StarIcon,
  ThumbsUpFilledIcon,
  ThumbsUpIcon,
} from '@pluralsh/design-system'
import Fireworks from '@fireworks-js/react'

type OnboardingCompletionModalProps = {
  open: boolean
  onClose: () => void
  skipConsoleInstall: boolean
  shell: any
}

function OnboardingCompletionModal({
  open,
  onClose,
  skipConsoleInstall,
  shell,
}: OnboardingCompletionModalProps) {
  const [feedback, setFeedback] = useState<null | 'good' | 'bad'>(null)

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
        header="Next steps"
        width={512}
        maxWidth={512}
        open={open}
        onClose={onClose}
        borderTop="4px solid border-success"
      >
        <P marginBottom="large">
          Congratulations, you've installed your first apps!
        </P>
        {skipConsoleInstall && (
          <Button
            primary
            width="100%"
            as={Link}
            to="/installed"
          >
            View my apps
          </Button>
        )}
        {!skipConsoleInstall && (
          <Flex align="center">
            <Button
              primary
              as="a"
              href={`https://console.${shell.subdomain}`}
              target="_blank"
              rel="noopener noreferrer"
              endIcon={<ArrowTopRightIcon />}
              flexGrow={1}
              marginRight="medium"
            >
              Go to Plural Console
            </Button>
            <Button
              secondary
              as={Link}
              to="/install"
              flexGrow={1}
            >
              View my apps
            </Button>
          </Flex>
        )}
        <Flex
          align="center"
          justify="space-between"
          marginTop="large"
        >
          <P>
            How was your experience?
          </P>
          <Flex align="center">
            <HoveredIcon
              icon={feedback === 'bad' ? <ThumbsUpFilledIcon transform="scale(1, -1)" /> : <ThumbsUpIcon transform="scale(1, -1)" />}
              color={feedback === 'bad' ? 'icon-danger' : 'text-light'}
              hoveredColor="icon-danger"
              textValue="Bad"
              onClick={() => setFeedback('bad')}
            />
            <HoveredIcon
              icon={feedback === 'good' ? <ThumbsUpFilledIcon /> : <ThumbsUpIcon />}
              color={feedback === 'good' ? 'icon-success' : 'text-light'}
              hoveredColor="icon-success"
              textValue="Good"
              onClick={() => setFeedback('good')}
            />
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
export default OnboardingCompletionModal
