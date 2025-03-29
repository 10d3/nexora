/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useReservation } from "@/context/reservation-provider";
import { useDashboard } from "@/context/dashboard-provider";
import { useState, useRef, useEffect } from "react";
import { ReservationDialog } from "../reservation-dialog";
import {
  format,
  addDays,
  startOfDay,
  endOfDay,
  isSameDay,
  isToday,
} from "date-fns";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  User,
  Users,
  CalendarRange,
  ArrowLeftRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function ReservationTimeline() {
  const { reservations, resources, refreshData, setSelectedReservation } =
    useReservation();
  const { tenantId, businessType } = useDashboard();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [timeScale, setTimeScale] = useState<"day" | "week">("day");
  const [currentHour, setCurrentHour] = useState<number>(new Date().getHours());
  const timelineRef = useRef<HTMLDivElement>(null);

  // Scroll to current time on initial load
  useEffect(() => {
    if (timelineRef.current) {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const totalMinutes = hours * 60 + minutes - 6 * 60; // Start at 6:00 AM

      if (totalMinutes > 0) {
        const scrollWidth = timelineRef.current.scrollWidth;
        const clientWidth = timelineRef.current.clientWidth;
        const position = (totalMinutes / (18 * 60)) * scrollWidth;

        // Center the current time in the viewport if possible
        timelineRef.current.scrollLeft = Math.max(
          0,
          position - clientWidth / 2
        );
      }
    }
  }, []);

  // Update current hour every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Filter reservations for the current view
  const filteredReservations = reservations.filter((reservation) => {
    const reservationDate = new Date(reservation.startTime);
    if (timeScale === "day") {
      return isSameDay(reservationDate, currentDate);
    } else {
      // Week view - show reservations for 7 days starting from current date
      const weekEnd = addDays(currentDate, 6);
      return (
        reservationDate >= startOfDay(currentDate) &&
        reservationDate <= endOfDay(weekEnd)
      );
    }
  });

  // Group reservations by resource
  const reservationsByResource = resources.map((resource) => {
    return {
      resource,
      reservations: filteredReservations.filter(
        (r) => r.resourceId === resource.id
      ),
    };
  });

  // Add "Unassigned" group
  const unassignedReservations = {
    resource: { id: "unassigned", name: "Unassigned" },
    reservations: filteredReservations.filter((r) => !r.resourceId),
  };

  // Handle selecting a reservation
  const handleSelectReservation = (reservation: any) => {
    setSelectedReservation(reservation);
    setEditDialogOpen(true);
  };

  // Handle adding a new reservation
  const handleAddReservation = (date: Date) => {
    // Set default start/end times (e.g., noon to 2pm)
    const startTime = new Date(date);
    startTime.setHours(12, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(14, 0, 0);

    // Create a new empty reservation with the selected date
    setSelectedReservation({
      id: "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      startTime: startTime,
      endTime: endTime,
      size: 1,
      status: "PENDING",
      resourceId: "",
    });

    // Open the dialog in create mode
    setCreateDialogOpen(true);
  };

  // Handle date picker change
  const handleDatePickerChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setCurrentDate(date);
    }
  };

  // Generate time slots for the timeline
  const timeSlots: string[] = [];
  for (let hour = 6; hour < 24; hour++) {
    timeSlots.push(`${hour}:00`);
    timeSlots.push(`${hour}:30`);
  }

  // Calculate position for a reservation in the timeline
  // Calculate position for a reservation in the timeline
  const getReservationPosition = (startTime: Date) => {
    const hours = startTime.getHours();
    const minutes = startTime.getMinutes();
    const totalMinutes = hours * 60 + minutes - 6 * 60; // Start at 6:00 AM

    // Calculate position based on fixed width slots (20px per 30 minutes)
    const slotWidth = 80; // 20px * 4 (each hour has 2 slots of 30 min each)
    return `${(totalMinutes / 30) * (slotWidth / 4)}px`;
  };

  // Calculate width for a reservation based on duration
  const getReservationWidth = (startTime: Date, endTime: Date) => {
    if (!endTime) return "120px"; // Default width

    const durationMinutes =
      (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    // Calculate width based on fixed width slots
    const slotWidth = 80; // 20px * 4
    return `${(durationMinutes / 30) * (slotWidth / 4)}px`;
  };

  // Get status badge variant for a reservation
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "outline";
      case "PENDING":
        return "secondary";
      case "CANCELLED":
        return "destructive";
      case "COMPLETED":
        return "default";
      case "NO_SHOW":
        return "outline";
      case "WAITING_LIST":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Get current time indicator position
  // Get current time indicator position
  const getCurrentTimePosition = () => {
    const now = new Date();
    if (!isSameDay(now, currentDate) && timeScale === "day") return null;

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes - 6 * 60; // Start at 6:00 AM

    if (totalMinutes < 0 || totalMinutes > 18 * 60) return null;

    // Calculate position based on fixed width slots
    const slotWidth = 80; // 20px * 4
    return `${(totalMinutes / 30) * (slotWidth / 4)}px`;
  };

  // Format reservation time for display
  const formatReservationTime = (startTime: Date, endTime?: Date) => {
    const start = format(startTime, "h:mm a");
    if (!endTime) return start;
    return `${start} - ${format(endTime, "h:mm a")}`;
  };

  return (
    <div className="space-y-4 w-full">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (timeScale === "day") {
                    setCurrentDate(addDays(currentDate, -1));
                  } else {
                    setCurrentDate(addDays(currentDate, -7));
                  }
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-medium"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {timeScale === "day"
                      ? format(currentDate, "EEEE, MMMM d, yyyy")
                      : `${format(currentDate, "MMM d")} - ${format(addDays(currentDate, 6), "MMM d, yyyy")}`}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDatePickerChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (timeScale === "day") {
                    setCurrentDate(addDays(currentDate, 1));
                  } else {
                    setCurrentDate(addDays(currentDate, 7));
                  }
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Tabs
                defaultValue={timeScale}
                onValueChange={(v) => setTimeScale(v as "day" | "week")}
              >
                <TabsList>
                  <TabsTrigger value="day" className="flex items-center gap-1">
                    <CalendarRange className="h-3.5 w-3.5" />
                    Day
                  </TabsTrigger>
                  <TabsTrigger value="week" className="flex items-center gap-1">
                    <ArrowLeftRight className="h-3.5 w-3.5" />
                    Week
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Button onClick={() => handleAddReservation(currentDate)}>
                <Plus className="h-4 w-4 mr-2" />
                New Reservation
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="border-t">
            <ScrollArea className="w-full" ref={timelineRef}>
              <div className="min-w-48 overflow-auto">
                {/* Timeline header */}
                <div className="flex border-b sticky top-0 z-10 bg-background">
                  <div className="w-48 min-w-[12rem] border-r p-3 font-medium bg-muted/30">
                    Resources
                  </div>
                  <div className="flex flex-1">
                    {timeSlots.map((time, index) => (
                      <div
                        key={time}
                        className={cn(
                          "w-20 min-w-[5rem] p-3 text-center text-xs font-medium shrink-0",
                          index % 2 === 0
                            ? "border-r bg-muted/30"
                            : "bg-background",
                          time.startsWith(`${currentHour}:`) &&
                            isToday(currentDate) &&
                            "bg-primary/5"
                        )}
                      >
                        {time}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline body */}
                <div className="max-h-[600px] overflow-y-auto">
                  {/* Unassigned row */}
                  <div className="flex border-b hover:bg-muted/10 transition-colors">
                    <div className="w-48 min-w-[12rem] border-r p-3 font-medium flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      Unassigned
                    </div>
                    <div className="flex-1 relative min-h-[70px]">
                      {/* Time slot grid lines */}
                      <div className="absolute inset-0 flex pointer-events-none">
                        {timeSlots.map((_, index) => (
                          <div
                            key={index}
                            className={cn(
                              "w-20 min-w-[5rem] h-full border-r shrink-0",
                              index % 2 === 0
                                ? "border-border"
                                : "border-border/30"
                            )}
                          ></div>
                        ))}
                      </div>

                      {/* Current time indicator */}
                      {getCurrentTimePosition() && (
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-destructive z-10"
                          style={{
                            left: getCurrentTimePosition() || undefined,
                          }}
                        >
                          <div className="w-2 h-2 rounded-full bg-destructive -ml-[3px] -mt-[3px]"></div>
                        </div>
                      )}

                      {/* Unassigned reservations */}
                      {unassignedReservations.reservations.map(
                        (reservation) => {
                          const startTime = new Date(reservation.startTime);
                          const endTime = reservation.endTime
                            ? new Date(reservation.endTime)
                            : undefined;

                          return (
                            <TooltipProvider key={reservation.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={cn(
                                      "absolute top-2 h-12 rounded-md border-l-4 px-3 py-1.5 text-xs cursor-pointer shadow-sm hover:shadow transition-shadow",
                                      reservation.status === "CONFIRMED" &&
                                        "border-primary bg-primary/10",
                                      reservation.status === "PENDING" &&
                                        "border-secondary bg-secondary/10",
                                      reservation.status === "CANCELLED" &&
                                        "border-destructive bg-destructive/10",
                                      reservation.status === "COMPLETED" &&
                                        "border-primary bg-primary/10",
                                      reservation.status === "NO_SHOW" &&
                                        "border-muted-foreground bg-muted/20",
                                      reservation.status === "WAITING_LIST" &&
                                        "border-secondary bg-secondary/10"
                                    )}
                                    style={{
                                      left: getReservationPosition(startTime),
                                      width: endTime
                                        ? getReservationWidth(
                                            startTime,
                                            endTime
                                          )
                                        : "120px",
                                    }}
                                    onClick={() =>
                                      handleSelectReservation(reservation)
                                    }
                                  >
                                    <div className="font-medium truncate">
                                      {reservation.customerName}
                                    </div>
                                    <div className="truncate text-[10px] opacity-80 flex items-center">
                                      <Clock className="h-2.5 w-2.5 mr-1" />
                                      {formatReservationTime(
                                        startTime,
                                        endTime
                                      )}
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1">
                                    <p className="font-medium">
                                      {reservation.customerName}
                                    </p>
                                    <p className="text-xs flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {formatReservationTime(
                                        startTime,
                                        endTime
                                      )}
                                    </p>
                                    {reservation.size && (
                                      <p className="text-xs flex items-center">
                                        <User className="h-3 w-3 mr-1" />
                                        {reservation.size} guests
                                      </p>
                                    )}
                                    <Badge
                                      variant={getStatusBadgeVariant(
                                        reservation.status
                                      )}
                                    >
                                      {reservation.status.replace(/_/g, " ")}
                                    </Badge>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* Resource rows */}
                  {reservationsByResource.map(({ resource, reservations }) => (
                    <div
                      key={resource.id}
                      className="flex border-b hover:bg-muted/10 transition-colors"
                    >
                      <div className="w-48 min-w-[12rem] border-r p-3 font-medium flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        {resource.name}
                        {resource.capacity && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {resource.capacity}
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1 relative min-h-[70px]">
                        {/* Time slot grid lines */}
                        <div className="absolute inset-0 flex pointer-events-none">
                          {timeSlots.map((_, index) => (
                            <div
                              key={index}
                              className={cn(
                                "flex-1 h-full border-r",
                                index % 2 === 0
                                  ? "border-border"
                                  : "border-border/30"
                              )}
                            ></div>
                          ))}
                        </div>

                        {/* Current time indicator */}
                        {getCurrentTimePosition() && (
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-destructive z-10"
                            style={{
                              left: getCurrentTimePosition() || undefined,
                            }}
                          >
                            <div className="w-2 h-2 rounded-full bg-destructive -ml-[3px] -mt-[3px]"></div>
                          </div>
                        )}

                        {/* Resource reservations */}
                        {reservations.map((reservation) => {
                          const startTime = new Date(reservation.startTime);
                          const endTime = reservation.endTime
                            ? new Date(reservation.endTime)
                            : undefined;

                          return (
                            <TooltipProvider key={reservation.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={cn(
                                      "absolute top-2 h-12 rounded-md border-l-4 px-3 py-1.5 text-xs cursor-pointer shadow-sm hover:shadow transition-shadow",
                                      reservation.status === "CONFIRMED" &&
                                        "border-primary bg-primary/10",
                                      reservation.status === "PENDING" &&
                                        "border-secondary bg-secondary/10",
                                      reservation.status === "CANCELLED" &&
                                        "border-destructive bg-destructive/10",
                                      reservation.status === "COMPLETED" &&
                                        "border-primary bg-primary/10",
                                      reservation.status === "NO_SHOW" &&
                                        "border-muted-foreground bg-muted/20",
                                      reservation.status === "WAITING_LIST" &&
                                        "border-secondary bg-secondary/10"
                                    )}
                                    style={{
                                      left: getReservationPosition(startTime),
                                      width: endTime
                                        ? getReservationWidth(
                                            startTime,
                                            endTime
                                          )
                                        : "120px",
                                    }}
                                    onClick={() =>
                                      handleSelectReservation(reservation)
                                    }
                                  >
                                    <div className="font-medium truncate">
                                      {reservation.customerName}
                                    </div>
                                    <div className="truncate text-[10px] opacity-80 flex items-center">
                                      <Clock className="h-2.5 w-2.5 mr-1" />
                                      {formatReservationTime(
                                        startTime,
                                        endTime
                                      )}
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1">
                                    <p className="font-medium">
                                      {reservation.customerName}
                                    </p>
                                    <p className="text-xs flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {formatReservationTime(
                                        startTime,
                                        endTime
                                      )}
                                    </p>
                                    {reservation.size && (
                                      <p className="text-xs flex items-center">
                                        <User className="h-3 w-3 mr-1" />
                                        {reservation.size} guests
                                      </p>
                                    )}
                                    <Badge
                                      variant={getStatusBadgeVariant(
                                        reservation.status
                                      )}
                                    >
                                      {reservation.status.replace(/_/g, " ")}
                                    </Badge>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3 justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="cursor-help">
                  Confirmed
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reservation has been confirmed</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="cursor-help">
                  Pending
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reservation is awaiting confirmation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="destructive" className="cursor-help">
                  Cancelled
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reservation has been cancelled</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="default" className="cursor-help">
                  Completed
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reservation has been completed</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="cursor-help">
                  No Show
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Customer did not show up</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="cursor-help">
                  Waiting List
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Customer is on the waiting list</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </Card>

      {/* Edit dialog for existing reservations */}
      <ReservationDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        businessType={businessType}
        tenantId={tenantId || ""}
        mode="edit"
        refreshData={refreshData}
      />

      {/* Create dialog for new reservations */}
      <ReservationDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        businessType={businessType}
        tenantId={tenantId || ""}
        mode="create"
        refreshData={refreshData}
      />
    </div>
  );
}
