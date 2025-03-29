import { TanstackProvider } from "@/components/tanstack-provider";
import { ThemeProvider } from "@/components/theme-provider";
import ThemeDataProvider from "@/context/theme-data-provider";
import { SessionProvider } from "next-auth/react";

export default function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ThemeDataProvider>
          <TanstackProvider>{children}</TanstackProvider>
        </ThemeDataProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
