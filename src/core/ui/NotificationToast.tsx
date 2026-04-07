'use client'

import { Toaster as ChakraToaster, createToaster, Portal, Stack, Toast } from '@chakra-ui/react'
// TODO(task-3): move to app shell — core/ should not import from wallet/
import { useWeb3Status } from '@/src/wallet/hooks'
import Spinner from './Spinner'

export const notificationToaster = createToaster({
  placement: 'bottom-end',
  pauseOnPageIdle: true,
  max: 1,
  overlap: false,
})

export const NotificationToast = () => {
  const { readOnlyClient } = useWeb3Status()
  const chain = readOnlyClient?.chain
  return !chain ? null : (
    <Portal>
      <ChakraToaster
        toaster={notificationToaster}
        insetInline={{ mdDown: '4' }}
      >
        {(toast) => (
          <Toast.Root width={{ md: 'sm' }}>
            {toast.type === 'loading' ? <Spinner size="sm" /> : <Toast.Indicator />}
            <Stack
              gap="1"
              flex="1"
              maxWidth="100%"
            >
              {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
              {toast.description && (
                <Toast.Description
                  css={{
                    a: {
                      color: '{colors.primary.default}',
                    },
                  }}
                >
                  {toast.description}
                </Toast.Description>
              )}
            </Stack>
            {toast.meta?.closable && <Toast.CloseTrigger />}
          </Toast.Root>
        )}
      </ChakraToaster>
    </Portal>
  )
}
