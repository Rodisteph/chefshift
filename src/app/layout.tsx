export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata = {
  title: 'ChefShift NL - ZZP-koks & Horeca',
  description: 'Platform voor ZZP-koks en horeca in Nederland',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  )
}
