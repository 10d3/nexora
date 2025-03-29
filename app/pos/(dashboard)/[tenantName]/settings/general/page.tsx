/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Loader2,
  Upload,
  Building,
  Clock,
  Palette,
  Settings,
  Globe,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ModeToggle } from "@/components/shared/toggle-theme";
import { ThemeColorToggle } from "@/components/shared/color-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Define the form schema
const formSchema = z.object({
  currency: z.string(),
  taxRate: z.coerce.number().min(0).max(100),
  storeName: z.string().min(1, "Store name is required"),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  logoUrl: z.string().optional(),
  businessHours: z.object({
    monday: z.object({
      open: z.string().optional(),
      close: z.string().optional(),
      isOpen: z.boolean().default(true),
    }),
    tuesday: z.object({
      open: z.string().optional(),
      close: z.string().optional(),
      isOpen: z.boolean().default(true),
    }),
    wednesday: z.object({
      open: z.string().optional(),
      close: z.string().optional(),
      isOpen: z.boolean().default(true),
    }),
    thursday: z.object({
      open: z.string().optional(),
      close: z.string().optional(),
      isOpen: z.boolean().default(true),
    }),
    friday: z.object({
      open: z.string().optional(),
      close: z.string().optional(),
      isOpen: z.boolean().default(true),
    }),
    saturday: z.object({
      open: z.string().optional(),
      close: z.string().optional(),
      isOpen: z.boolean().default(true),
    }),
    sunday: z.object({
      open: z.string().optional(),
      close: z.string().optional(),
      isOpen: z.boolean().default(true),
    }),
  }),
  tableManagement: z.boolean().optional(),
  roomManagement: z.boolean().optional(),
  appointmentSystem: z.boolean().optional(),
  // Site settings
  siteName: z.string().optional(),
  subdomain: z.string().optional(),
  customDomain: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Server actions (imported)
import { getSettings, updateSettings } from "@/lib/actions/settings.actions";
import { getSite, updateSite } from "@/lib/actions/site.actions";
import { useDashboard } from "@/context/dashboard-provider";

export default function GeneralSettingsPage() {
  const [activeTab, setActiveTab] = useState("business");
  const queryClient = useQueryClient();
  const { tenantId } = useDashboard();

  // Fetch settings with Tanstack Query
  const { data: settingsData, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      return await getSettings(tenantId as string);
    },
  });

  // Fetch site data with Tanstack Query
  const { data: siteData, isLoading: isLoadingSite } = useQuery({
    queryKey: ["site"],
    queryFn: async () => {
      return await getSite(tenantId as string);
    },
  });

  // Parse business hours from settings data
  const businessHours = settingsData?.businessHours
    ? typeof settingsData.businessHours === "string"
      ? JSON.parse(settingsData.businessHours)
      : settingsData.businessHours
    : {
        monday: { open: "09:00", close: "17:00", isOpen: true },
        tuesday: { open: "09:00", close: "17:00", isOpen: true },
        wednesday: { open: "09:00", close: "17:00", isOpen: true },
        thursday: { open: "09:00", close: "17:00", isOpen: true },
        friday: { open: "09:00", close: "17:00", isOpen: true },
        saturday: { open: "09:00", close: "17:00", isOpen: true },
        sunday: { open: "09:00", close: "17:00", isOpen: false },
      };

  // Initialize form with data from queries
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currency: settingsData?.currency || "USD",
      taxRate: settingsData?.taxRate || 0,
      storeName: settingsData?.storeName || "",
      address: settingsData?.address || "",
      phoneNumber: settingsData?.phoneNumber || "",
      email: settingsData?.email || "",
      logoUrl: settingsData?.logoUrl || "",
      businessHours: businessHours,
      tableManagement: settingsData?.tableManagement || false,
      roomManagement: settingsData?.roomManagement || false,
      appointmentSystem: settingsData?.appointmentSystem || false,
      siteName: siteData?.name || "",
      subdomain: siteData?.subdomain || "",
      customDomain: siteData?.customDomain || "",
    },
    values: {
      currency: settingsData?.currency || "USD",
      taxRate: settingsData?.taxRate || 0,
      storeName: settingsData?.storeName || "",
      address: settingsData?.address || "",
      phoneNumber: settingsData?.phoneNumber || "",
      email: settingsData?.email || "",
      logoUrl: settingsData?.logoUrl || "",
      businessHours: businessHours,
      tableManagement: settingsData?.tableManagement || false,
      roomManagement: settingsData?.roomManagement || false,
      appointmentSystem: settingsData?.appointmentSystem || false,
      siteName: siteData?.name || "",
      subdomain: siteData?.subdomain || "",
      customDomain: siteData?.customDomain || "",
    },
  });

  // Update settings mutation
  const settingsMutation = useMutation({
    mutationFn: async (settingsData: any) => {
      return await updateSettings(settingsData, tenantId as string);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  // Update site mutation
  const siteMutation = useMutation({
    mutationFn: async (siteData: any) => {
      return await updateSite(siteData, tenantId as string);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site"] });
    },
  });

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      // Extract site-specific values
      const { siteName, subdomain, customDomain, ...settingsValues } = values;

      // Convert businessHours to JSON string for storage
      const formattedSettingsValues = {
        ...settingsValues,
        businessHours: JSON.stringify(settingsValues.businessHours),
      };

      // Update settings using mutation
      await settingsMutation.mutateAsync(formattedSettingsValues);

      // Update site using mutation
      await siteMutation.mutateAsync({
        name: siteName,
        subdomain,
        customDomain,
      });

      toast.success("Settings updated successfully");
    } catch (error) {
      console.error("Failed to update settings:", error);
      toast.error("Failed to update settings");
    }
  };

  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const isLoading =
    isLoadingSettings ||
    isLoadingSite ||
    settingsMutation.isPending ||
    siteMutation.isPending;

  return (
    <div className="container mx-auto pb-10">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            General Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your business settings and preferences
          </p>
        </div>
        <Button
          type="submit"
          form="settings-form"
          disabled={isLoading}
          className="self-start md:self-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
        <Tabs
          defaultValue="business"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
                    <div className="flex flex-col sm:flex-row">
            <TabsList className="h-auto flex-col items-stretch p-0 bg-transparent sm:w-60 sm:border-r w-full">
              <TabsTrigger
                value="business"
                className="justify-start w-full gap-2 rounded-none border-b sm:border-b-0 sm:border-r-2 data-[state=active]:border-primary px-4 py-3"
              >
                <Building className="h-5 w-5" />
                <span>Business Information</span>
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="justify-start w-full gap-2 rounded-none border-b sm:border-b-0 sm:border-r-2 data-[state=active]:border-primary px-4 py-3"
              >
                <Palette className="h-5 w-5" />
                <span>Appearance</span>
              </TabsTrigger>
              <TabsTrigger
                value="hours"
                className="justify-start w-full gap-2 rounded-none border-b sm:border-b-0 sm:border-r-2 data-[state=active]:border-primary px-4 py-3"
              >
                <Clock className="h-5 w-5" />
                <span>Business Hours</span>
              </TabsTrigger>
              <TabsTrigger
                value="features"
                className="justify-start w-full gap-2 rounded-none border-b sm:border-b-0 sm:border-r-2 data-[state=active]:border-primary px-4 py-3"
              >
                <Settings className="h-5 w-5" />
                <span>Features</span>
              </TabsTrigger>
              <TabsTrigger
                value="site"
                className="justify-start w-full gap-2 rounded-none sm:border-r-2 data-[state=active]:border-primary px-4 py-3"
              >
                <Globe className="h-5 w-5" />
                <span>Site Settings</span>
              </TabsTrigger>
            </TabsList>

            <Form {...form}>
              <form
                id="settings-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex-1"
              >
                <TabsContent value="business" className="p-6 m-0">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold">
                        Business Information
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Update your business details and contact information
                      </p>
                    </div>
                    <Separator />

                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="md:w-1/3 flex flex-col items-center">
                        <div className="relative group">
                          <Avatar className="h-32 w-32 border-2 border-border">
                            <AvatarImage
                              src={form.watch("logoUrl") || ""}
                              alt="Business logo"
                            />
                            <AvatarFallback className="text-3xl">
                              {form.watch("storeName")?.charAt(0) || "B"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-white"
                            >
                              <Upload className="h-6 w-6" />
                            </Button>
                          </div>
                        </div>
                        <FormField
                          control={form.control}
                          name="logoUrl"
                          render={({ field }) => (
                            <FormItem className="w-full mt-4">
                              <FormControl>
                                <Input
                                  placeholder="Logo URL"
                                  {...field}
                                  className="text-center"
                                />
                              </FormControl>
                              <FormDescription className="text-center">
                                Enter a URL for your business logo
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="md:w-2/3 space-y-6">
                        <FormField
                          control={form.control}
                          name="storeName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Your Business Name"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="123 Business St, City, Country"
                                  {...field}
                                  className="resize-none"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="+1 234 567 8900"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="contact@yourbusiness.com"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="currency"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Currency</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select currency" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="USD">USD ($)</SelectItem>
                                    <SelectItem value="EUR">EUR (€)</SelectItem>
                                    <SelectItem value="GBP">GBP (£)</SelectItem>
                                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                                    <SelectItem value="CAD">
                                      CAD (C$)
                                    </SelectItem>
                                    <SelectItem value="AUD">
                                      AUD (A$)
                                    </SelectItem>
                                    <SelectItem value="CNY">CNY (¥)</SelectItem>
                                    <SelectItem value="INR">INR (₹)</SelectItem>
                                    <SelectItem value="XOF">
                                      XOF (CFA)
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="taxRate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tax Rate (%)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="appearance" className="p-6 m-0">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold">
                        Appearance Settings
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Customize the look and feel of your application
                      </p>
                    </div>
                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <Card className="border-2 hover:border-primary/50 transition-colors">
                        <CardHeader>
                          <CardTitle>Theme Mode</CardTitle>
                          <CardDescription>
                            Choose between light, dark, or system theme
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ModeToggle />
                        </CardContent>
                      </Card>

                      <Card className="border-2 hover:border-primary/50 transition-colors">
                        <CardHeader>
                          <CardTitle>Theme Color</CardTitle>
                          <CardDescription>
                            Select a color scheme for your application
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ThemeColorToggle />
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="hours" className="p-6 m-0">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold">Business Hours</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Set your regular business operating hours
                      </p>
                    </div>
                    <Separator />

                    <div className="space-y-6">
                      <Card>
                        <CardContent className="p-6">
                          <div className="space-y-6">
                            {days.map((day, index) => (
                              <div key={day}>
                                <div className="grid grid-cols-12 gap-4 items-center">
                                  <div className="col-span-12 sm:col-span-2 capitalize font-medium text-lg">
                                    {day}
                                  </div>
                                  <div className="col-span-12 sm:col-span-2">
                                    <FormField
                                      control={form.control}
                                      name={
                                        `businessHours.${day}.isOpen` as any
                                      }
                                      render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2">
                                          <FormControl>
                                            <Switch
                                              checked={field.value}
                                              onCheckedChange={field.onChange}
                                            />
                                          </FormControl>
                                          <FormLabel className="m-0 font-medium">
                                            {field.value ? "Open" : "Closed"}
                                          </FormLabel>
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  <div className="col-span-6 sm:col-span-4">
                                    <FormField
                                      control={form.control}
                                      name={`businessHours.${day}.open` as any}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Opening Time</FormLabel>
                                          <FormControl>
                                            <Input
                                              type="time"
                                              {...field}
                                              disabled={
                                                !form.watch(
                                                  `businessHours.${day}.isOpen` as any
                                                )
                                              }
                                              className={
                                                !form.watch(
                                                  `businessHours.${day}.isOpen` as any
                                                )
                                                  ? "opacity-50"
                                                  : ""
                                              }
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  <div className="col-span-6 sm:col-span-4">
                                    <FormField
                                      control={form.control}
                                      name={`businessHours.${day}.close` as any}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Closing Time</FormLabel>
                                          <FormControl>
                                            <Input
                                              type="time"
                                              {...field}
                                              disabled={
                                                !form.watch(
                                                  `businessHours.${day}.isOpen` as any
                                                )
                                              }
                                              className={
                                                !form.watch(
                                                  `businessHours.${day}.isOpen` as any
                                                )
                                                  ? "opacity-50"
                                                  : ""
                                              }
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                </div>
                                {index < days.length - 1 && (
                                  <Separator className="my-4" />
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="features" className="p-6 m-0">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold">
                        Business Features
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Enable or disable specific features for your business
                      </p>
                    </div>
                    <Separator />

                    <div className="grid gap-4">
                      <FormField
                        control={form.control}
                        name="tableManagement"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4 hover:border-primary/50 transition-colors">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base font-medium">
                                Table Management
                              </FormLabel>
                              <FormDescription>
                                Enable table management for restaurants
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="roomManagement"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4 hover:border-primary/50 transition-colors">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base font-medium">
                                Room Management
                              </FormLabel>
                              <FormDescription>
                                Enable room management for hotels
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="appointmentSystem"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4 hover:border-primary/50 transition-colors">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base font-medium">
                                Appointment System
                              </FormLabel>
                              <FormDescription>
                                Enable appointment scheduling for services and
                                salons
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="site" className="p-6 m-0">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold">Site Settings</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Configure your site name and domain settings
                      </p>
                    </div>
                    <Separator />

                    <Card>
                      <CardContent className="p-6 space-y-6">
                        <FormField
                          control={form.control}
                          name="siteName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Site Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="My Business Site"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                The name of your site displayed to visitors
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="subdomain"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subdomain</FormLabel>
                              <div className="flex items-center">
                                <FormControl>
                                  <Input placeholder="mybusiness" {...field} />
                                </FormControl>
                                <span className="ml-2 text-muted-foreground whitespace-nowrap">
                                  .nexora.app
                                </span>
                              </div>
                              <FormDescription>
                                Your custom subdomain for accessing your
                                business
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="customDomain"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Custom Domain</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="www.mybusiness.com"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Your own domain name (requires DNS
                                configuration)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </form>
            </Form>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
