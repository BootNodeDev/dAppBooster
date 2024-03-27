import type { Metadata } from 'next'

import AppDefaultInits from '@/app/_components/AppDefaultInits'

// CSS reset.
import 'modern-normalize/modern-normalize.css'
// Just a general CSS beautifier. You can remove this if you want.
import '@/app/sakura.css'

export const metadata: Metadata = {
  title: 'dAppBooster',
  description: 'dAppBooster base template',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AppDefaultInits>{children}</AppDefaultInits>
      </body>
    </html>
  )
}
