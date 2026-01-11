import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ClerkProvider } from "@clerk/clerk-react";


const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;

createRoot(document.getElementById("root")!).render(
  <ClerkProvider
    publishableKey={clerkPubKey}
    signInUrl="/sign-in"
    signUpUrl="/sign-up"
    afterSignInUrl="/"
    afterSignUpUrl="/"
    appearance={{
      variables: {
        colorPrimary: '#0F172A',
        colorBackground: '#ffffff',
        colorText: '#0F172A',
        colorInputBackground: '#F1F5F9',
        colorInputText: '#0F172A'
      },
      layout: {
        socialButtonsPlacement: 'bottom',
        socialButtonsVariant: 'iconButton'
      }
    }}
  >
    <App />
  </ClerkProvider>
);