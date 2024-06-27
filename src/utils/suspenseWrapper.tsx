import { type ReactNode, Suspense, type ComponentType, isValidElement } from 'react'

import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { Button } from 'db-ui-toolkit'
import { ErrorBoundary, type ErrorBoundaryPropsWithRender } from 'react-error-boundary'

export type WithSuspenseProps = {
  errorFallback?: ReactNode
  suspenseFallback?: ReactNode
}

/**
 * A generic wrapper for all the components that uses suspense
 *
 * @param WrappedComponent - a component that will be wrapper inside an ErrorBoundary and a Suspense
 * @returns {ComponentType}
 */
export const withSuspense = <WrappedProps extends object>(
  WrappedComponent: ComponentType<WrappedProps>,
): ComponentType<WrappedProps & WithSuspenseProps> => {
  return function SuspenseWrapper({
    errorFallback,
    suspenseFallback,
    ...restProps
  }: WithSuspenseProps & WrappedProps) {
    return (
      <ErrorBoundary
        fallback={
          isValidElement(errorFallback) ? (
            errorFallback
          ) : (
            <>{errorFallback ?? 'something went wrong...'}</>
          )
        }
      >
        <Suspense fallback={suspenseFallback ?? 'loading...'}>
          <WrappedComponent {...(restProps as WrappedProps)} />
        </Suspense>
      </ErrorBoundary>
    )
  }
}

export type WithSuspenseAndRetryProps = {
  fallbackRender?: ErrorBoundaryPropsWithRender['fallbackRender']
  suspenseFallback?: ReactNode
}

const defaultReset: ErrorBoundaryPropsWithRender['fallbackRender'] = ({ resetErrorBoundary }) => (
  <div>
    <p>There was an error!</p>
    <Button onClick={() => resetErrorBoundary()}>Try again</Button>
  </div>
)

/**
 * A wrapper for a component that uses suspense, with the capacity to retry if a useSuspenseQuery fails
 *
 * @param WrappedComponent - a component wrapped inside a tanstack's QueryErrorResetBoundary, ErrorBoundary, and a Suspense
 * @returns {ComponentType}
 */
export const withSuspenseAndRetry = <WrappedProps extends object>(
  WrappedComponent: ComponentType<WrappedProps>,
): ComponentType<WrappedProps & WithSuspenseAndRetryProps> => {
  return function SuspenseAndRetryWrapper({
    fallbackRender,
    suspenseFallback,
    ...restProps
  }: WithSuspenseAndRetryProps & WrappedProps) {
    return (
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary fallbackRender={fallbackRender || defaultReset} onReset={reset}>
            <Suspense fallback={suspenseFallback ?? 'loading...'}>
              <WrappedComponent {...(restProps as WrappedProps)} />
            </Suspense>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    )
  }
}
