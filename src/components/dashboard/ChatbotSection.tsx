import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

const ChatbotSection = () => {
  return (
    <Card className="flex flex-col shadow-card w-full h-[600px]">
  <CardHeader className="bg-gradient-medical text-white rounded-t-lg">
    <CardTitle className="flex items-center gap-2">
      <MessageCircle className="h-5 w-5" />
      AI Medical Assistant
    </CardTitle>
    <CardDescription className="text-white/80">
      Embedded chatbot from local server
    </CardDescription>
  </CardHeader>

  <CardContent className="flex-1 p-0">
     <iframe
      src="http://127.0.0.1:7860/"
      className="absolute top-16 left-0 w-screen h-[calc(100vh-4rem)] border-0"
      title="AI Chatbot"
      allow="microphone; camera; autoplay; encrypted-media"
      allowFullScreen
    />
  </CardContent>
</Card>
  );
};

export default ChatbotSection;