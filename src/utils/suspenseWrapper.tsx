import { GeneralMessage } from '@/src/components/sharedComponents/ui/GeneralMessage'
import PrimaryButton from '@/src/components/sharedComponents/ui/PrimaryButton'
import { Flex, Spinner } from '@chakra-ui/react'
import { Dialog, Portal } from '@chakra-ui/react'
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { type ComponentType, type JSX, type ReactNode, Suspense } from 'react'
import { ErrorBoundary, type ErrorBoundaryPropsWithRender } from 'react-error-boundary'

export type DefaultFallbackFormat = 'dialog' | 'default'

export type WithSuspenseProps = {
  defaultFallbackFormat?: DefaultFallbackFormat
  errorFallback?: ReactNode
  suspenseFallback?: ReactNode
}

const DefaultFallback = ({
  size = 'lg',
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}): JSX.Element => (
  <Flex
    alignItems="center"
    justifyContent="center"
    height="100%"
    width="100%"
    padding={4}
  >
    <Spinner
      color="var(--theme-spinner-color)"
      size={size}
    />
  </Flex>
)

/**
 * A generic wrapper for all the components that use suspense
 *
 * @param WrappedComponent - a component that will be wrapped inside ErrorBoundary and Suspense
 * @param {ReactNode} [errorFallback] - a custom fallback for ErrorBoundary
 * @param {ReactNode} [suspenseFallback] - a custom fallback for Suspense
 * @param {DefaultFallbackFormat} [defaultFallbackFormat] - Optional. Can be a dialog or just text or custom component (default).
 * @returns {ComponentType}
 */
export const withSuspense = <WrappedProps extends object>(
  WrappedComponent: ComponentType<WrappedProps>,
): ComponentType<WrappedProps & WithSuspenseProps> => {
  return function SuspenseWrapper({
    defaultFallbackFormat = 'default',
    errorFallback,
    suspenseFallback,
    ...restProps
  }: WithSuspenseProps & WrappedProps) {
    const errorMessage = errorFallback ? errorFallback : 'Something went wrong...'

    const fallbackRenderers = {
      default: <>{errorMessage}</>,
      dialog: (
        <Dialog.Root
          open
          size="xs"
        >
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <GeneralMessage message={<span>{errorMessage}</span>} />
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      ),
    }

    const fallback = fallbackRenderers[defaultFallbackFormat] ?? null

    return (
      <ErrorBoundary fallback={fallback}>
        <Suspense fallback={suspenseFallback ?? <DefaultFallback />}>
          <WrappedComponent {...(restProps as WrappedProps)} />
        </Suspense>
      </ErrorBoundary>
    )
  }
}

interface ErrorBoundaryPropsWithRenderProps {
  error: Error
  resetErrorBoundary: () => void
}

/**
 * Default fallback render for ErrorBoundary
 *
 * @param {Error} error - the error object
 * @param {Function} resetErrorBoundary - a function to reset the error boundary
 * @returns {ReactNode}
 */
const defaultFallbackRender: ErrorBoundaryPropsWithRender['fallbackRender'] = ({
  error,
  resetErrorBoundary,
}: ErrorBoundaryPropsWithRenderProps): ReactNode => (
  <>
    <div>{error.message}</div>
    <PrimaryButton onClick={resetErrorBoundary}>Try Again</PrimaryButton>
  </>
)

/**
 * Default reset for ErrorBoundary shown on a dialog
 *
 * @param {Error} error - the error object
 * @param {Function} resetErrorBoundary - a function to reset the error boundary
 * @returns {ReactNode}
 */

const defaultFallbackRenderDialog: ErrorBoundaryPropsWithRender['fallbackRender'] = ({
  error,
  resetErrorBoundary,
}: ErrorBoundaryPropsWithRenderProps): ReactNode => (
  <Dialog.Root
    open
    size="xs"
  >
    <Portal>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <GeneralMessage
            actionButton={<PrimaryButton onClick={resetErrorBoundary}>Try again</PrimaryButton>}
            message={error.message}
          />
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  </Dialog.Root>
)

export type WithSuspenseAndRetryProps = {
  fallbackRender?: ErrorBoundaryPropsWithRender['fallbackRender']
  suspenseFallback?: ReactNode
  defaultFallbackFormat?: DefaultFallbackFormat
  spinnerSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

/**
 * A wrapper for a component that uses suspense, with the capacity to retry if a useSuspenseQuery fails
 *
 * @param WrappedComponent - a component wrapped inside a tanstack's QueryErrorResetBoundary, ErrorBoundary, and a Suspense
 * @param {ReactNode} [fallbackRender] - a custom fallback render for ErrorBoundary
 * @param {DefaultFallbackFormat} [defaultFallbackFormat] - Optional. Can be a dialog or just text (default). Has no effect if `fallbackRender` is provided
 * @param {ReactNode} [suspenseFallback] - a custom fallback for Suspense
 *  @param {'xs' | 'sm' | 'md' | 'lg' | 'xl'} [spinnerSize] - Optional. Sets the size of the default spinner shown during suspense loading. Default is 'lg'.
 * @returns {ComponentType}
 */
export const withSuspenseAndRetry = <WrappedProps extends object>(
  WrappedComponent: ComponentType<WrappedProps>,
): ComponentType<WrappedProps & WithSuspenseAndRetryProps> => {
  return function SuspenseAndRetryWrapper({
    defaultFallbackFormat = 'default',
    fallbackRender: customFallbackRender,
    suspenseFallback,
    spinnerSize,
    ...restProps
  }: WithSuspenseAndRetryProps & WrappedProps) {
    const fallbackRenderers = {
      customFallbackRender,
      dialog: defaultFallbackRenderDialog,
      default: defaultFallbackRender,
    }

    const fallbackRender =
      fallbackRenderers.customFallbackRender ??
      fallbackRenderers[defaultFallbackFormat] ??
      fallbackRenderers.default

    return (
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            fallbackRender={fallbackRender}
            onReset={reset}
          >
            <Suspense fallback={suspenseFallback ?? <DefaultFallback size={spinnerSize} />}>
              <WrappedComponent {...(restProps as WrappedProps)} />
            </Suspense>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    )
  }
}
