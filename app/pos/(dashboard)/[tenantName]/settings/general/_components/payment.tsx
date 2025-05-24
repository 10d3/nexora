import { isConnected } from "@/lib/data-utility"
import { getStripeLink } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { CheckCircle2, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function Payment() {
  const { data, isLoading } = useQuery({
    queryKey: ["isConnected"],
    queryFn: async () => {
      return await isConnected()
    },
  })

  const stripeLink = getStripeLink("api/stripe-connect", data?.userId as string)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* <div className="flex items-center gap-2 mb-6">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-medium">Payment Methods</h2>
        </div> */}
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Card key={i} className="border-dashed">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-8 w-20 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* <div className="flex items-center gap-2 mb-6">
        <CreditCard className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-medium">Payment Methods</h2>
      </div> */}

      <div className="space-y-3">
        {/* Stripe Connection */}
        <Card className="group hover:shadow-sm transition-all duration-200">
          <CardContent className="flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {data?.stipeAccountId ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                )}
                <span className="font-medium">Stripe</span>
              </div>
              {data?.stipeAccountId && (
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  Connected
                </Badge>
              )}
            </div>

            <Button
              asChild
              variant={data?.stipeAccountId ? "outline" : "default"}
              size="sm"
              className="group-hover:shadow-sm transition-all"
            >
              <Link href={stripeLink} className="flex items-center gap-2">
                {data?.stipeAccountId ? "Manage" : "Connect"}
                <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* PGPay Connection */}
        <Card className="group hover:shadow-sm transition-all duration-200">
          <CardContent className="flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                <span className="font-medium">PGPay</span>
              </div>
            </div>

            <Button asChild variant="outline" size="sm" className="group-hover:shadow-sm transition-all">
              <Link href="/settings/pgpay" className="flex items-center gap-2">
                Connect
                <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        Connect your payment providers to start accepting payments from customers.
      </p>
    </div>
  )
}
