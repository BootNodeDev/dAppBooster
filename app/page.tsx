"use client";

import React, { Suspense } from 'react';
import styles from "@/app/page.module.css";
import ERC20Balance from "@/app/_examples/ERC20BalanceExample";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <Suspense fallback={<div>Loading...</div>}>
          <ERC20Balance />
        </Suspense>
      </div>
    </main>
  );
}
