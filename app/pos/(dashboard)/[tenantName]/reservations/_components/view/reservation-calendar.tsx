/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useReservation } from "@/context/reservation-provider"
import { useDashboard } from "@/context/dashboard-provider"
import { useState } from "react"
import { ReservationDialog } from "../reservation-dialog"
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
} from "date-fns"
import { cn } from "@/lib/utils"
import { CalendarIcon, ChevronLeft, ChevronRight, GripVertical, Info, MoreHorizontal, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { restrictToWindowEdges } from "@dnd-kit/modifiers"
import { CSS } from "@dnd-kit/utilities"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { toast } from "sonner"
import { updateReservation } from "@/lib/actions/reservation-actions"

// Define event types for the calendar
interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource?: string
  status: string
  allDay?: boolean
  customerName: string
  size?: number
}

// Draggable event component
function DraggableEvent({ event, onClick }: { event: CalendarEvent; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: event.id,
    data: { event },
  })

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 50 : "auto",
      }
    : undefined

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 border-green-500 text-green-800"
      case "PENDING":
        return "bg-yellow-100 border-yellow-500 text-yellow-800"
      case "CANCELLED":
        return "bg-red-100 border-red-500 text-red-800"
      case "COMPLETED":
        return "bg-blue-100 border-blue-500 text-blue-800"
      case "NO_SHOW":
        return "bg-gray-100 border-gray-500 text-gray-800"
      case "WAITING_LIST":
        return "bg-purple-100 border-purple-500 text-purple-800"
      default:
        return "bg-gray-100 border-gray-500 text-gray-800"
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "px-2 py-1.5 rounded-md border-l-4 text-xs mb-1 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow",
        getStatusColor(event.status),
      )}
    >
      <div className="font-medium truncate flex items-center gap-1">
        <GripVertical className="h-3 w-3 opacity-50" />
        {event.title}
      </div>
      <div className="truncate text-[10px] opacity-80">
        {format(event.start, "h:mm a")} - {format(event.end, "h:mm a")}
      </div>
    </div>
  )
}

// Droppable day cell component
function DroppableDay({
  date,
  events,
  isCurrentMonth,
  onEventClick,
  onAddEvent,
}: {
  date: Date
  events: CalendarEvent[]
  isCurrentMonth: boolean
  onEventClick: (event: CalendarEvent) => void
  onAddEvent: (date: Date) => void
}) {
  const { setNodeRef } = useDroppable({
    id: format(date, "yyyy-MM-dd"),
    data: { date },
  })

  const maxEventsToShow = 3
  const hasMoreEvents = events.length > maxEventsToShow
  const visibleEvents = events.slice(0, maxEventsToShow)
  const hiddenEvents = events.slice(maxEventsToShow)

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "h-full min-h-[120px] p-1 border border-border/50",
        !isCurrentMonth && "bg-muted/30",
        isToday(date) && "bg-blue-50/50 dark:bg-blue-950/10",
      )}
    >
      <div className="flex justify-between items-center mb-1">
        <span
          className={cn(
            "text-xs font-medium h-6 w-6 flex items-center justify-center rounded-full",
            isToday(date) && "bg-primary text-primary-foreground",
          )}
        >
          {format(date, "d")}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
          onClick={() => onAddEvent(date)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <div className="space-y-1">
        {visibleEvents.map((event) => (
          <DraggableEvent key={event.id} event={event} onClick={() => onEventClick(event)} />
        ))}

        {hasMoreEvents && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full h-5 text-xs justify-start px-2 text-muted-foreground">
                <MoreHorizontal className="h-3 w-3 mr-1" /> {hiddenEvents.length} more
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {hiddenEvents.map((event) => (
                <DropdownMenuItem key={event.id} onClick={() => onEventClick(event)}>
                  <div className="w-full truncate">
                    <span className="font-medium">{event.customerName}</span>
                    <div className="text-xs text-muted-foreground">
                      {format(event.start, "h:mm a")} - {format(event.end, "h:mm a")}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}

export function ReservationCalendar() {
  const { reservations, setSelectedReservation, refreshData } = useReservation()
  const { tenantId, businessType } = useDashboard()
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"month" | "week" | "day">("month")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  // Convert reservations to calendar events
  const events: CalendarEvent[] = reservations.map((reservation) => ({
    id: reservation.id,
    title: `${reservation.customerName} (${reservation.size || 1})`,
    start: new Date(reservation.startTime),
    end: reservation.endTime
      ? new Date(reservation.endTime)
      : new Date(new Date(reservation.startTime).getTime() + 2 * 60 * 60 * 1000), // Default 2 hours if no end time
    resource: reservation.resourceId,
    status: reservation.status,
    customerName: reservation.customerName,
    size: reservation.size,
  }))

  const handleSelectEvent = (event: CalendarEvent) => {
    const reservation = reservations.find((r) => r.id === event.id)
    if (reservation) {
      setSelectedReservation(reservation)
      setEditDialogOpen(true)
    }
  }

  const handleAddReservation = (date: Date) => {
    // Set default start/end times (e.g., noon to 2pm)
    const startTime = new Date(date)
    startTime.setHours(12, 0, 0)
    
    const endTime = new Date(date)
    endTime.setHours(14, 0, 0)
    
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
    })
    
    // Open the dialog in create mode
    setCreateDialogOpen(true)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    const eventId = active.id as string
    const newDateStr = over.id as string
    const newDate = parse(newDateStr, "yyyy-MM-dd", new Date())

    // Find the event that was dragged
    const draggedEvent = events.find((e) => e.id === eventId)
    if (!draggedEvent) return

    // Calculate the time difference to maintain the same time of day and duration
    const startTime = draggedEvent.start
    const endTime = draggedEvent.end
    const duration = endTime.getTime() - startTime.getTime()

    // Create new date objects with the same time but different date
    const newStartDate = new Date(newDate)
    newStartDate.setHours(startTime.getHours(), startTime.getMinutes(), startTime.getSeconds())

    const newEndDate = new Date(newStartDate.getTime() + duration)

    // Show loading toast
    const loadingToast = toast.loading("Updating reservation date...")

    try {
      // Find the original reservation
      const reservation = reservations.find((r) => r.id === eventId)
      if (!reservation) {
        toast.dismiss(loadingToast)
        toast.error("Error", { description: "Reservation not found" })
        return
      }

      // Prepare the updated reservation data
      const updatedReservation = {
        id: reservation.id,
        customerName: reservation.customerName,
        customerEmail: reservation.customerEmail,
        customerPhone: reservation.customerPhone,
        startTime: newStartDate,
        endTime: newEndDate,
        size: reservation.size || 1,
        specialRequests: reservation.notes,
        status: reservation.status,
        resourceId: reservation.resourceId,
      }

      // Call the updateReservation action
      const result = await updateReservation(
        businessType || "RETAIL",
        updatedReservation,
        tenantId || ""
      )

      toast.dismiss(loadingToast)

      if (result.success) {
        toast.success("Reservation updated", {
          description: `Moved to ${format(newStartDate, "MMMM d, yyyy")}`,
        })
        refreshData()
      } else {
        toast.error("Error", {
          description: result.error || "Failed to update reservation date",
        })
      }
    } catch (error) {
      toast.dismiss(loadingToast)
      console.error("Error updating reservation date:", error)
      toast.error("Error", {
        description: "An unexpected error occurred",
      })
    }
  }

  // Generate days for the month view
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const startDate = startOfWeek(monthStart)
  const endDate = addDays(startOfWeek(monthEnd), 41) // 6 weeks total

  const days = eachDayOfInterval({ start: startDate, end: endDate })

  // Group events by day for the month view
  const eventsByDay = days.reduce<Record<string, CalendarEvent[]>>((acc, day) => {
    const dateStr = format(day, "yyyy-MM-dd")
    acc[dateStr] = events.filter((event) => isSameDay(day, event.start))
    return acc
  }, {})

  // Handle date picker change
  const handleDatePickerChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      setCurrentDate(date)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (view === "month") {
                    setCurrentDate(subMonths(currentDate, 1))
                  } else if (view === "week") {
                    setCurrentDate(addDays(currentDate, -7))
                  } else {
                    setCurrentDate(addDays(currentDate, -1))
                  }
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="min-w-[240px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(currentDate, "MMMM yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={selectedDate} onSelect={handleDatePickerChange} initialFocus />
                </PopoverContent>
              </Popover>

              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (view === "month") {
                    setCurrentDate(addMonths(currentDate, 1))
                  } else if (view === "week") {
                    setCurrentDate(addDays(currentDate, 7))
                  } else {
                    setCurrentDate(addDays(currentDate, 1))
                  }
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Select value={view} onValueChange={(value) => setView(value as any)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={() => handleAddReservation(currentDate)}>
                <Plus className="h-4 w-4 mr-2" />
                New Reservation
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <DndContext sensors={sensors} onDragEnd={handleDragEnd} modifiers={[restrictToWindowEdges]}>
            {view === "month" && (
              <div className="grid grid-cols-7 text-center">
                {/* Day headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="py-2 font-medium text-sm border-b">
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {days.map((day) => {
                  const dateStr = format(day, "yyyy-MM-dd")
                  const dayEvents = eventsByDay[dateStr] || []

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
                  )
                })}
              </div>
            )}

            {/* Week view would go here */}
            {view === "week" && (
              <div className="h-[600px] flex flex-col">
                <div className="text-center p-4">Week view coming soon</div>
              </div>
            )}

            {/* Day view would go here */}
            {view === "day" && (
              <div className="h-[600px] flex flex-col">
                <div className="text-center p-4">Day view coming soon</div>
              </div>
            )}
          </DndContext>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3 justify-center p-4 bg-white rounded-lg shadow-sm border">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-500">
                  Confirmed
                </Badge>
                <Info className="h-3 w-3 text-muted-foreground" />
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
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-500">
                  Pending
                </Badge>
                <Info className="h-3 w-3 text-muted-foreground" />
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
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-500">
                  Cancelled
                </Badge>
                <Info className="h-3 w-3 text-muted-foreground" />
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
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-500">
                  Completed
                </Badge>
                <Info className="h-3 w-3 text-muted-foreground" />
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
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-500">
                  No Show
                </Badge>
                <Info className="h-3 w-3 text-muted-foreground" />
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
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-500">
                  Waiting List
                </Badge>
                <Info className="h-3 w-3 text-muted-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Customer is on the waiting list</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

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
  )
}