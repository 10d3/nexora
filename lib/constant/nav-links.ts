/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BarChart4,
  Calendar,
  //   CreditCard,
  Home,
  LayoutGrid,
  ListOrdered,
  Package,
  Percent,
  Settings,
  ShoppingCart,
  //   Store,
  Users,
  Utensils,
  Bed,
  Scissors,
  Pill,
  //   ShoppingBasket,
  Building,
  //   Coffee,
  Wine,
  Truck,
  Hammer,
  Leaf,
  Cpu,
  GraduationCap,
  PartyPopper,
  Shirt,
  Shield,
  Car,
} from "lucide-react";
import { BusinessType } from "@prisma/client";

// Define the navigation item type
// Define the navigation item type
export type NavItem = {
  title: string;
  url: string;
  icon: any;
  isActive?: boolean;
  hasSubmenu?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
};

// Common navigation links for all business types
const commonNavLinks: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    hasSubmenu: false,
  },
  {
    title: "Products",
    url: "/products",
    icon: Package,
    hasSubmenu: false,
  },
  {
    title: "Orders",
    url: "/orders",
    icon: ShoppingCart,
    hasSubmenu: false,
  },
  {
    title: "Customers",
    url: "/customers",
    icon: Users,
    hasSubmenu: false,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart4,
    hasSubmenu: true,
    items: [
      {
        title: "Sales",
        url: "/reports/sales",
      },
      {
        title: "Inventory",
        url: "/reports/inventory",
      },
    ],
  },
];

// Settings navigation item - moved to be added last
const settingsNavItem: NavItem = {
  title: "Settings",
  url: "/settings",
  icon: Settings,
  hasSubmenu: true,
  items: [
    {
      title: "General",
      url: "/settings/general",
    },
    {
      title: "Users",
      url: "/settings/users",
    },
  ],
};

// Business-specific navigation links
const businessSpecificNavLinks: Record<BusinessType, NavItem[]> = {
  RETAIL: [
    {
      title: "Inventory",
      url: "/inventory",
      icon: Package,
      hasSubmenu: false,
    },
    {
      title: "Categories",
      url: "/categories",
      icon: LayoutGrid,
      hasSubmenu: false,
    },
    {
      title: "Promotions",
      url: "/promotions",
      icon: Percent,
      hasSubmenu: false,
    },
  ],
  RESTAURANT: [
    {
      title: "Tables",
      url: "/tables",
      icon: Utensils,
    },
    {
      title: "Menu Items",
      url: "/menu-items",
      icon: ListOrdered,
    },
    {
      title: "Reservations",
      url: "/reservations",
      icon: Calendar,
    },
  ],
  HOTEL: [
    {
      title: "Rooms",
      url: "/rooms",
      icon: Bed,
    },
    {
      title: "Bookings",
      url: "/bookings",
      icon: Calendar,
    },
    {
      title: "Guests",
      url: "/guests",
      icon: Users,
    },
  ],
  SALON: [
    {
      title: "Appointments",
      url: "/appointments",
      icon: Calendar,
    },
    {
      title: "Staff",
      url: "/staff",
      icon: Scissors,
    },
    {
      title: "Services",
      url: "/services",
      icon: ListOrdered,
    },
  ],
  SERVICE: [
    {
      title: "Appointments",
      url: "/appointments",
      icon: Calendar,
    },
    {
      title: "Staff",
      url: "/staff",
      icon: Users,
    },
    {
      title: "Services",
      url: "/services",
      icon: ListOrdered,
    },
  ],
  PHARMACIE: [
    {
      title: "Medications",
      url: "/medications",
      icon: Pill,
    },
    {
      title: "Prescriptions",
      url: "/prescriptions",
      icon: ListOrdered,
    },
    {
      title: "Inventory",
      url: "/inventory",
      icon: Package,
    },
  ],
  SUPERMARKET: [
    {
      title: "Departments",
      url: "/departments",
      icon: LayoutGrid,
    },
    {
      title: "Promotions",
      url: "/promotions",
      icon: Percent,
    },
    {
      title: "Inventory",
      url: "/inventory",
      icon: Package,
    },
  ],
  BOUTIQUE: [
    {
      title: "Inventory",
      url: "/inventory",
      icon: Package,
    },
    {
      title: "Categories",
      url: "/categories",
      icon: LayoutGrid,
    },
    {
      title: "Promotions",
      url: "/promotions",
      icon: Percent,
    },
  ],
  BAKERY: [
    {
      title: "Menu Items",
      url: "/menu-items",
      icon: ListOrdered,
    },
    {
      title: "Inventory",
      url: "/inventory",
      icon: Package,
    },
    {
      title: "Orders",
      url: "/orders",
      icon: ShoppingCart,
    },
  ],
  BAR: [
    {
      title: "Menu Items",
      url: "/menu-items",
      icon: Wine,
    },
    {
      title: "Tables",
      url: "/tables",
      icon: Utensils,
    },
    {
      title: "Inventory",
      url: "/inventory",
      icon: Package,
    },
  ],
  // Add other business types with their specific navigation links
  QUINQUAILLERIE: [
    {
      title: "Inventory",
      url: "/inventory",
      icon: Package,
    },
    {
      title: "Categories",
      url: "/categories",
      icon: LayoutGrid,
    },
  ],
  DEPOT: [
    {
      title: "Inventory",
      url: "/inventory",
      icon: Package,
    },
    {
      title: "Suppliers",
      url: "/suppliers",
      icon: Truck,
    },
  ],
  CYBERCAFE: [
    {
      title: "Services",
      url: "/services",
      icon: Cpu,
    },
    {
      title: "Appointments",
      url: "/appointments",
      icon: Calendar,
    },
  ],
  TRANSPORTATION: [
    {
      title: "Vehicles",
      url: "/vehicles",
      icon: Truck,
    },
    {
      title: "Bookings",
      url: "/bookings",
      icon: Calendar,
    },
  ],
  CONSTRUCTION: [
    {
      title: "Inventory",
      url: "/inventory",
      icon: Hammer,
    },
    {
      title: "Projects",
      url: "/projects",
      icon: Building,
    },
  ],
  AGRICULTURE: [
    {
      title: "Inventory",
      url: "/inventory",
      icon: Leaf,
    },
    {
      title: "Products",
      url: "/products",
      icon: Package,
    },
  ],
  ELECTRONICS: [
    {
      title: "Inventory",
      url: "/inventory",
      icon: Cpu,
    },
    {
      title: "Services",
      url: "/services",
      icon: Settings,
    },
  ],
  EDUCATION: [
    {
      title: "Courses",
      url: "/courses",
      icon: GraduationCap,
    },
    {
      title: "Students",
      url: "/students",
      icon: Users,
    },
  ],
  EVENT_PLANNING: [
    {
      title: "Events",
      url: "/events",
      icon: PartyPopper,
    },
    {
      title: "Bookings",
      url: "/bookings",
      icon: Calendar,
    },
  ],
  TEXTILE: [
    {
      title: "Inventory",
      url: "/inventory",
      icon: Shirt,
    },
    {
      title: "Products",
      url: "/products",
      icon: Package,
    },
  ],
  SECURITY: [
    {
      title: "Services",
      url: "/services",
      icon: Shield,
    },
    {
      title: "Staff",
      url: "/staff",
      icon: Users,
    },
  ],
  AUTOMOTIVE: [
    {
      title: "Services",
      url: "/services",
      icon: Car,
    },
    {
      title: "Inventory",
      url: "/inventory",
      icon: Package,
    },
  ],
  OTHER: [
    {
      title: "Inventory",
      url: "/inventory",
      icon: Package,
    },
    {
      title: "Categories",
      url: "/categories",
      icon: LayoutGrid,
    },
  ],
};

// Function to get navigation links based on business type
export function getNavLinks(businessType: BusinessType): NavItem[] {
  const specificLinks = businessSpecificNavLinks[businessType] || [];

  // Make sure all specific links have hasSubmenu set to false if they don't have items
  const processedSpecificLinks = specificLinks.map((link) => ({
    ...link,
    hasSubmenu: !!link.items && link.items.length > 0,
  }));

  // Add settings as the last item
  return [...commonNavLinks, ...processedSpecificLinks, settingsNavItem];
}
