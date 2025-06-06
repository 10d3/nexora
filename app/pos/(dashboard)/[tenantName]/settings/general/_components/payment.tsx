"use client"

import { isConnected } from "@/lib/data-utility"
import { getStripeLink } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { CheckCircle2, ExternalLink, Key } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function Payment() {
  const { data, isLoading } = useQuery({
    queryKey: ["isConnected"],
    queryFn: async () => {
      return await isConnected()
    },
  })

  const stripeLink = getStripeLink("api/stripe-connect", data?.userId as string)
  // const pgpayLink = `/api/pgpay-connect?userId=${data?.userId}`

  const pgpayFormSchema = z.object({
    apiKey: z.string().min(1, "API key is required"),
  })

  type PgpayFormValues = z.infer<typeof pgpayFormSchema>

  const form = useForm<PgpayFormValues>({
    resolver: zodResolver(pgpayFormSchema),
    defaultValues: {
      apiKey: "",
    },
  })

  const [isEditingPgpay, setIsEditingPgpay] = useState(false)

  const onSubmit = async (values: PgpayFormValues) => {
    try {
      const response = await fetch("/api/pgpay/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey: values.apiKey, userId: data?.userId }),
      })

      if (!response.ok) {
        throw new Error("Failed to save API key")
      }

      toast.success(data?.pgpayConnected ? "PGPay API key updated successfully" : "PGPay API key saved successfully")
      form.reset()
      setIsEditingPgpay(false)
    } catch (error) {
      toast.error("Failed to save PGPay API key")
      console.error(error)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
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
    <div className="space-y-2">
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
          <CardContent className="px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {data?.pgpayConnected ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Key className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="font-medium">PGPay</span>
                </div>
                {data?.pgpayConnected && !isEditingPgpay && (
                  <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                    Connected
                  </Badge>
                )}
              </div>

              {data?.pgpayConnected && !isEditingPgpay && (
                <Button
                  variant="outline"
                  size="sm"
                  className="group-hover:shadow-sm transition-all"
                  onClick={() => setIsEditingPgpay(true)}
                >
                  Manage
                </Button>
              )}
            </div>

            {(!data?.pgpayConnected || isEditingPgpay) && (
              <Form {...form}>
                <div className="flex gap-2 mt-4">
                  <FormField
                    control={form.control}
                    name="apiKey"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            type="password"
                            placeholder={data?.pgpayConnected ? "Enter new API Key" : "Enter PGPay API Key"}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={form.handleSubmit(onSubmit)}
                      disabled={form.formState.isSubmitting}
                      variant="default"
                      size="sm"
                    >
                      {form.formState.isSubmitting ? "Saving..." : data?.pgpayConnected ? "Update" : "Connect"}
                    </Button>
                    {isEditingPgpay && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditingPgpay(false)
                          form.reset()
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        Connect your payment providers to start accepting payments from customers.
      </p>
    </div>
  )
}
