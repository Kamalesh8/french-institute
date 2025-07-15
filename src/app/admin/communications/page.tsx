"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

/**
 * Admin communications page – allows an admin to draft and send a simple announcement.
 * This is a minimal placeholder so the route is not a 404 anymore. Extend as needed.
 */
export default function AdminCommunicationsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({ variant: "destructive", title: "Both subject and message are required." });
      return;
    }
    try {
      setSending(true);
      const res = await fetch("/api/admin/send-announcement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Unknown error");
      }
      toast({ title: "Message queued", description: "Your announcement will be delivered shortly." });
      setSubject("");
      setMessage("");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Failed to send" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Send Announcement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={sending}
          />
          <Textarea
            placeholder="Write your message..."
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={sending}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleSend} disabled={sending} className="ml-auto">
            {sending ? "Sending..." : "Send"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
