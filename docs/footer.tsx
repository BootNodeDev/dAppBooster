import React from 'react'

export default function Footer() {
  return (
    <div>
      <div>Released under the MIT License.</div>
      <div style={{ display: 'flex', alignItems: 'center', columnGap: '8px' }}>
        Copyright © 2024-present -{' '}
        <a
          href="https://www.bootnode.dev/"
          target="_blank"
          rel="noreferrer"
        >
          <img
            src="/img/footer/logo.svg"
            alt="BootNode"
          />
        </a>
      </div>
    </div>
  )
}
