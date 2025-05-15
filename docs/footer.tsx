export default function Footer() {
  const date = new Date()

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
      <div>Released under the MIT License.</div>
      <div style={{ display: 'flex', alignItems: 'center', columnGap: '8px' }}>
        © {date.getFullYear()} -{' '}
        <a
          href="https://www.bootnode.dev/"
          target="_blank"
          rel="noreferrer"
          title={'BootNode - Web3, blockchain development'}
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
