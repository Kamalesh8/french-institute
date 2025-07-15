"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import ChatInterface from "@/components/chat/chat-interface";
import { getUserById } from "@/lib/services/user-service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ChatPage() {
  const { user } = useAuth();
  const params = useParams();
  const [recipient, setRecipient] = useState<any>(null);

  useEffect(() => {
    const loadRecipient = async () => {
      if (params.userId) {
        const userData = await getUserById(params.userId as string);
        setRecipient(userData);
      }
    };
    loadRecipient();
  }, [params.userId]);

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please sign in to use the messaging feature.</p>
        </CardContent>
      </Card>
    );
  }

  if (!recipient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={recipient.photoURL} />
              <AvatarFallback>
                {recipient.displayName?.charAt(0) || recipient.email?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{recipient.displayName || recipient.email}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {recipient.role === "instructor" ? "Instructor" : "Student"}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <ChatInterface recipientId={params.userId as string} />
    </div>
  );
}

