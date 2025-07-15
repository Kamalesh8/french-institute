"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import {
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  subscribeToMessages,
} from "@/lib/services/chat-service";
import type { Message } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { FaPaperPlane, FaPaperclip } from "react-icons/fa";

interface ChatInterfaceProps {
  recipientId: string;
  courseId?: string;
}

export default function ChatInterface({ recipientId, courseId }: ChatInterfaceProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;

    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const conversationMessages = await getConversationMessages(user.uid, recipientId);
        setMessages(conversationMessages);
        await markMessagesAsRead(getConversationId([user.uid, recipientId]), user.uid);
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();

    // Subscribe to new messages
    const unsubscribe = subscribeToMessages(user.uid, (newMessages) => {
      setMessages((prev) => [...prev, ...newMessages]);
      markMessagesAsRead(getConversationId([user.uid, recipientId]), user.uid);
    });

    return () => unsubscribe();
  }, [user, recipientId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!user || !newMessage.trim()) return;

    try {
      await sendMessage(user.uid, recipientId, newMessage, courseId);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      // Upload file logic here
      const attachmentURL = ""; // Replace with actual file upload
      await sendMessage(user.uid, recipientId, "Sent an attachment", courseId, [attachmentURL]);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const isOwn = message.senderId === user?.uid;

    return (
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}>
        <div
          className={`max-w-[70%] rounded-lg p-3 ${
            isOwn
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          <div className="text-sm">{message.content}</div>
          {message.attachmentURLs?.map((url, index) => (
            <div key={index} className="mt-2">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs underline"
              >
                View Attachment
              </a>
            </div>
          ))}
          <div className="text-xs mt-1 opacity-70">
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      <ScrollArea className="flex-1 p-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </ScrollArea>
      <Separator />
      <div className="p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
          >
            <FaPaperclip className="h-4 w-4" />
          </Button>
          <Button size="icon" onClick={handleSendMessage}>
            <FaPaperPlane className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

