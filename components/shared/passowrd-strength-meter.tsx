"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PasswordStrengthMeterProps {
  password: string;
  onStrengthChange?: (strength: number) => void;
}

export default function PasswordStrengthMeter({
  password,
  onStrengthChange,
}: PasswordStrengthMeterProps) {
  const [strength, setStrength] = useState(0);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const calculateStrength = (pwd: string): number => {
      if (!pwd) return 0;

      let score = 0;

      // Length check
      if (pwd.length >= 8) score += 1;
      if (pwd.length >= 12) score += 1;

      // Character variety checks
      if (/[A-Z]/.test(pwd)) score += 1;
      if (/[a-z]/.test(pwd)) score += 1;
      if (/[0-9]/.test(pwd)) score += 1;
      if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

      // Normalize to 0-4 scale
      return Math.min(4, Math.floor(score / 1.5));
    };

    const newStrength = calculateStrength(password);
    setStrength(newStrength);

    if (onStrengthChange) {
      onStrengthChange(newStrength);
    }

    // Set feedback based on strength
    if (!password) {
      setFeedback("");
    } else if (newStrength === 0) {
      setFeedback("Very weak");
    } else if (newStrength === 1) {
      setFeedback("Weak");
    } else if (newStrength === 2) {
      setFeedback("Fair");
    } else if (newStrength === 3) {
      setFeedback("Good");
    } else {
      setFeedback("Strong");
    }
  }, [password, onStrengthChange]);

  const getColorClass = (level: number) => {
    if (strength === 0) return "bg-muted";
    if (level <= strength) {
      if (strength === 1) return "bg-destructive";
      if (strength === 2) return "bg-orange-500";
      if (strength === 3) return "bg-yellow-500";
      return "bg-green-500";
    }
    return "bg-muted";
  };

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              getColorClass(level)
            )}
          />
        ))}
      </div>
      <p
        className={cn(
          "text-xs",
          strength === 0 || strength === 1
            ? "text-destructive"
            : strength === 2
              ? "text-orange-500"
              : strength === 3
                ? "text-yellow-500"
                : "text-green-500"
        )}
      >
        {feedback}
      </p>
    </div>
  );
}
