import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";

// ✅ Clerk imports
import {
  SignIn,
  SignUp,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  useUser,
} from "@clerk/clerk-react";

import Dashboard from "./components/Dashboard";
import AuthPage from "./components/AuthPage";

const queryClient = new QueryClient();

// ✅ Helper: Decide whether to go to AuthPage or Dashboard
const HomeRedirect = () => {
  const { user } = useUser();

  if (user?.unsafeMetadata?.detailsFilled) {
    return <Dashboard />;
  } else {
    return (
      <AuthPage
        onBack={() => window.history.back()}
        onComplete={() => { }}
      />
    );
  }
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Clerk auth routes */}
          <Route
            path="/sign-in"
            element={
              <div className="flex items-center justify-center min-h-screen w-full">
                <SignIn />
              </div>
            }
          />
          <Route
            path="/sign-up"
            element={
              <div className="flex items-center justify-center min-h-screen w-full">
                <SignUp />
              </div>
            }
          />

          {/* Root route → auto-redirect based on details */}
          <Route
            path="/"
            element={
              <>
                <SignedIn>
                  <HomeRedirect />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />

          {/* Dashboard route (direct access if details filled) */}
          <Route
            path="/dashboard"
            element={
              <>
                <SignedIn>
                  <Dashboard />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />

          {/* AuthPage for personal details */}
          <Route
            path="/auth"
            element={
              <>
                <SignedIn>
                  <AuthPage
                    onBack={() => window.history.back()}
                    onComplete={() => {
                      // Details saved inside AuthPage itself
                    }}
                  />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;