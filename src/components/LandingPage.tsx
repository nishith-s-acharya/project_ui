import React from "react";
import {
  Stethoscope,
  ArrowRight,
  Heart,
  Brain,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import aidaLogo from "@/assets/aida-logo.png";
import medicalHeroBg from "@/assets/medical-hero-bg.jpg";

// Clerk imports
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";

interface LandingPageProps {
  onSignIn: () => void;
}

const LandingPage = ({ onSignIn }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="absolute top-0 left-0 w-full flex justify-between items-center p-6 z-20">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src={aidaLogo} alt="AIDA Logo" className="w-10 h-10 rounded-full bg-white p-1" />
          <h1 className="text-xl font-bold text-white">AIDA</h1>
        </div>

        {/* Auth Buttons (top right) */}
        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline" className="text-white border-white hover:bg-white/10">
                Login
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button className="bg-white text-primary hover:bg-white/90">
                Sign Up
              </Button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </header>

      {/* Hero Section */}
      <div
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${medicalHeroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-secondary/80"></div>

        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          {/* Animated Logo */}
          <div className="mb-8 animate-float">
            <img
              src={aidaLogo}
              alt="AIDA Logo"
              className="w-32 h-32 mx-auto mb-6 animate-pulse-glow rounded-full bg-white p-4"
            />
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-4 animate-slide-up">
              AIDA
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 mb-2 animate-fade-in-delay">
              Artificial Intelligence Disease Assistance
            </p>
          </div>

          {/* Description */}
          <div className="mb-12 animate-fade-in-delay">
            <p className="text-lg sm:text-xl text-white/80 mb-8 leading-relaxed">
              Your intelligent healthcare companion providing AI-powered medical
              assistance, personalized health recommendations, and seamless access
              to medical professionals.
            </p>

            <Button
              onClick={onSignIn}
              variant="hero"
              size="lg"
              className="text-lg px-8 py-4 animate-pulse-glow"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
            <FeatureCard
              icon={Brain}
              title="AI Chatbot"
              description="Instant medical guidance powered by advanced AI"
            />
            <FeatureCard
              icon={Heart}
              title="Health Tracking"
              description="Personalized health monitoring and recommendations"
            />

            <FeatureCard
              icon={Shield}
              title="Hospital Locator"
              description="Find nearby hospitals and emergency services"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105 shadow-card">
      <Icon className="h-12 w-12 text-white mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/80 text-sm">{description}</p>
    </div>
  );
};

export default LandingPage;