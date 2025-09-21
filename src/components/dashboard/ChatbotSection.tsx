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
    <Card className="h-[600px] flex flex-col shadow-card">
      <CardHeader className="bg-gradient-medical text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          AI Medical Assistant
        </CardTitle>
        <CardDescription className="text-white/80">
          Embedded chatbot from local server
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 p-0 h-screen">
        <iframe
          src="http://127.0.0.1:7860/"
          className="w-full h-full border-0 rounded-b-lg"
          title="AI Chatbot"
        />
      </CardContent>
    </Card>
  );
};

export default ChatbotSection;