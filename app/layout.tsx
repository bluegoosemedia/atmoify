import "./globals.css"
import { Inter } from "next/font/google"
import { ToastProvider } from "@/components/ui/toast"
import { JotaiProvider } from "@/lib/jotaiProvider"
import { TimerProvider } from "@/components/timer/TimerProvider"
import { DraggableTimerDisplay } from "@/components/timer/DraggableTimerDisplay"
import { themes } from "@/lib/themes"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Atmoify - Create Your Perfect Atmosphere",
  description: "Create your perfect atmospheric music and soundscapes",
  icons: {
    icon: "/atmoify-logo.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground relative overflow-hidden h-full`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('atmoify-theme') || 'original';
                  var themes = ${JSON.stringify(themes)};
                  if (themes[theme]) {
                    var root = document.documentElement;
                    var colors = themes[theme].colors;
                    for (var key in colors) {
                      var cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                      root.style.setProperty('--' + cssVarName, colors[key]);
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <JotaiProvider>
          <TimerProvider>
            <div className="relative z-10 h-full overflow-auto flex flex-col">
              <main className="flex-grow">{children}</main>
            </div>
            <DraggableTimerDisplay />
          </TimerProvider>
        </JotaiProvider>
        <ToastProvider />
      </body>
    </html>
  )
}

