import { render, screen } from '@testing-library/react'
import { Mock, describe, expect, it, vi } from 'vitest'
import { useEnsName, useEnsAvatar } from 'wagmi'

import Avatar from '@/src/sharedComponents/web3/Avatar'

// Mock wagmi hooks
vi.mock('wagmi', () => ({
  useEnsName: vi.fn(),
  useEnsAvatar: vi.fn(),
}))

const mockSize = 50
const mockAddress = '0x1234567890abcdef1234567890abcdef12345678'
const mockEnsName = 'test.eth'
const mockAvatarImg = 'avatar.png'

describe('Avatar Component', () => {
  it('renders CustomAvatar with ensName and avatarImg', () => {
    // Mock the hook return values
    ;(useEnsName as Mock).mockReturnValue({ data: mockEnsName })
    ;(useEnsAvatar as Mock).mockReturnValue({ data: mockAvatarImg })

    render(<Avatar address={mockAddress} size={mockSize} />)

    expect(screen.getByAltText(mockEnsName)).toBeInTheDocument()
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', mockAvatarImg)

    // Expect the image to have the correct size
    expect(img.parentElement).toHaveStyle({
      width: `${mockSize}px`,
      height: `${mockSize}px`,
    })
  })

  it('renders Jazzicon (without ensAvatar image)', () => {
    ;(useEnsName as Mock).mockReturnValue({ data: mockEnsName })
    ;(useEnsAvatar as Mock).mockReturnValue({ data: undefined })

    render(<Avatar address={mockAddress} size={mockSize} />)

    // Expect Jazzicon to be rendered
    expect(screen.getByTestId('avatar-icon')).toBeInTheDocument()

    // Expect the icon to have the correct size
    expect(screen.getByTestId('avatar-icon').parentElement).toHaveStyle({
      width: `${mockSize}px`,
      height: `${mockSize}px`,
    })
  })
})
