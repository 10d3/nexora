/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useReservation } from "@/context/reservation-provider";
import { useDashboard } from "@/context/dashboard-provider";
import { useState } from "react";
import { ReservationDialog } from "../reservation-dialog";
import {
  format,
  addDays,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parse,
  isToday,
  getHours,
  getMinutes,
  differenceInMinutes,
} from "date-fns";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  GripVertical,
  LayoutGrid,
  MoreHorizontal,
  Plus,
  User,
  CalendarPlus2Icon as CalendarIcon2,
  CalendarDays,
  CalendarRange,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { toast } from "sonner";
import { useReservationMutation } from "@/hooks/use-reservation-mutations";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
// import { useQueryClient } from "@tanstack/react-query";

// Define event types for the calendar
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: string;
  status: string;
  allDay?: boolean;
  customerName: string;
  size?: number;
  isTemporary?: boolean;
}

// Draggable event component
function DraggableEvent({
  event,
  onClick,
  isCompact = false,
  heightInMinutes = 0,
}: {
  event: CalendarEvent;
  onClick: () => void;
  isCompact?: boolean;
  heightInMinutes?: number;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: event.id,
      data: { event },
    });

  const style = {
    ...(transform
      ? {
          transform: CSS.Translate.toString(transform),
          zIndex: isDragging ? 50 : "auto",
        }
      : {}),
    ...(heightInMinutes > 0
      ? {
          height: `${heightInMinutes}px`,
          minHeight: `${heightInMinutes}px`,
        }
      : {}),
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "CONFIRMED":
        return "bg-green-100 border-l-green-500 text-green-800 dark:bg-green-950/30 dark:border-l-green-400 dark:text-green-300";
      case "PENDING":
        return "bg-amber-100 border-l-amber-500 text-amber-800 dark:bg-amber-950/30 dark:border-l-amber-400 dark:text-amber-300";
      case "CANCELLED":
        return "bg-red-100 border-l-red-500 text-red-800 dark:bg-red-950/30 dark:border-l-red-400 dark:text-red-300";
      case "COMPLETED":
        return "bg-blue-100 border-l-blue-500 text-blue-800 dark:bg-blue-950/30 dark:border-l-blue-400 dark:text-blue-300";
      case "NO_SHOW":
        return "bg-gray-100 border-l-gray-500 text-gray-800 dark:bg-gray-800/50 dark:border-l-gray-400 dark:text-gray-300";
      case "WAITING_LIST":
        return "bg-purple-100 border-l-purple-500 text-purple-800 dark:bg-purple-950/30 dark:border-l-purple-400 dark:text-purple-300";
      case "CHECKED_IN":
        return "bg-teal-100 border-l-teal-500 text-teal-800 dark:bg-teal-950/30 dark:border-l-teal-400 dark:text-teal-300";
      case "CHECKED_OUT":
        return "bg-indigo-100 border-l-indigo-500 text-indigo-800 dark:bg-indigo-950/30 dark:border-l-indigo-400 dark:text-indigo-300";
      default:
        return "bg-gray-100 border-l-gray-500 text-gray-800 dark:bg-gray-800/50 dark:border-l-gray-400 dark:text-gray-300";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "px-2 py-1.5 rounded-md border-l-4 text-xs mb-1 cursor-grab active:cursor-grabbing transition-all",
        getStatusColor(event.status),
        isDragging
          ? "shadow-lg opacity-90 scale-105"
          : "shadow-sm hover:shadow-md",
        event.isTemporary && "opacity-70 border-dashed",
        isCompact ? "mx-1" : ""
      )}
    >
      <div className="font-medium truncate flex items-center gap-1">
        <GripVertical className="h-3 w-3 opacity-50 flex-shrink-0" />
        {event.title}
      </div>
      {!isCompact && (
        <div className="truncate text-[10px] opacity-80 flex items-center gap-1">
          <Clock className="h-2.5 w-2.5 flex-shrink-0" />
          {format(event.start, "h:mm a")} - {format(event.end, "h:mm a")}
        </div>
      )}
      {event.size && !isCompact && (
        <div className="truncate text-[10px] opacity-80 flex items-center gap-1">
          <User className="h-2.5 w-2.5 flex-shrink-0" />
          {event.size} {event.size === 1 ? "guest" : "guests"}
        </div>
      )}
    </div>
  );
}

// Droppable day cell component
function DroppableDay({
  date,
  events,
  isCurrentMonth,
  onEventClick,
  onAddEvent,
}: {
  date: Date;
  events: CalendarEvent[];
  isCurrentMonth: boolean;
  onEventClick: (event: CalendarEvent) => void;
  onAddEvent: (date: Date) => void;
}) {
  const { setNodeRef } = useDroppable({
    id: format(date, "yyyy-MM-dd"),
    data: { date },
  });

  const maxEventsToShow = 3;
  const hasMoreEvents = events.length > maxEventsToShow;
  const visibleEvents = events.slice(0, maxEventsToShow);
  const hiddenEvents = events.slice(maxEventsToShow);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "h-full min-h-[120px] p-1 border border-border/50 transition-colors",
        !isCurrentMonth && "bg-muted/30",
        isToday(date) && "bg-blue-50/50 dark:bg-blue-950/10"
      )}
    >
      <div className="flex justify-between items-center mb-1">
        <span
          className={cn(
            "text-xs font-medium h-6 w-6 flex items-center justify-center rounded-full transition-colors",
            isToday(date) && "bg-primary text-primary-foreground"
          )}
        >
          {format(date, "d")}
        </span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddEvent(date);
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Add reservation</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="space-y-1">
        {visibleEvents.map((event) => (
          <DraggableEvent
            key={event.id}
            event={event}
            onClick={() => onEventClick(event)}
          />
        ))}

        {hasMoreEvents && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-5 text-xs justify-start px-2 text-muted-foreground"
              >
                <MoreHorizontal className="h-3 w-3 mr-1" />{" "}
                {hiddenEvents.length} more
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {hiddenEvents.map((event) => (
                <DropdownMenuItem
                  key={event.id}
                  onClick={() => onEventClick(event)}
                >
                  <div className="w-full truncate">
                    <span className="font-medium">{event.customerName}</span>
                    <div className="text-xs text-muted-foreground">
                      {format(event.start, "h:mm a")} -{" "}
                      {format(event.end, "h:mm a")}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

export function ReservationCalendar() {
  const { reservations, setSelectedReservation } = useReservation();
  const { tenantId, businessType } = useDashboard();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  // const queryClient = useQueryClient();

  // Use the reservation mutations hook
  const { updateReservation, isPending } = useReservationMutation(
    businessType || "RETAIL",
    tenantId || ""
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Convert reservations to calendar events
  const events: CalendarEvent[] = reservations.map((reservation) => ({
    id: reservation.id,
    title: `${reservation.customerName} ${reservation.size ? `(${reservation.size})` : ""}`,
    start: new Date(reservation.startTime),
    end: reservation.endTime
      ? new Date(reservation.endTime)
      : new Date(
          new Date(reservation.startTime).getTime() + 2 * 60 * 60 * 1000
        ), // Default 2 hours if no end time
    resource: reservation.resourceId,
    status: reservation.status,
    customerName: reservation.customerName,
    size: reservation.size,
    isTemporary: reservation.id.startsWith("temp-"),
  }));

  const handleSelectEvent = (event: CalendarEvent) => {
    // Don't allow editing temporary events
    if (event.isTemporary) {
      toast.info("Please wait", {
        description: "This reservation is still being processed",
      });
      return;
    }

    const reservation = reservations.find((r) => r.id === event.id);
    if (reservation) {
      setSelectedReservation(reservation);
      setEditDialogOpen(true);
    }
  };

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const eventId = active.id as string;
    const newDateStr = over.id as string;
    const newDate = parse(newDateStr, "yyyy-MM-dd", new Date());

    // Find the event that was dragged
    const draggedEvent = events.find((e) => e.id === eventId);
    if (!draggedEvent) return;

    // Don't allow dragging temporary events
    if (draggedEvent.isTemporary) {
      toast.info("Please wait", {
        description: "This reservation is still being processed",
      });
      return;
    }

    // Calculate the time difference to maintain the same time of day and duration
    const startTime = draggedEvent.start;
    const endTime = draggedEvent.end;
    const duration = endTime.getTime() - startTime.getTime();

    // Create new date objects with the same time but different date
    const newStartDate = new Date(newDate);
    newStartDate.setHours(
      startTime.getHours(),
      startTime.getMinutes(),
      startTime.getSeconds()
    );

    const newEndDate = new Date(newStartDate.getTime() + duration);

    // Find the original reservation
    const reservation = reservations.find((r) => r.id === eventId);
    if (!reservation) {
      toast.error("Error", { description: "Reservation not found" });
      return;
    }

    // Prepare the updated reservation data
    const updatedReservation = {
      ...reservation,
      startTime: newStartDate,
      endTime: newEndDate,
    };

    // Use the mutation from the hook which handles optimistic updates
    updateReservation(updatedReservation);
  };

  // Generate days for the month view
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = addDays(startOfWeek(monthEnd), 41); // 6 weeks total

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Group events by day for the month view
  const eventsByDay = days.reduce<Record<string, CalendarEvent[]>>(
    (acc, day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      acc[dateStr] = events.filter((event) => isSameDay(day, event.start));
      return acc;
    },
    {}
  );

  // Handle date picker change
  const handleDatePickerChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setCurrentDate(date);
    }
  };

  // Get view-specific title
  const getViewTitle = () => {
    if (view === "month") {
      return format(currentDate, "MMMM yyyy");
    } else if (view === "week") {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = addDays(weekStart, 6);
      if (isSameMonth(weekStart, weekEnd)) {
        return `${format(weekStart, "MMM d")} - ${format(weekEnd, "d, yyyy")}`;
      } else {
        return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
      }
    } else {
      return format(currentDate, "EEEE, MMMM d, yyyy");
    }
  };

  // Get view icon
  const getViewIcon = () => {
    switch (view) {
      case "month":
        return <CalendarDays className="h-4 w-4 mr-2" />;
      case "week":
        return <CalendarRange className="h-4 w-4 mr-2" />;
      case "day":
        return <CalendarIcon2 className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (view === "month") {
                    setCurrentDate(subMonths(currentDate, 1));
                  } else if (view === "week") {
                    setCurrentDate(addDays(currentDate, -7));
                  } else {
                    setCurrentDate(addDays(currentDate, -1));
                  }
                }}
                className="h-9 w-9"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous</span>
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="min-w-[240px] justify-start text-left font-normal"
                  >
                    {getViewIcon()}
                    {getViewTitle()}
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
                  if (view === "month") {
                    setCurrentDate(addMonths(currentDate, 1));
                  } else if (view === "week") {
                    setCurrentDate(addDays(currentDate, 7));
                  } else {
                    setCurrentDate(addDays(currentDate, 1));
                  }
                }}
                className="h-9 w-9"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => setCurrentDate(new Date())}
                className="h-9"
              >
                Today
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {/* <Tabs
                value={view}
                onValueChange={(value) => setView(value as any)}
                className="w-fit"
              >
                <TabsList className="grid grid-cols-3 w-[220px]">
                  <TabsTrigger
                    value="month"
                    className="flex items-center gap-1"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    <span>Month</span>
                  </TabsTrigger>
                  <TabsTrigger value="week" className="flex items-center gap-1">
                    <CalendarRange className="h-3.5 w-3.5" />
                    <span>Week</span>
                  </TabsTrigger>
                  <TabsTrigger value="day" className="flex items-center gap-1">
                    <CalendarIcon2 className="h-3.5 w-3.5" />
                    <span>Day</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs> */}

              <Separator orientation="vertical" className="h-6" />

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => handleAddReservation(currentDate)}
                      disabled={isPending}
                      className="h-9"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Reservation
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add a new reservation</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <DndContext
            sensors={sensors}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToWindowEdges]}
          >
            {view === "month" && (
              <div className="grid grid-cols-7 text-center">
                {/* Day headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="py-2 font-medium text-sm border-b"
                    >
                      {day}
                    </div>
                  )
                )}

                {/* Calendar days */}
                {days.map((day) => {
                  const dateStr = format(day, "yyyy-MM-dd");
                  const dayEvents = eventsByDay[dateStr] || [];

                  return (
                    <div key={dateStr} className="group min-h-[120px] relative">
                      <DroppableDay
                        date={day}
                        events={dayEvents}
                        isCurrentMonth={isSameMonth(day, currentDate)}
                        onEventClick={handleSelectEvent}
                        onAddEvent={handleAddReservation}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Week view */}
            {/* {view === "week" && (
              <WeekViewGrid
                currentDate={currentDate}
                events={events}
                onEventClick={handleSelectEvent}
                onCellClick={handleAddReservation}
              />
            )} */}

            {/* Day view */}
            {/* {view === "day" && (
              <DayViewGrid
                currentDate={currentDate}
                events={events}
                onEventClick={handleSelectEvent}
                onCellClick={handleAddReservation}
              />
            )} */}
          </DndContext>
        </CardContent>
      </Card>

      <Card className="p-4 border shadow-sm">
        <div className="flex flex-wrap gap-3 justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300 text-xs border border-green-200 dark:border-green-800">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Confirmed
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reservation has been confirmed</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 text-xs border border-amber-200 dark:border-amber-800">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Pending
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reservation is awaiting confirmation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-300 text-xs border border-red-200 dark:border-red-800">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  Cancelled
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reservation has been cancelled</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300 text-xs border border-blue-200 dark:border-blue-800">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Completed
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reservation has been completed</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300 text-xs border border-gray-200 dark:border-gray-700">
                  <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                  No Show
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Customer did not show up</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-300 text-xs border border-purple-200 dark:border-purple-800">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  Waiting List
                </div>
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
      />

      {/* Create dialog for new reservations */}
      <ReservationDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        businessType={businessType}
        tenantId={tenantId || ""}
        mode="create"
      />
    </div>
  );
}
