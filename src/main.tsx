import React from 'react'

import { RouterProvider, createRouter } from '@tanstack/react-router'
import ReactDOM from 'react-dom/client'

import { routeTree } from '@/src/routeTree.gen'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')!

const setAppInfo = () => {
  const getSiteURL = () => {
    const { hostname, port, protocol } =
      typeof window !== 'undefined'
        ? window.location
        : { hostname: 'localhost', port: 5173, protocol: 'http:' }
    const portString = port ? `:${port}` : ''
    return typeof window !== 'undefined' ? `${protocol}//${hostname}${portString}` : ''
  }

  const addMetaTag = (props: { name?: string; property?: string; content: string }) => {
    const { content, name, property } = props

    /**
     * You need to provide at least name or property
     */
    if (!name && !property) return

    const meta = document.createElement('meta')

    meta.setAttribute('content', content)

    if (property) {
      meta.setAttribute('property', property)
    }

    if (name) {
      meta.setAttribute('name', name)
    }

    document.head.appendChild(meta)
  }

  /**
   * Get some meta tags from env
   */
  const siteURL = getSiteURL()
  const title = import.meta.env.PUBLIC_APP_NAME
  const description = import.meta.env.PUBLIC_APP_DESCRIPTION || title
  const twitterHandle = import.meta.env.PUBLIC_APP_TWITTER_HANDLE || ''
  const keywords = import.meta.env.PUBLIC_APP_KEYWORDS || ''
  const shareImage = import.meta.env.PUBLIC_APP_SHARE_IMAGE || '/shareable/ogImage.jpg'

  /**
   * Mandatory / pre-defined meta tags
   */
  const meta = [
    // Open Graph meta tags
    { property: 'og:image', content: `${siteURL}${shareImage}` },
    { property: 'og:title', content: title },
    { property: 'og:url', content: siteURL },
    { property: 'og:type', content: 'website' },
    { property: 'og:description', content: description },
    // Twitter meta tags
    { name: 'twitter:image', content: `${siteURL}${shareImage}` },
    { name: 'twitter:creator', content: twitterHandle },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:site', content: title },
    // Standard meta tags
    { name: 'description', content: description },
    { name: 'keywords', content: keywords },
  ]

  /**
   * Update meta tags and title
   */
  meta.map((item) => addMetaTag({ ...item }))
  document.title = title
}

document.addEventListener('DOMContentLoaded', setAppInfo)

if (!rootElement.innerHTML) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  )
}
