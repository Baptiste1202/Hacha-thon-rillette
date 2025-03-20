import "@/app/output3.css"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { VotingSystemProvider } from "@/lib/voting-context"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <VotingSystemProvider>{children}</VotingSystemProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

