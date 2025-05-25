"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { QRCodeSVG } from "qrcode.react"
import { CreditCard, Wallet, Banknote, ArrowRight, Receipt, CreditCard as CreditIcon } from "lucide-react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  total: number
}

interface PaymentSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  amount: number
  orderId: string
  items: OrderItem[]
  onPaymentComplete: (paymentType: string, amount: number, change: number) => void
  customerCreditLimit?: number
  customerCreditBalance?: number
}

type PaymentMethod = "stripe" | "moncash" | "cash" | "credit"

export function PaymentSheet({ 
  open, 
  onOpenChange, 
  amount, 
  orderId, 
  items, 
  onPaymentComplete,
  customerCreditLimit = 0,
  customerCreditBalance = 0 
}: PaymentSheetProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("cash")
  const [paymentLink, setPaymentLink] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [cashAmount, setCashAmount] = useState("")
  const isOnline = useOnlineStatus()

  // Reset state when sheet opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedMethod("cash")
      setPaymentLink("")
      setCashAmount("")
    }
  }, [open])

  // Calculate change
  const calculateChange = () => {
    const paid = Number.parseFloat(cashAmount) || 0
    return Math.max(0, paid - amount)
  }

  // Handle keyboard input
  const handleKeyboardInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const value = e.key

    // Allow numbers, decimal point, and backspace
    if (/^[0-9.]$/.test(value)) {
      e.preventDefault()
      const newValue = cashAmount + value
      if (newValue.length <= 10) {
        // Prevent too long numbers
        setCashAmount(newValue)
      }
    } else if (value === "Backspace") {
      e.preventDefault()
      setCashAmount((prev) => prev.slice(0, -1))
    } else if (value === "Delete") {
      e.preventDefault()
      setCashAmount("")
    }
  }

  // Handle payment method selection
  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setSelectedMethod(method)
    if (method !== "cash") {
      generatePaymentLink(method)
    }
  }

  // Generate payment link for online payment methods
  const generatePaymentLink = async (method: PaymentMethod) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/payments/generate-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method,
          amount,
          orderId,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setPaymentLink(data.paymentLink)
      } else {
        throw new Error(data.error || "Failed to generate payment link")
      }
    } catch (error) {
      toast.error("Error generating payment link")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle payment completion
  const handlePaymentComplete = async () => {
    if (selectedMethod === "cash") {
      const paid = Number.parseFloat(cashAmount) || 0
      if (paid < amount) {
        toast.error("Insufficient amount")
        return
      }
      onPaymentComplete("cash", paid, calculateChange())
      onOpenChange(false)
      return
    }

    if (selectedMethod === "credit") {
      const availableCredit = customerCreditLimit - customerCreditBalance
      if (amount > availableCredit) {
        toast.error("Insufficient credit limit")
        return
      }
      onPaymentComplete("credit", amount, 0)
      onOpenChange(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/payments/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: selectedMethod,
          amount,
          orderId,
        }),
      })

      const data = await response.json()
      if (data.success) {
        onPaymentComplete(selectedMethod, amount, 0)
        onOpenChange(false)
      } else {
        throw new Error(data.error || "Payment failed")
      }
    } catch (error) {
      toast.error("Payment failed")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="py-6 px-0 border-b">
            <SheetHeader>
              <SheetTitle className="text-left text-2xl font-medium">Payment</SheetTitle>
            </SheetHeader>

            {/* Payment Summary Card */}
            <div className="mt-6">
              <div className="flex justify-between items-center px-4">
                <span className="text-sm text-muted-foreground">Amount Due</span>
                <span className="text-2xl font-medium">{formatCurrency(amount)}</span>
              </div>

              {selectedMethod === "cash" && cashAmount && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount Received</span>
                    <span>{formatCurrency(Number.parseFloat(cashAmount) || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Change</span>
                    <span>{formatCurrency(calculateChange())}</span>
                  </div>
                </div>
              )}

              {selectedMethod === "credit" && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Available Credit</span>
                    <span>{formatCurrency(customerCreditLimit - customerCreditBalance)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* Order Items */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium">Order Summary</h3>
              </div>
              <div className="border rounded-md p-3 space-y-2 max-h-[220px] overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="flex-1">
                      <span className="font-medium">{item.quantity}x</span> {item.name}
                    </span>
                    <span>{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-4 mb-6">
              <Label className="text-sm font-medium">Payment Method</Label>
              <RadioGroup
                value={selectedMethod}
                onValueChange={(value) => handlePaymentMethodChange(value as PaymentMethod)}
                className="grid grid-cols-4 gap-2"
              >
                {isOnline && (
                  <>
                    <div
                      className={cn(
                        "border rounded-md transition-all",
                        selectedMethod === "stripe" ? "border-black" : "border-input",
                      )}
                    >
                      <Label
                        htmlFor="stripe"
                        className="flex flex-col items-center justify-center p-3 h-full cursor-pointer text-center"
                      >
                        <RadioGroupItem value="stripe" id="stripe" className="sr-only" />
                        <CreditCard className="h-5 w-5 mb-1" />
                        <span className="text-sm font-medium">Card</span>
                      </Label>
                    </div>

                    <div
                      className={cn(
                        "border rounded-md transition-all",
                        selectedMethod === "moncash" ? "border-black" : "border-input",
                      )}
                    >
                      <Label
                        htmlFor="moncash"
                        className="flex flex-col items-center justify-center p-3 h-full cursor-pointer text-center"
                      >
                        <RadioGroupItem value="moncash" id="moncash" className="sr-only" />
                        <Wallet className="h-5 w-5 mb-1" />
                        <span className="text-sm font-medium">Mobile</span>
                      </Label>
                    </div>
                  </>
                )}

                <div
                  className={cn(
                    "border rounded-md transition-all",
                    selectedMethod === "credit" ? "border-black" : "border-input",
                  )}
                >
                  <Label
                    htmlFor="credit"
                    className="flex flex-col items-center justify-center p-3 h-full cursor-pointer text-center"
                  >
                    <RadioGroupItem value="credit" id="credit" className="sr-only" />
                    <CreditIcon className="h-5 w-5 mb-1" />
                    <span className="text-sm font-medium">Credit</span>
                  </Label>
                </div>

                <div
                  className={cn(
                    "border rounded-md transition-all",
                    selectedMethod === "cash" ? "border-black" : "border-input",
                  )}
                >
                  <Label
                    htmlFor="cash"
                    className="flex flex-col items-center justify-center p-3 h-full cursor-pointer text-center"
                  >
                    <RadioGroupItem value="cash" id="cash" className="sr-only" />
                    <Banknote className="h-5 w-5 mb-1" />
                    <span className="text-sm font-medium">Cash</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Cash Payment Input */}
            {selectedMethod === "cash" && (
              <div className="space-y-3 mb-6">
                <Label className="text-sm font-medium">Amount Received</Label>
                <div className="relative">
                  <Input
                    type="text"
                    value={cashAmount}
                    onKeyDown={handleKeyboardInput}
                    onChange={(e) => {
                      // Only allow numbers and decimal point
                      const value = e.target.value.replace(/[^0-9.]/g, "")
                      setCashAmount(value)
                    }}
                    placeholder="0.00"
                    className="text-right pr-12 text-lg h-12 rounded-md"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</div>
                </div>

                {/* Quick amount buttons */}
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[amount, amount + 5, amount + 10].map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      type="button"
                      variant="outline"
                      onClick={() => setCashAmount(quickAmount.toString())}
                      className="text-sm"
                    >
                      {formatCurrency(quickAmount)}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* QR Code for Online Payments */}
            {selectedMethod !== "cash" && paymentLink && (
              <div className="space-y-4 flex flex-col items-center">
                <div className="border p-4 rounded-md">
                  <QRCodeSVG value={paymentLink} size={200} />
                </div>
                <p className="text-sm text-center text-muted-foreground max-w-xs">
                  Scan the QR code to complete your payment
                </p>
              </div>
            )}
          </div>

          <SheetFooter className="px-6 py-4 border-t">
            <Button
              onClick={handlePaymentComplete}
              disabled={
                isLoading || (selectedMethod === "cash" && (!cashAmount || Number.parseFloat(cashAmount) < amount))
              }
              className="w-full h-12 rounded-md"
            >
              {isLoading ? (
                "Processing..."
              ) : (
                <span className="flex items-center gap-2">
                  Complete Payment <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
