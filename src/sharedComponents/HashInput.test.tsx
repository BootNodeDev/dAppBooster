import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { mainnet } from 'viem/chains'
import { describe, it, expect, vi, Mock } from 'vitest'

import HashInput from '@/src/sharedComponents/HashInput'
import detectHash from '@/src/utils/hash'

vi.mock('@/src/utils/hash')

const placeholder = 'Enter address, ENS name, or transaction hash'

describe('HashInput Component', () => {
  it('renders input field with placeholder', () => {
    render(<HashInput chain={mainnet} onSearch={() => {}} />)
    const input = screen.getByPlaceholderText(placeholder)
    expect(input).toBeInTheDocument()
  })

  it('calls onSearch with detected hash when input value is not empty', async () => {
    const onSearchMock = vi.fn()
    render(<HashInput chain={mainnet} onSearch={onSearchMock} />)
    const input = screen.getByPlaceholderText(placeholder) as HTMLInputElement

    // Mock the implementation of detectHash
    ;(detectHash as Mock).mockReturnValue({ data: 'test.eth', type: 'EOA' })

    fireEvent.change(input, { target: { value: '0x1234567890abcdef1234567890abcdef12345678' } })
    expect(input.value).toBe('0x1234567890abcdef1234567890abcdef12345678')
    await waitFor(() =>
      expect(onSearchMock).toHaveBeenCalledWith({ type: 'EOA', data: 'test.eth' }),
    )
  })

  it('calls onSearch when input value is invalid', async () => {
    const onSearchMock = vi.fn()
    render(<HashInput chain={mainnet} onSearch={onSearchMock} />)
    const input = screen.getByPlaceholderText(placeholder) as HTMLInputElement

    // Mock the implementation of detectHash
    ;(detectHash as Mock).mockReturnValue({ data: null, type: null })

    fireEvent.change(input, { target: { value: 'invalid-value' } })
    expect(input.value).toBe('invalid-value')
    await waitFor(() => expect(onSearchMock).toHaveBeenCalledWith({ type: null, data: null }))
  })

  it('calls onSearch when value prop changes', async () => {
    const onSearchMock = vi.fn()
    const { rerender } = render(<HashInput chain={mainnet} onSearch={onSearchMock} />)

    // Mock the implementation of detectHash
    ;(detectHash as Mock).mockResolvedValue({ data: 'test.eth', type: 'EOA' })

    const input = screen.getByPlaceholderText(placeholder) as HTMLInputElement

    act(() => {
      rerender(
        <HashInput
          chain={mainnet}
          onSearch={onSearchMock}
          value="0x1234567890abcdef1234567890abcdef12345678"
        />,
      )
    })

    await waitFor(() => {
      expect(onSearchMock).toHaveBeenCalledWith({ type: 'EOA', data: 'test.eth' })
      expect(input.value).toBe('0x1234567890abcdef1234567890abcdef12345678')
    })
  })
})