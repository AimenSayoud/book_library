import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Book Recommender',
  description: 'Get book recommendations based on your description',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex h-screen bg-background text-foreground">
            <Sidebar />
            <main className="flex-1 overflow-hidden">
              {children}
            </main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

