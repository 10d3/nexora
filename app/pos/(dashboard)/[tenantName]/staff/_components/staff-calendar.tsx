/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
// import { useStaff } from "@/providers/staff-provider";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StaffCalendarSkeleton } from "./staff-skeleton";
import { useStaff } from "@/context/staff-provider";

export default function StaffCalendar() {
  const { staff, loading } = useStaff();
  const [date, setDate] = useState<Date | undefined>(new Date());

  // This is a placeholder for actual schedule data
  // In a real app, you would fetch this from your API
  const getRandomStaff = () => {
    if (!staff.length) return [];
    const count = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...staff].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Generate some fake schedule data for demo purposes
  const [scheduleData] = useState(() => {
    const data: Record<string, any[]> = {};
    const today = new Date();

    for (let i = -15; i < 15; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];

      // Only add data to some days
      if (Math.random() > 0.3) {
        data[dateStr] = getRandomStaff();
      }
    }

    return data;
  });

  const selectedDateStr = date?.toISOString().split("T")[0];
  const scheduledStaff = selectedDateStr
    ? scheduleData[selectedDateStr] || []
    : [];

  if (loading) {
    return <StaffCalendarSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-1">
        <CardContent className="p-3">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            modifiers={{
              booked: (date) => {
                const dateStr = date.toISOString().split("T")[0];
                return !!scheduleData[dateStr];
              },
            }}
            modifiersClassNames={{
              booked: "bg-primary/10 font-medium text-primary",
            }}
          />
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>
            {date ? (
              <>
                Schedule for{" "}
                {date.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </>
            ) : (
              <>Select a date</>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scheduledStaff.length > 0 ? (
            <div className="space-y-4">
              {scheduledStaff.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 p-3 rounded-lg border"
                >
                  <Avatar>
                    <AvatarImage src={member.image || ""} alt={member.name} />
                    <AvatarFallback>
                      {member.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{member.name}</div>
                    {member.specialization && (
                      <Badge variant="outline" className="mt-1">
                        {member.specialization}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {/* This would be actual shift times in a real app */}
                    {Math.floor(Math.random() * 12) + 8}:00 -{" "}
                    {Math.floor(Math.random() * 12) + 8}:00
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-2">
                No team members scheduled for this day
              </p>
              <p className="text-sm text-muted-foreground">
                Select a different date or schedule team members for this day.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
