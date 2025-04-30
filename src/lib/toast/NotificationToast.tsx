'use client'

import Spinner from '@/src/components/sharedComponents/ui/Spinner'
import { useWeb3Status } from '@/src/hooks/useWeb3Status'
import { Toaster as ChakraToaster, Portal, Stack, Toast, createToaster } from '@chakra-ui/react'

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
