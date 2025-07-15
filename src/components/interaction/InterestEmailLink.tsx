"use client";

import { useState } from "react";

/**
 * Renders an email link that automatically triggers an API call to send an
 * interest-message email to the school. Once the message is successfully sent,
 * the label changes to "Sent!".
 */
export default function InterestEmailLink({
  className,
}: {
  className?: string;
}) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleClick = async (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (sending || sent) return;
    setSending(true);
    try {
      const res = await fetch("/api/interest", { method: "POST" });
      if (res.ok) {
        setSent(true);
        // Simple feedback. In production, replace with a toast.
        alert("Merci! Your request has been sent. We'll contact you soon.");
      } else {
        alert("Oops! Something went wrong. Please try again later.");
      }
    } catch (err) {
      alert("Network error. Please try again later.");
    } finally {
      setSending(false);
    }
  };

  return (
    <a href="#" onClick={handleClick} className={className}>
      {sent ? "Sent!" : sending ? "Sending…" : "ecolebibliotheque@gmail.com"}
    </a>
  );
}
