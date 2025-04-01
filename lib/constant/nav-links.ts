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
  UserCog,
  CreditCard,
  FileText,
  Warehouse,
  // Store,
  // ShoppingBasket,
  Coffee,
  Briefcase,
  BookOpen,
} from "lucide-react";
import { BusinessType } from "@prisma/client";

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
    url: "/",
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
      {
        title: "Customer Analytics",
        url: "/reports/customers",
      },
    ],
  },
];

// Get inventory nav item based on business type
const getInventoryNavItem = (businessType: BusinessType): NavItem | null => {
  // These business types should have inventory management
  const inventoryBusinessTypes = [
    "RETAIL",
    "SUPERMARKET",
    "BOUTIQUE",
    "BAKERY",
    "BAR",
    "QUINQUAILLERIE",
    "DEPOT",
    "CONSTRUCTION",
    "AGRICULTURE",
    "ELECTRONICS",
    "TEXTILE",
    "AUTOMOTIVE",
    "PHARMACIE",
    "RESTAURANT",
  ];

  if (inventoryBusinessTypes.includes(businessType)) {
    return {
      title: "Inventory",
      url: "/inventory",
      icon: Warehouse,
      hasSubmenu: false,
    };
  }

  return null;
};

// Get credit system nav item if applicable
const getCreditNavItem = (): NavItem => {
  return {
    title: "Credit System",
    url: "/credit",
    icon: CreditCard,
    hasSubmenu: true,
    items: [
      {
        title: "Accounts",
        url: "/credit/accounts",
      },
      {
        title: "Transactions",
        url: "/credit/transactions",
      },
    ],
  };
};

// Staff navigation item - common for many business types but with different labels
const getStaffNavItem = (businessType: BusinessType): NavItem | null => {
  switch (businessType) {
    case "SALON":
      return {
        title: "Staff",
        url: "/staff",
        icon: Scissors,
        hasSubmenu: false,
      };
    case "SERVICE":
      return {
        title: "Staff",
        url: "/staff",
        icon: UserCog,
      };
    case "SECURITY":
      return {
        title: "Guard",
        url: "/staff",
        icon: UserCog,
        hasSubmenu: false,
      };
    case "BAR":
      return {
        title: "Staff",
        url: "/staff",
        icon: UserCog,
        hasSubmenu: false,
      };
    case "BAKERY":
      return {
        title: "Staff",
        url: "/staff",
        icon: Users,
        hasSubmenu: false,
      };
    case "RESTAURANT":
      return {
        title: "Personnel",
        url: "/staff",
        icon: UserCog,
        hasSubmenu: false,
      };
    case "HOTEL":
      return {
        title: "Personnel",
        url: "/staff",
        icon: UserCog,
        hasSubmenu: false,
      };
    case "EDUCATION":
      return {
        title: "Personnel",
        url: "/staff",
        icon: UserCog,
        hasSubmenu: false,
      };
    case "EVENT_PLANNING":
      return {
        title: "Staff",
        url: "/staff",
        icon: UserCog,
        hasSubmenu: false,
      };
    default:
      return null;
  }
};

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
    {
      title: "Business Profile",
      url: "/settings/business",
    },
    {
      title: "Subscription",
      url: "/settings/subscription",
    },
  ],
};

// Business-specific navigation links
const businessSpecificNavLinks: Record<BusinessType, NavItem[]> = {
  RETAIL: [
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
    {
      title: "Suppliers",
      url: "/suppliers",
      icon: Truck,
      hasSubmenu: false,
    },
  ],
  RESTAURANT: [
    {
      title: "Tables",
      url: "/tables",
      icon: Utensils,
      hasSubmenu: false,
    },
    {
      title: "Menu Items",
      url: "/menu-items",
      icon: ListOrdered,
      hasSubmenu: false,
    },
    {
      title: "Reservations",
      url: "/reservations",
      icon: Calendar,
      hasSubmenu: false,
    },
    {
      title: "Kitchen Display",
      url: "/kitchen",
      icon: Coffee,
      hasSubmenu: false,
    },
  ],
  HOTEL: [
    {
      title: "Rooms",
      url: "/rooms",
      icon: Bed,
      hasSubmenu: false,
    },
    {
      title: "Bookings",
      url: "/bookings",
      icon: Calendar,
      hasSubmenu: false,
    },
    {
      title: "Guests",
      url: "/guests",
      icon: Users,
      hasSubmenu: false,
    },
    {
      title: "Housekeeping",
      url: "/housekeeping",
      icon: Building,
      hasSubmenu: false,
    },
  ],
  SALON: [
    {
      title: "Appointments",
      url: "/reservations",
      icon: Calendar,
      hasSubmenu: false,
    },
    {
      title: "Services",
      url: "/services",
      icon: ListOrdered,
      hasSubmenu: false,
    },
    {
      title: "Schedule",
      url: "/schedule",
      icon: Calendar,
      hasSubmenu: false,
    },
  ],
  SERVICE: [
    {
      title: "Appointments",
      url: "/reservations",
      icon: Calendar,
      hasSubmenu: false,
    },
    {
      title: "Services",
      url: "/services",
      icon: ListOrdered,
      hasSubmenu: false,
    },
    {
      title: "Schedule",
      url: "/schedule",
      icon: Calendar,
      hasSubmenu: false,
    },
  ],
  PHARMACIE: [
    {
      title: "Medications",
      url: "/medications",
      icon: Pill,
      hasSubmenu: false,
    },
    {
      title: "Prescriptions",
      url: "/prescriptions",
      icon: FileText,
      hasSubmenu: false,
    },
    {
      title: "Suppliers",
      url: "/suppliers",
      icon: Truck,
      hasSubmenu: false,
    },
  ],
  SUPERMARKET: [
    {
      title: "Departments",
      url: "/departments",
      icon: LayoutGrid,
      hasSubmenu: false,
    },
    {
      title: "Promotions",
      url: "/promotions",
      icon: Percent,
      hasSubmenu: false,
    },
    {
      title: "Suppliers",
      url: "/suppliers",
      icon: Truck,
      hasSubmenu: false,
    },
  ],
  BOUTIQUE: [
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
    {
      title: "Suppliers",
      url: "/suppliers",
      icon: Truck,
      hasSubmenu: false,
    },
  ],
  BAKERY: [
    {
      title: "Menu Items",
      url: "/menu-items",
      icon: ListOrdered,
      hasSubmenu: false,
    },
    {
      title: "Production",
      url: "/production",
      icon: Coffee,
      hasSubmenu: false,
    },
    {
      title: "Suppliers",
      url: "/suppliers",
      icon: Truck,
      hasSubmenu: false,
    },
  ],
  BAR: [
    {
      title: "Menu Items",
      url: "/menu-items",
      icon: Wine,
      hasSubmenu: false,
    },
    {
      title: "Tables",
      url: "/tables",
      icon: Utensils,
      hasSubmenu: false,
    },
    {
      title: "Suppliers",
      url: "/suppliers",
      icon: Truck,
      hasSubmenu: false,
    },
  ],
  QUINQUAILLERIE: [
    {
      title: "Categories",
      url: "/categories",
      icon: LayoutGrid,
      hasSubmenu: false,
    },
    {
      title: "Suppliers",
      url: "/suppliers",
      icon: Truck,
      hasSubmenu: false,
    },
  ],
  DEPOT: [
    {
      title: "Suppliers",
      url: "/suppliers",
      icon: Truck,
      hasSubmenu: false,
    },
    {
      title: "Stock Movements",
      url: "/stock-movements",
      icon: Package,
      hasSubmenu: false,
    },
  ],
  CYBERCAFE: [
    {
      title: "Services",
      url: "/services",
      icon: Cpu,
      hasSubmenu: false,
    },
    {
      title: "Appointments",
      url: "/appointments",
      icon: Calendar,
      hasSubmenu: false,
    },
    {
      title: "Workstations",
      url: "/workstations",
      icon: Cpu,
      hasSubmenu: false,
    },
  ],
  TRANSPORTATION: [
    {
      title: "Vehicles",
      url: "/vehicles",
      icon: Truck,
      hasSubmenu: false,
    },
    {
      title: "Bookings",
      url: "/bookings",
      icon: Calendar,
      hasSubmenu: false,
    },
    {
      title: "Routes",
      url: "/routes",
      icon: Car,
      hasSubmenu: false,
    },
    {
      title: "Drivers",
      url: "/drivers",
      icon: Users,
      hasSubmenu: false,
    },
  ],
  CONSTRUCTION: [
    {
      title: "Projects",
      url: "/projects",
      icon: Building,
      hasSubmenu: false,
    },
    {
      title: "Suppliers",
      url: "/suppliers",
      icon: Truck,
      hasSubmenu: false,
    },
    {
      title: "Equipment",
      url: "/equipment",
      icon: Hammer,
      hasSubmenu: false,
    },
  ],
  AGRICULTURE: [
    {
      title: "Crops",
      url: "/crops",
      icon: Leaf,
      hasSubmenu: false,
    },
    {
      title: "Suppliers",
      url: "/suppliers",
      icon: Truck,
      hasSubmenu: false,
    },
    {
      title: "Harvests",
      url: "/harvests",
      icon: Leaf,
      hasSubmenu: false,
    },
  ],
  ELECTRONICS: [
    {
      title: "Services",
      url: "/services",
      icon: Settings,
      hasSubmenu: false,
    },
    {
      title: "Repairs",
      url: "/repairs",
      icon: Cpu,
      hasSubmenu: false,
    },
    {
      title: "Suppliers",
      url: "/suppliers",
      icon: Truck,
      hasSubmenu: false,
    },
  ],
  EDUCATION: [
    {
      title: "Courses",
      url: "/courses",
      icon: GraduationCap,
      hasSubmenu: false,
    },
    {
      title: "Students",
      url: "/students",
      icon: Users,
      hasSubmenu: false,
    },
    {
      title: "Classes",
      url: "/classes",
      icon: BookOpen,
      hasSubmenu: false,
    },
    {
      title: "Schedule",
      url: "/schedule",
      icon: Calendar,
      hasSubmenu: false,
    },
  ],
  EVENT_PLANNING: [
    {
      title: "Events",
      url: "/events",
      icon: PartyPopper,
      hasSubmenu: false,
    },
    {
      title: "Bookings",
      url: "/bookings",
      icon: Calendar,
      hasSubmenu: false,
    },
    {
      title: "Venues",
      url: "/venues",
      icon: Building,
      hasSubmenu: false,
    },
    {
      title: "Suppliers",
      url: "/suppliers",
      icon: Truck,
      hasSubmenu: false,
    },
  ],
  TEXTILE: [
    {
      title: "Categories",
      url: "/categories",
      icon: LayoutGrid,
      hasSubmenu: false,
    },
    {
      title: "Suppliers",
      url: "/suppliers",
      icon: Truck,
      hasSubmenu: false,
    },
    {
      title: "Production",
      url: "/production",
      icon: Shirt,
      hasSubmenu: false,
    },
  ],
  SECURITY: [
    {
      title: "Services",
      url: "/services",
      icon: Shield,
      hasSubmenu: false,
    },
    {
      title: "Assignments",
      url: "/assignments",
      icon: Briefcase,
      hasSubmenu: false,
    },
    {
      title: "Equipment",
      url: "/equipment",
      icon: Shield,
      hasSubmenu: false,
    },
  ],
  AUTOMOTIVE: [
    {
      title: "Services",
      url: "/services",
      icon: Car,
      hasSubmenu: false,
    },
    {
      title: "Repairs",
      url: "/repairs",
      icon: Settings,
      hasSubmenu: false,
    },
    {
      title: "Suppliers",
      url: "/suppliers",
      icon: Truck,
      hasSubmenu: false,
    },
  ],
  OTHER: [
    {
      title: "Categories",
      url: "/categories",
      icon: LayoutGrid,
      hasSubmenu: false,
    },
    {
      title: "Suppliers",
      url: "/suppliers",
      icon: Truck,
      hasSubmenu: false,
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

  // Business types that use "Menu Items" or other specialized product concepts
  // instead of generic "Products"
  const specializedProductTypes = [
    "RESTAURANT",
    "BAKERY",
    "BAR",
    "SALON",
    "SERVICE",
    "PHARMACIE",
    "HOTEL",
    "CONSTRUCTION",
  ];

  // Filter out Products link for business types that use specialized product concepts
  const filteredCommonLinks = specializedProductTypes.includes(businessType)
    ? commonNavLinks.filter((link) => link.title !== "Products")
    : commonNavLinks;

  // Get staff nav item if applicable for this business type
  const staffNavItem = getStaffNavItem(businessType);

  // Get inventory nav item if applicable for this business type
  const inventoryNavItem = getInventoryNavItem(businessType);

  // Get credit system nav item
  const creditNavItem = getCreditNavItem();

  // Combine all links
  const allLinks = [...filteredCommonLinks, ...processedSpecificLinks];

  // Add inventory link if applicable (and not already included in specific links)
  if (
    inventoryNavItem &&
    !specificLinks.some((link) => link.title === "Inventory")
  ) {
    allLinks.push(inventoryNavItem);
  }

  // Add staff link if applicable
  if (staffNavItem) {
    allLinks.push(staffNavItem);
  }

  // Add credit system link
  allLinks.push(creditNavItem);

  // Add settings as the last item
  allLinks.push(settingsNavItem);

  return allLinks;
}
