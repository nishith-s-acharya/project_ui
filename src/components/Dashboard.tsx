import { useState, useEffect } from "react";
import {
  MessageCircle,
  Pill,
  Calendar,
  MapPin,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatbotSection from "./dashboard/ChatbotSection";
import TabletRecommendationSection from "./dashboard/TabletRecommendationSection";
import DoctorBookingSection from "./dashboard/DoctorBookingSection";
import HospitalLocationSection from "./dashboard/HospitalLocationSection";

// Clerk imports
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

type Section = "chatbot" | "tablets" | "doctors" | "hospitals" | "home";

const Dashboard = () => {
  const { user } = useUser();
  const [activeSection, setActiveSection] = useState<Section>("home");
  const navigate = useNavigate();

  // 🔑 Redirect to /auth if details not filled
  useEffect(() => {
    if (user && !user.unsafeMetadata?.detailsFilled) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const sections = [
    {
      id: "chatbot" as Section,
      title: "AI Chatbot",
      icon: MessageCircle,
      description: "Instant medical guidance powered by advanced AI",
      color: "text-blue-500",
    },
    {
      id: "tablets" as Section,
      title: "Health Tracking",
      icon: Pill,
      description: "Personalized health monitoring and recommendations",
      color: "text-green-500",
    },

    {
      id: "hospitals" as Section,
      title: "Hospital Locator",
      icon: MapPin,
      description: "Find nearby hospitals and emergency services",
      color: "text-red-500",
    },
  ];

  const renderBackButton = () => (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-2 px-4 py-2 rounded-full shadow-sm hover:bg-gray-100 transition mb-4"
      onClick={() => setActiveSection("home")}
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Home
    </Button>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case "chatbot":
        return (
          <div className="flex flex-col h-full relative z-10 p-6">
            {renderBackButton()}
            <ChatbotSection userData={userData} />
          </div>
        );
      case "tablets":
        return (
          <div className="flex flex-col h-full relative z-10 p-6">
            {renderBackButton()}
            <TabletRecommendationSection userData={userData} />
          </div>
        );
      case "doctors":
        return (
          <div className="flex flex-col h-full relative z-10 p-6">
            {renderBackButton()}
            <DoctorBookingSection userData={userData} />
          </div>
        );
      case "hospitals":
        return (
          <div className="flex flex-col h-full relative z-10 p-6">
            {renderBackButton()}
            <HospitalLocationSection userData={userData} />
          </div>
        );
      case "home":
      default:
        return (
          <div
            className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center relative"
            style={{
              backgroundImage: `url('https://imgs.search.brave.com/52LI1m-902n3itp8pwzrzasBEu-3_3s72GcX9Ta5MBU/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTMy/NzU2ODg3NS9waG90/by9oZWFsdGhjYXJl/LWJ1c2luZXNzLWdy/YXBoLWRhdGEtYW5k/LWdyb3d0aC1pbnN1/cmFuY2UtaGVhbHRo/Y2FyZS1kb2N0b3It/YW5hbHl6aW5nLW1l/ZGljYWwtb2YuanBn/P2I9MSZzPTYxMng2/MTImdz0wJms9MjAm/Yz1Lb0xWbncxMWs3/eGFrOVJIdVBiVXpq/cG1BY1JaaWd5N2pH/d1g5dGxKU1kwPQ')`,
            }}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 z-0"></div>

            <div className="text-center mb-8 relative z-10 mt-20">
              <h1 className="text-4xl font-bold text-white mb-4">AIDA</h1>
              <p className="text-lg text-white/80">
                Artificial Intelligence Disease Assistance
              </p>
              <p className="text-md text-white/70">
                Your intelligent healthcare companion providing AI-powered
                medical assistance, personalized health recommendations, and
                seamless access to medical professionals.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl px-6 relative z-10">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <div
                    key={section.id}
                    className="p-6 bg-white/80 backdrop-blur-md shadow-md rounded-lg flex flex-col items-center text-center cursor-pointer"
                    onClick={() => setActiveSection(section.id)} // ✅ Click card to navigate
                  >
                    <Icon className={`h-10 w-10 ${section.color} mb-4`} />
                    <h2 className="text-lg font-bold">{section.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );
    }
  };

  // Placeholder data until Clerk profile is extended
  // ✅ Pull from Clerk metadata (set in AuthPage.tsx)
  const userData = {
    name: (user?.unsafeMetadata?.name as string) || user?.fullName || "Guest",
    age: (user?.unsafeMetadata?.age as string) || "N/A",
    gender: (user?.unsafeMetadata?.gender as string) || "N/A",
    email:
      (user?.unsafeMetadata?.email as string) ||
      user?.primaryEmailAddress?.emailAddress ||
      "Not provided",
    phone:
      (user?.unsafeMetadata?.phone as string) ||
      user?.primaryPhoneNumber?.phoneNumber ||
      "Not provided",
    isPregnant: (user?.unsafeMetadata?.isPregnant as boolean) || false,
    medicalConditions: (user?.unsafeMetadata?.medicalConditions as string[]) || [],
    emergencyContact: (user?.unsafeMetadata?.emergencyContact as string) || "",
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Navbar */}
      <div className="w-full bg-white/80 shadow-md fixed top-0 left-0 z-20 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="text-xl font-bold">AIDA</div>
          </div>

          {/* Horizontal Sections */}
          <div className="flex items-center gap-6 ml-auto">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "medical" : "ghost"}
                  className="flex items-center gap-2 text-sm"
                  onClick={() => setActiveSection(section.id)}
                >
                  <Icon
                    className={`h-5 w-5 ${activeSection === section.id ? "text-white" : section.color
                      }`}
                  />
                  <span>{section.title}</span>
                </Button>
              );
            })}
          </div>

          {/* Authentication Buttons */}
          <div className="flex items-center gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline" className="text-sm">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="text-sm">Sign Up</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </div>

      {/* Render Active Section */}
      <div className="flex-1 mt-16">{renderActiveSection()}</div>
    </div>
  );
};

export default Dashboard;