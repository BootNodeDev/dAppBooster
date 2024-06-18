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
const title = import.meta.env.PUBLIC_APP_NAME
const description = import.meta.env.PUBLIC_APP_DESCRIPTION
const twitterHandle = import.meta.env.PUBLIC_APP_TWITTER_HANDLE
const siteURL = getSiteURL()
const keywords = import.meta.env.PUBLIC_APP_KEYWORDS
const shareImage = import.meta.env.PUBLIC_APP_SHARE_IMAGE

/**
 * Mandatory / pre-defined meta tags
 */
const meta = [
  // Open Graph meta tags
  { property: 'og:title', content: title },
  { property: 'og:url', content: siteURL },
  { property: 'og:type', content: 'website' },
  // Twitter meta tags
  { name: 'twitter:card', content: 'summary_large_image' },
  { name: 'twitter:site', content: title },
]

/**
 * Optional meta tags
 */
if (description) {
  meta.push(
    { name: 'description', content: description },
    { property: 'og:description', content: description },
  )
}

if (keywords) {
  meta.push({ name: 'keywords', content: keywords })
}

if (shareImage) {
  meta.push(
    { property: 'og:image', content: `${siteURL}${shareImage}` },
    { name: 'twitter:image', content: `${siteURL}${shareImage}` },
  )
}

if (twitterHandle) {
  meta.push({ name: 'twitter:creator', content: twitterHandle })
}

/**
 * Update meta tags and title
 */
document.title = title
meta.map((item) => addMetaTag({ ...item }))

if (!rootElement.innerHTML) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  )
}
