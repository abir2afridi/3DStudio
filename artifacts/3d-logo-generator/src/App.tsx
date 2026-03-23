import React, { Suspense, lazy } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Developer from "@/pages/Developer";
import ScrollToTop from "@/components/layout/ScrollToTop";

// Lazy load editor to keep landing page fast
const Editor = lazy(() => import("@/pages/Editor"));

const queryClient = new QueryClient();

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
      <Route path="/" component={Home} />
      <Route path="/developer" component={Developer} />
      <Route path="/editor">
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-background"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>}>
          <Editor />
        </Suspense>
      </Route>
      <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
      <Toaster 
        position="bottom-center"
        toastOptions={{
          className: 'premium-toast',
          style: {
            background: 'var(--card)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 500,
            backdropFilter: 'blur(10px)',
          },
          success: {
            iconTheme: {
              primary: 'var(--primary)',
              secondary: 'var(--primary-foreground)',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
