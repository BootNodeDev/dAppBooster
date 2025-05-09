import DemoButton from '@/src/components/pageComponents/home/Examples/Item/buttons/DemoButton'
import DocumentationButton from '@/src/components/pageComponents/home/Examples/Item/buttons/DocumentationButton'
import Modal from '@/src/components/sharedComponents/ui/Modal'
import { Dialog, Flex, type FlexProps, Heading, Portal, Text } from '@chakra-ui/react'
import { type FC, type ReactNode, useState } from 'react'
import styles from './styles'

export interface Props extends FlexProps {
  demo: ReactNode
  href?: string
  icon: ReactNode
  text: string | ReactNode
  title: string
}

const Item: FC<Props> = ({ css, demo, href, icon, text, title, ...restProps }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <Flex
      backgroundColor="var(--background-color)"
      border="1px solid var(--border-color)"
      borderRadius="8px"
      display="flex"
      flexDirection="column"
      minHeight="288px"
      minWidth="0"
      maxWidth="100%"
      padding={6}
      css={{
        ...styles,
        ...css,
      }}
      {...restProps}
    >
      <Flex
        css={{
          '--icon-size': '48px',
        }}
        alignItems="center"
        border="1px solid var(--icon-border-color)"
        borderRadius="50%"
        color="#C670E5"
        display="flex"
        height="var(--icon-size)"
        justifyContent="center"
        marginBottom={4}
        width="var(--icon-size)"
      >
        {icon}
      </Flex>
      <Heading
        as="h3"
        color="var(--title-color)"
        fontSize="18px"
        fontWeight={700}
        lineHeight="1.5"
      >
        {title}
      </Heading>
      <Text
        css={{
          '& a': {
            color: 'var(--text-color)',
            textDecoration: 'underline',
            '&:hover': {
              textDecoration: 'none',
            },
          },
        }}
        color="var(--text-color)"
        fontSize="16px"
        fontWeight={500}
        lineHeight="1.6"
        margin="0"
        opacity="0.6"
      >
        {text}
      </Text>
      <Flex
        flexDirection={{ base: 'column', md: 'row' }}
        gap={2}
        marginTop="auto"
        paddingTop={6}
      >
        {href && (
          <DocumentationButton
            href={href}
            target="_blank"
          />
        )}
        <Dialog.Root
          lazyMount
          open={isModalOpen}
          onOpenChange={(e) => setIsModalOpen(e.open)}
          size="lg"
        >
          <Dialog.Trigger asChild>
            <DemoButton />
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content width={'auto'}>
                <Modal
                  onClose={() => setIsModalOpen(false)}
                  text={text}
                  title={title}
                  width="632px"
                >
                  <Flex
                    css={{
                      'html.light &': {
                        '--demo-background-color': '#F7F7F7',
                      },
                      'html.dark &': {
                        '--demo-background-color': '#24263D',
                      },
                    }}
                    alignItems="center"
                    backgroundColor="var(--demo-background-color)"
                    borderRadius="8px"
                    flexDirection="column"
                    height="500px"
                    justifyContent="center"
                    padding={5}
                    position="relative"
                    width="100%"
                  >
                    {demo}
                  </Flex>
                </Modal>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </Flex>
    </Flex>
  )
}

export default Item
