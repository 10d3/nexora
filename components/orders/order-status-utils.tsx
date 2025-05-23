import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Package, Truck, XCircle } from "lucide-react";

export function getStatusBadge(status: string) {
  const statusMap: Record<
    string,
    {
      label: string;
      variant: "default" | "outline" | "secondary" | "destructive";
    }
  > = {
    PENDING: { label: "Pending", variant: "outline" },
    IN_PROGRESS: { label: "Processing", variant: "secondary" },
    READY_FOR_PICKUP: { label: "Ready for Pickup", variant: "default" },
    DELIVERED: { label: "Delivered", variant: "default" },
    CANCELLED: { label: "Cancelled", variant: "destructive" },
    REFUNDED: { label: "Refunded", variant: "outline" },
  };

  const statusInfo = statusMap[status] || { label: status, variant: "outline" };
  return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
}

export function getPaymentStatusBadge(status: string) {
  const statusMap: Record<
    string,
    {
      label: string;
      variant: "default" | "outline" | "secondary" | "destructive";
    }
  > = {
    PAID: { label: "Paid", variant: "default" },
    PENDING: { label: "Pending", variant: "outline" },
    FAILED: { label: "Failed", variant: "destructive" },
    REFUNDED: { label: "Refunded", variant: "outline" },
  };

  const statusInfo = statusMap[status] || { label: status, variant: "outline" };
  return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
}

export function getStatusIcon(status: string) {
  const statusMap: Record<string, React.ReactNode> = {
    PENDING: <Clock className="h-4 w-4 text-muted-foreground" />,
    IN_PROGRESS: <Package className="h-4 w-4 text-blue-500" />,
    READY_FOR_PICKUP: <Truck className="h-4 w-4 text-yellow-500" />,
    DELIVERED: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    CANCELLED: <XCircle className="h-4 w-4 text-red-500" />,
    REFUNDED: <XCircle className="h-4 w-4 text-red-500" />,
  };

  return statusMap[status] || <Clock className="h-4 w-4 text-muted-foreground" />;
}

export function useOrderStatusUtils() {
  return {
    getStatusBadge,
    getPaymentStatusBadge,
    getStatusIcon,
  };
} 