import { ThemeProvider } from "@/components/theme-provider";
import ThemeDataProvider from "@/context/theme-data-provider";
import { SessionProvider } from "next-auth/react";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // const queryClient = new QueryClient();
  return (
    <SessionProvider>
      {/* <QueryClientProvider client={queryClient}> */}
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ThemeDataProvider>
          {children}
        </ThemeDataProvider>
      </ThemeProvider>
      {/* </QueryClientProvider> */}
    </SessionProvider>
  );
}
