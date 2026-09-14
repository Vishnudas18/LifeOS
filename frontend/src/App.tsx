import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppRoutes from "@/routes/AppRoutes";
import { ThemeProvider } from "@/context/ThemeContext";

function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="lifeos-ui-theme">
        <AppRoutes />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;