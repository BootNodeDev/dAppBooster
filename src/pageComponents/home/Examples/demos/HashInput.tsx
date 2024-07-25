import { useState } from 'react'
import styled from 'styled-components'

import { Textfield as BaseTextfield, Spinner } from 'db-ui-toolkit'
import { mainnet } from 'viem/chains'

import BaseHashInput from '@/src/sharedComponents/HashInput'
import { DetectedHash } from '@/src/utils/hash'

const AlertIcon = () => (
  <svg fill="none" height="21" viewBox="0 0 22 21" width="22" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M11 0C8.9233 0 6.89323 0.615814 5.16652 1.76957C3.4398 2.92332 2.09399 4.5632 1.29927 6.48182C0.504549 8.40045 0.296615 10.5116 0.701759 12.5484C1.1069 14.5852 2.10693 16.4562 3.57538 17.9246C5.04383 19.3931 6.91475 20.3931 8.95155 20.7982C10.9884 21.2034 13.0996 20.9954 15.0182 20.2007C16.9368 19.406 18.5767 18.0602 19.7304 16.3335C20.8842 14.6068 21.5 12.5767 21.5 10.5C21.4971 7.71613 20.3899 5.04712 18.4214 3.07862C16.4529 1.11013 13.7839 0.00293982 11 0ZM11 19.3846C9.24279 19.3846 7.52504 18.8635 6.06398 17.8873C4.60291 16.911 3.46414 15.5234 2.79169 13.9C2.11923 12.2765 1.94329 10.4901 2.2861 8.7667C2.62892 7.04325 3.4751 5.46016 4.71763 4.21763C5.96017 2.97509 7.54325 2.12891 9.2667 1.7861C10.9901 1.44328 12.7765 1.61923 14.4 2.29169C16.0234 2.96414 17.411 4.1029 18.3873 5.56397C19.3635 7.02504 19.8846 8.74279 19.8846 10.5C19.8819 12.8555 18.945 15.1138 17.2794 16.7794C15.6138 18.445 13.3555 19.3819 11 19.3846ZM10.1923 11.3077V5.65384C10.1923 5.43963 10.2774 5.23419 10.4289 5.08272C10.5803 4.93125 10.7858 4.84615 11 4.84615C11.2142 4.84615 11.4197 4.93125 11.5711 5.08272C11.7226 5.23419 11.8077 5.43963 11.8077 5.65384V11.3077C11.8077 11.5219 11.7226 11.7273 11.5711 11.8788C11.4197 12.0303 11.2142 12.1154 11 12.1154C10.7858 12.1154 10.5803 12.0303 10.4289 11.8788C10.2774 11.7273 10.1923 11.5219 10.1923 11.3077ZM12.2115 14.9423C12.2115 15.1819 12.1405 15.4162 12.0074 15.6154C11.8742 15.8146 11.685 15.9699 11.4636 16.0616C11.2423 16.1533 10.9987 16.1773 10.7636 16.1306C10.5286 16.0838 10.3128 15.9684 10.1433 15.799C9.97388 15.6296 9.85849 15.4137 9.81174 15.1787C9.765 14.9436 9.78899 14.7 9.88069 14.4787C9.97239 14.2573 10.1277 14.0681 10.3269 13.9349C10.5261 13.8018 10.7604 13.7308 11 13.7308C11.3213 13.7308 11.6295 13.8584 11.8567 14.0856C12.0839 14.3128 12.2115 14.621 12.2115 14.9423Z"
      fill="currentColor"
    />
  </svg>
)

const IconOK = ({ ...restProps }) => (
  <svg
    fill="none"
    height="13"
    viewBox="0 0 19 13"
    width="19"
    xmlns="http://www.w3.org/2000/svg"
    {...restProps}
  >
    <path
      d="M17.5 1L6.5 12L1.5 7"
      stroke="#29BD7F"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
)

const Wrapper = styled.div`
  --base-horizontal-padding: var(--base-common-padding-xl);
  --base-textfield-padding: 0 var(--base-horizontal-padding);
  --base-textfield-border-radius: var(--base-border-radius);

  [data-theme='light'] & {
    --theme-textfield-color: #2e3048;
    --theme-textfield-color-active: #2e3048;
    --theme-textfield-color-error: #2e3048;
    --theme-textfield-color-ok: #2e3048;
    --theme-textfield-background-color: #f7f7f7;
    --theme-textfield-background-color-active: #f7f7f7;
    --theme-textfield-border-color: #c5c2cb;
    --theme-textfield-border-color-active: #c5c2cb;
    --theme-textfield-border-color-error: #2e3048;
    --theme-textfield-border-color-ok: #c5c2cb;
    --theme-textfield-placeholder-color: rgb(22 29 26 / 60%);

    --theme-hash-input-search-status-background-color: #2e3048;
  }

  [data-theme='dark'] & {
    --theme-textfield-color: #fff;
    --theme-textfield-color-active: #fff;
    --theme-textfield-color-error: #fff;
    --theme-textfield-color-ok: #fff;
    --theme-textfield-background-color: #2e3048;
    --theme-textfield-background-color-active: #2e3048;
    --theme-textfield-border-color: #5f6178;
    --theme-textfield-border-color-active: #5f6178;
    --theme-textfield-border-color-error: #4b4d60;
    --theme-textfield-border-color-ok: #5f6178;
    --theme-textfield-placeholder-color: rgb(247 247 247 / 60%);

    --theme-hash-input-search-status-background-color: #232436;
  }

  position: relative;
  width: 100%;
`

const Textfield = styled(BaseTextfield)`
  display: block;
  padding-right: calc(var(--base-common-padding) * 6);
  position: relative;
  width: 100%;
  z-index: 10;
`

const OK = styled(IconOK)`
  position: absolute;
  right: var(--base-common-padding-xl);
  top: 50%;
  transform: translateY(-50%);
  z-index: 15;
`

const SpinnerWrapper = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  position: absolute;
  right: 0;
  top: 0;
  width: calc(var(--base-common-padding) * 6);
  z-index: 15;
`

const StatusMessage = styled.div`
  align-items: center;
  background-color: var(--theme-hash-input-search-status-background-color);
  border: 1px solid var(--theme-textfield-border-color-error);
  border-radius: var(--base-textfield-border-radius);
  color: #fab754;
  column-gap: var(--base-gap);
  display: flex;
  font-size: 1.4rem;
  left: 0;
  min-height: 64px;
  padding: calc(var(--base-common-padding-xl) * 2) var(--base-horizontal-padding)
    var(--base-common-padding-xl) var(--base-horizontal-padding);
  position: absolute;
  top: calc(100% - var(--base-common-padding-xl));
  width: 100%;
  z-index: 5;
`

const HashInput = ({ ...restProps }) => {
  const [searchResult, setSearchResult] = useState<DetectedHash | null>(null)
  const [loading, setLoading] = useState<boolean | undefined>()
  const notFound = searchResult && searchResult.type === null
  const found = searchResult && searchResult.type !== null

  const onLoading = (isLoading: boolean) => {
    setLoading(isLoading)
  }

  return (
    <Wrapper {...restProps}>
      <BaseHashInput
        chain={mainnet}
        onLoading={onLoading}
        onSearch={setSearchResult}
        renderInput={({ ...props }) => (
          <Textfield
            $status={notFound ? 'error' : undefined}
            placeholder="Address / Txn Hash / ENS Name"
            {...props}
          />
        )}
      />
      {loading && (
        <SpinnerWrapper>
          <Spinner height="25" width="25" />
        </SpinnerWrapper>
      )}
      {found && !loading && <OK />}
      {notFound && (
        <StatusMessage>
          <AlertIcon /> <span>No results found</span>
        </StatusMessage>
      )}
    </Wrapper>
  )
}

export default HashInput
