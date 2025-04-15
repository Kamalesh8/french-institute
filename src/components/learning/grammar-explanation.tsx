"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FaLightbulb, FaBookOpen, FaInfoCircle } from "react-icons/fa";

interface GrammarRule {
  title: string;
  explanation: string;
  examples?: string[];
}

interface GrammarExplanationProps {
  grammar: GrammarRule[];
}

export default function GrammarExplanation({ grammar }: GrammarExplanationProps) {
  const [expandedRules, setExpandedRules] = useState<Set<number>>(new Set([0])); // First rule is expanded by default

  const toggleRule = (index: number) => {
    const newExpandedRules = new Set(expandedRules);
    if (newExpandedRules.has(index)) {
      newExpandedRules.delete(index);
    } else {
      newExpandedRules.add(index);
    }
    setExpandedRules(newExpandedRules);
  };

  const expandAll = () => {
    const allIndices = new Set(grammar.map((_, index) => index));
    setExpandedRules(allIndices);
  };

  const collapseAll = () => {
    setExpandedRules(new Set());
  };

  if (!grammar || grammar.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6 text-center">
          <FaInfoCircle className="mx-auto h-12 w-12 text-primary/30 mb-4" />
          <p className="text-muted-foreground">No grammar explanation available for this lesson.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FaBookOpen className="text-primary" />
          Grammar Concepts
        </h2>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {grammar.map((rule, index) => (
          <Card
            key={index}
            className={`border-0 shadow-sm transition-all duration-200 ${
              expandedRules.has(index) ? 'shadow-md' : ''
            }`}
          >
            <CardHeader
              className="cursor-pointer py-4"
              onClick={() => toggleRule(index)}
            >
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <FaLightbulb className="text-amber-500" />
                  {rule.title}
                </CardTitle>
                <div className="text-xl">
                  {expandedRules.has(index) ? "−" : "+"}
                </div>
              </div>
            </CardHeader>
            {expandedRules.has(index) && (
              <CardContent className="pt-0 pb-6">
                <div className="prose max-w-none">
                  <p>{rule.explanation}</p>

                  {rule.examples && rule.examples.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">Examples:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {rule.examples.map((example, i) => (
                          <li key={i} className="text-sm">{example}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
        <div className="flex items-start gap-3">
          <FaInfoCircle className="text-amber-500 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-medium mb-1">Grammar Tip</h3>
            <p className="text-sm text-muted-foreground">
              Understanding grammar rules is important, but don't worry about memorizing everything right away.
              Focus on recognizing patterns and practice using them in context. The more you use French,
              the more natural these rules will become.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
