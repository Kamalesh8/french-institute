"use client";
import React, { useState } from 'react';
import { faqs as sharedFaqs } from '@/constants/faqs';
import { FaChevronDown } from 'react-icons/fa';
import MainLayout from '@/components/layout/main-layout';

export default function FAQsPage() {
  const [active, setActive] = useState<number | null>(null);

  const toggle = (i: number) => setActive(active === i ? null : i);
  return (
    <MainLayout>
    <main className="container mx-auto py-16">
      <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
      
          <div className="mt-8 space-y-4">
        {sharedFaqs.map((faq, idx) => (
          <div key={idx} className="border rounded-lg">
            <button
              className="w-full flex items-center justify-between px-4 py-3 text-left"
              onClick={() => toggle(idx)}
            >
              <span className="font-medium">{faq.question}</span>
              <FaChevronDown className={`h-4 w-4 transition-transform ${active === idx ? 'rotate-180' : ''}`} />
            </button>
            {active === idx && (
              <div className="px-4 pb-4 text-muted-foreground whitespace-pre-line">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
    </MainLayout>
  );
}
