import React, { useEffect, useState } from 'react'
import { useCssHandles } from 'vtex.css-handles'

const CSS_HANDLES = ['webViewButton']

const WebViewButton = () => {
  const handles = useCssHandles(CSS_HANDLES)
  const [isWebView, setIsWebView] = useState<boolean | null>(null)

  useEffect(() => {
    const detectWebView = () => {
      const ua = navigator.userAgent || navigator.vendor || ''
      const isIOS = /iPhone|iPod|iPad/i.test(ua)
      const isAndroid = /Android/i.test(ua)
      const androidWebView = isAndroid && /; wv\)|Version\/[\d.]+/i.test(ua)
      const iosWebView = isIOS && !/Safari/i.test(ua)
      const inAppBrowser =
        /FBAN|FBAV|Instagram|Twitter|Line|Snapchat|WeChat|Messenger/i.test(ua)
      return androidWebView || iosWebView || inAppBrowser
    }

    const injectCss = () => {
      const css = `
        [class*="headerMobile"],
        [class*="footerMobile"],
        [class*="headerDesktop"],
        [class*="footerLayout"] {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
          height: 0 !important;
          overflow: hidden !important;
        }
      `
      const style = document.createElement('style')
      style.innerHTML = css
      document.head.appendChild(style)
    }

    const cleanupWebViewElements = () => {
      const logoLink = document.querySelector<HTMLAnchorElement>(
        '.vtex-store-components-3-x-logoLink--mobileLogo'
      )
      const logoContainer = document.querySelector<HTMLElement>(
        '.vtex-flex-layout-0-x-flexCol--logoMobile'
      )

      if (logoLink) {
        logoLink.removeAttribute('href')
      }

      if (logoContainer) {
        logoContainer.style.pointerEvents = 'none'
      }

      const elementsToRemove = document.querySelectorAll<HTMLElement>(
        '[class*="headerMobile"], [class*="footerMobile"], [class*="headerDesktop"], [class*="footerLayout"]'
      )

      elementsToRemove.forEach(element => {
        try {
          element.remove()
        } catch {
          element.style.setProperty('display', 'none', 'important')
          element.style.setProperty('visibility', 'hidden', 'important')
          element.style.setProperty('pointer-events', 'none', 'important')
          element.style.setProperty('height', '0', 'important')
          element.style.setProperty('overflow', 'hidden', 'important')
        }
      })
    }

    const webView = detectWebView()
    setIsWebView(webView)

    if (webView) {
      injectCss()

      cleanupWebViewElements()

      const observer = new MutationObserver(() => {
        cleanupWebViewElements()
      })
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      })

      window.addEventListener('load', cleanupWebViewElements)
      document.addEventListener('DOMContentLoaded', cleanupWebViewElements)
      window.addEventListener('popstate', cleanupWebViewElements)

      const interval = setInterval(cleanupWebViewElements, 2000)

      return () => {
        observer.disconnect()
        window.removeEventListener('load', cleanupWebViewElements)
        document.removeEventListener('DOMContentLoaded', cleanupWebViewElements)
        window.removeEventListener('popstate', cleanupWebViewElements)
        clearInterval(interval)
      }
    }

    return undefined
  }, [])

  const handleClick = () => {
    try {
      window.location.href = `${window.location.origin}/mobile_app_redirection`
    } catch (e) {
      console.error('Redirect failed', e)
    }
  }

  return (
    <div>
      {isWebView === true && (
        <div className="mt6">
          <button
            onClick={handleClick}
            className={`${handles.webViewButton} bg-blue white pa3 br2 mt4`}
          >
            CONTINUA CUMPARATURILE
          </button>
        </div>
      )}
    </div>
  )
}

export default WebViewButton
