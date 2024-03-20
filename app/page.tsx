"use client";

import React from 'react';
import styles from "@/app/page.module.css";
import ERC20Balance from "@/app/_examples/ERC20BalanceExample";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <ERC20Balance  />
      </div>
    </main>
  );
}
