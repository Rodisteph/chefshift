import './globals.css'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#46553c',
}

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://chefshift.vercel.app'),
  title: {
    default: 'ZZP-koks en horeca personeel vinden | ChefShift NL',
    template: '%s · ChefShift',
  },
  description:
    'Vind geverifieerde zzp-koks voor jouw shift, of vind als kok zelf shifts bij restaurants en hotels in heel Nederland. Gratis aanmelden in 1 minuut.',
  applicationName: 'ChefShift',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ZZP-koks en horeca personeel vinden | ChefShift NL',
    description:
      'Vind geverifieerde zzp-koks voor jouw shift, of vind als kok zelf shifts bij restaurants en hotels in heel Nederland. Gratis aanmelden in 1 minuut.',
    type: 'website',
    locale: 'nl_NL',
    url: '/',
    siteName: 'ChefShift',
    images: [
      {
        url: '/og-image.jpg',
        width: 2048,
        height: 1062,
        alt: 'ZZP-kok aan het werk in een professionele horecakeuken',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZZP-koks en horeca personeel vinden | ChefShift NL',
    description:
      'Vind geverifieerde zzp-koks voor jouw shift, of vind als kok zelf shifts bij restaurants en hotels in heel Nederland.',
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
