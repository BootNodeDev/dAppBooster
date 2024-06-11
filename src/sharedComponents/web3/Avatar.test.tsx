import { render, screen } from '@testing-library/react'
import { Mock, describe, expect, it, vi } from 'vitest'
import { useEnsName, useEnsAvatar } from 'wagmi'

import Avatar from '@/src/sharedComponents/web3/Avatar'

// Mock wagmi hooks
vi.mock('wagmi', () => ({
  useEnsName: vi.fn(),
  useEnsAvatar: vi.fn(),
}))

describe('Avatar Component', () => {
  it('renders CustomAvatar with ensName and avatarImg', () => {
    // Mock the hook return values
    ;(useEnsName as Mock).mockReturnValue({ data: 'test.eth' })
    ;(useEnsAvatar as Mock).mockReturnValue({ data: 'avatar.png' })

    render(<Avatar address="0x1234567890abcdef1234567890abcdef12345678" />)

    expect(screen.getByAltText('test.eth')).toBeInTheDocument()
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'avatar.png')
  })

  it('renders Jazzicon (without ensAvatar image)', () => {
    ;(useEnsName as Mock).mockReturnValue({ data: 'test.eth' })
    ;(useEnsAvatar as Mock).mockReturnValue({ data: undefined })

    render(<Avatar address="0x1234567890abcdef1234567890abcdef12345678" />)

    expect(screen.getByTestId('avatar-icon')).toBeInTheDocument()
  })
})
