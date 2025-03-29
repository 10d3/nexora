import { prisma } from "@/lib/prisma";
import {
  ReservationStatus,
  AppointmentStatus,
  BookingStatus,
  BusinessType,
} from "@prisma/client";

export type ReservationItem = {
  id: string;
  title: string;
  startTime: Date;
  endTime?: Date;
  status: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  notes?: string | null;
  size?: number;
  resourceId?: string;
  resourceName?: string;
  resourceType?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ReservationFilter = {
  search?: string;
  status?: string[];
  startDate?: Date;
  endDate?: Date;
  resourceIds?: string[];
};

export async function getReservations(
  tenantId: string,
  businessType: BusinessType,
  filter: ReservationFilter = {}
): Promise<ReservationItem[]> {
  const { search, status, startDate, endDate, resourceIds } = filter;

  switch (businessType) {
    case "RESTAURANT": {
      const reservations = await prisma.reservation.findMany({
        where: {
          tenantId,
          ...(search && {
            OR: [
              { customerName: { contains: search, mode: "insensitive" } },
              { customerEmail: { contains: search, mode: "insensitive" } },
              { customerPhone: { contains: search, mode: "insensitive" } },
            ],
          }),
          ...(status?.length && {
            status: { in: status as ReservationStatus[] },
          }),
          ...(startDate && { reservationTime: { gte: startDate } }),
          ...(endDate && { reservationTime: { lte: endDate } }),
          ...(resourceIds?.length && { tableId: { in: resourceIds } }),
        },
        include: {
          table: true,
        },
        orderBy: {
          reservationTime: "asc",
        },
      });

      return reservations.map((res) => ({
        id: res.id,
        title: `${res.customerName} (${res.partySize} guests)`,
        startTime: res.reservationTime,
        endTime: new Date(res.reservationTime.getTime() + 2 * 60 * 60 * 1000), // Default 2 hours
        status: res.status,
        customerName: res.customerName,
        customerEmail: res.customerEmail,
        customerPhone: res.customerPhone,
        notes: res.specialRequests,
        size: res.partySize,
        resourceId: res.tableId || undefined,
        resourceName: res.table?.number || "No Table",
        resourceType: "table",
        createdAt: res.createdAt,
        updatedAt: res.updatedAt,
      }));
    }

    case "HOTEL": {
      const bookings = await prisma.booking.findMany({
        where: {
          tenantId,
          ...(search && {
            OR: [
              {
                guest: { firstName: { contains: search, mode: "insensitive" } },
              },
              {
                guest: { lastName: { contains: search, mode: "insensitive" } },
              },
              { guest: { email: { contains: search, mode: "insensitive" } } },
              { guest: { phone: { contains: search, mode: "insensitive" } } },
            ],
          }),
          ...(status?.length && { status: { in: status as BookingStatus[] } }),
          ...(startDate && { checkIn: { gte: startDate } }),
          ...(endDate && { checkOut: { lte: endDate } }),
          ...(resourceIds?.length && { roomId: { in: resourceIds } }),
        },
        include: {
          guest: true,
          room: true,
        },
        orderBy: {
          checkIn: "asc",
        },
      });

      return bookings.map((booking) => ({
        id: booking.id,
        title: `${booking.guest.firstName} ${booking.guest.lastName}`,
        startTime: booking.checkIn,
        endTime: booking.checkOut,
        status: booking.status,
        customerName: `${booking.guest.firstName} ${booking.guest.lastName}`,
        customerEmail: booking.guest.email,
        customerPhone: booking.guest.phone,
        notes: null,
        size: booking.adults + booking.children,
        resourceId: booking.roomId,
        resourceName: booking.room.number,
        resourceType: "room",
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      }));
    }

    case "SALON":
    case "SERVICE": {
      const appointments = await prisma.appointment.findMany({
        where: {
          tenantId,
          ...(search && {
            OR: [
              { user: { name: { contains: search, mode: "insensitive" } } },
              { user: { email: { contains: search, mode: "insensitive" } } },
            ],
          }),
          ...(status?.length && {
            status: { in: status as AppointmentStatus[] },
          }),
          ...(startDate && { startTime: { gte: startDate } }),
          ...(endDate && { endTime: { lte: endDate } }),
          ...(resourceIds?.length && {
            staffAppointments: {
              some: { staffId: { in: resourceIds } },
            },
          }),
        },
        include: {
          user: true,
          staffAppointments: {
            include: {
              staff: true,
            },
          },
        },
        orderBy: {
          startTime: "asc",
        },
      });

      return appointments.map((apt) => ({
        id: apt.id,
        title: apt.user.name || "Unnamed Customer",
        startTime: apt.startTime,
        endTime: apt.endTime,
        status: apt.status,
        customerName: apt.user.name || "Unnamed Customer",
        customerEmail: apt.user.email,
        customerPhone: null,
        notes: apt.notes,
        size: 1,
        resourceId: apt.staffAppointments[0]?.staffId,
        resourceName: apt.staffAppointments[0]?.staff.name || "Unassigned",
        resourceType: "staff",
        createdAt: apt.createdAt,
        updatedAt: apt.updatedAt,
      }));
    }

    default:
      return [];
  }
}

export async function getResources(
  tenantId: string,
  businessType: BusinessType
) {
  switch (businessType) {
    case "RESTAURANT": {
      const tables = await prisma.table.findMany({
        where: { tenantId },
        orderBy: { number: "asc" },
      });

      return tables.map((table) => ({
        id: table.id,
        name: `Table ${table.number}`,
        type: "table",
        capacity: table.capacity,
        status: table.status,
      }));
    }

    case "HOTEL": {
      const rooms = await prisma.room.findMany({
        where: { tenantId },
        orderBy: { number: "asc" },
      });

      return rooms.map((room) => ({
        id: room.id,
        name: `Room ${room.number}`,
        type: "room",
        capacity: room.capacity,
        status: room.status,
        rate: room.rate,
        roomType: room.type,
      }));
    }

    case "SALON":
    case "SERVICE": {
      const staff = await prisma.staff.findMany({
        where: { tenantId },
        orderBy: { name: "asc" },
      });

      return staff.map((s) => ({
        id: s.id,
        name: s.name,
        type: "staff",
        specialization: s.specialization,
        email: s.email,
        phone: s.phone,
      }));
    }

    default:
      return [];
  }
}

export async function getStatusOptions(businessType: BusinessType) {
  switch (businessType) {
    case "RESTAURANT":
      return Object.values(ReservationStatus);
    case "HOTEL":
      return Object.values(BookingStatus);
    case "SALON":
    case "SERVICE":
      return Object.values(AppointmentStatus);
    default:
      return [];
  }
}
