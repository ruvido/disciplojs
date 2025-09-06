import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Disciplo - Transform Your Life",
  description: "Join a community of disciples committed to transformation through accountability, battleplans, and shared growth.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}