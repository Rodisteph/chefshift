import './globals.css'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#46553c',
}

export const metadata = {
  metadataBase: new URL(process.env.APP_URL || 'http://localhost:3000'),
  title: {
    default: 'ChefShift NL — ZZP-koks & Horeca',
    template: '%s · ChefShift',
  },
  description: 'Platform voor ZZP-koks en horeca in Nederland',
  applicationName: 'ChefShift',
  openGraph: {
    title: 'ChefShift NL — ZZP-koks & Horeca',
    description: 'Platform voor ZZP-koks en horeca in Nederland',
    type: 'website',
    locale: 'nl_NL',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('chefshift-theme');if(!t){t=(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();",
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
