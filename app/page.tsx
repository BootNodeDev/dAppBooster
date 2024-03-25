'use client'

import Image from 'next/image'
import { Suspense, use, useEffect, useState } from 'react'

import { mainnet } from 'viem/chains'
import { useReadContract } from 'wagmi'

import styles from './page.module.css'
import ERC20 from '@/app/_constants/abis/ERC20'

const Balance = () => {
  const res = useReadContract({
    chainId: mainnet.id,
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    abi: ERC20,
    functionName: 'balanceOf',
    args: ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'],
  })

  return <div>{res.data.toString()}</div>
}

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <Suspense fallback="Loading...">
          <Balance />
        </Suspense>

        <p>
          Get started by editing&nbsp;
          <code className={styles.code}>app/page.tsx</code>
        </p>
        <div>
          <a
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            rel="noopener noreferrer"
            target="_blank"
          >
            By{' '}
            <Image
              alt="Vercel Logo"
              className={styles.vercelLogo}
              height={24}
              priority
              src="/vercel.svg"
              width={100}
            />
          </a>
        </div>
      </div>

      <div className={styles.center}>
        <Image
          alt="Next.js Logo"
          className={styles.logo}
          height={37}
          priority
          src="/next.svg"
          width={180}
        />
      </div>

      <div className={styles.grid}>
        <a
          className={styles.card}
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          rel="noopener noreferrer"
          target="_blank"
        >
          <h2>
            Docs <span>-&gt;</span>
          </h2>
          <p>Find in-depth information about Next.js features and API.</p>
        </a>

        <a
          className={styles.card}
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          rel="noopener noreferrer"
          target="_blank"
        >
          <h2>
            Learn <span>-&gt;</span>
          </h2>
          <p>Learn about Next.js in an interactive course with&nbsp;quizzes!</p>
        </a>

        <a
          className={styles.card}
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          rel="noopener noreferrer"
          target="_blank"
        >
          <h2>
            Templates <span>-&gt;</span>
          </h2>
          <p>Explore starter templates for Next.js.</p>
        </a>

        <a
          className={styles.card}
          href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          rel="noopener noreferrer"
          target="_blank"
        >
          <h2>
            Deploy <span>-&gt;</span>
          </h2>
          <p>Instantly deploy your Next.js site to a shareable URL with Vercel.</p>
        </a>
      </div>
    </main>
  )
}
