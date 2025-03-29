"use client";

import { Pill, ClipboardList, AlertTriangle, FileText } from "lucide-react";
// import { DataCard } from "@/components/ui/data-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DataCard } from "../shared/data-card";
import { RadialChart } from "@/components/chart/radial-chart";
import { InteractivePieChart } from "@/components/chart/interactive-pie";
// import { InteractivePieChart } from "@/components/charts/interactive-pie-chart";
// import { RadialChart } from "@/components/charts/radial-chart";

// Sample data
const prescriptionTracking = [
  {
    id: "RX12345",
    patient: "John Smith",
    medication: "Lisinopril 10mg",
    status: "ready",
    date: "Today",
  },
  {
    id: "RX12346",
    patient: "Sarah Johnson",
    medication: "Metformin 500mg",
    status: "processing",
    date: "Today",
  },
  {
    id: "RX12347",
    patient: "Michael Brown",
    medication: "Atorvastatin 20mg",
    status: "pending",
    date: "Today",
  },
  {
    id: "RX12348",
    patient: "Emma Wilson",
    medication: "Levothyroxine 50mcg",
    status: "ready",
    date: "Today",
  },
];

const expiringMedications = [
  { name: "Amoxicillin 500mg", stock: 45, expiry: "30 days", reorder: true },
  { name: "Ibuprofen 200mg", stock: 120, expiry: "45 days", reorder: false },
  { name: "Loratadine 10mg", stock: 30, expiry: "15 days", reorder: true },
  { name: "Omeprazole 20mg", stock: 60, expiry: "60 days", reorder: false },
];

const popularMedications = [
  { name: "Lisinopril", value: 25 },
  { name: "Metformin", value: 20 },
  { name: "Atorvastatin", value: 18 },
  { name: "Levothyroxine", value: 15 },
  { name: "Amlodipine", value: 12 },
];

const insuranceClaimsData = [
  { name: "Pending", value: 15 },
  { name: "Approved", value: 45 },
  { name: "Rejected", value: 5 },
  { name: "Resubmitted", value: 10 },
];

const controlledSubstances = [
  { name: "Oxycodone", schedule: "II", dispensed: 12, remaining: 38 },
  { name: "Adderall", schedule: "II", dispensed: 8, remaining: 22 },
  { name: "Xanax", schedule: "IV", dispensed: 15, remaining: 25 },
  { name: "Ambien", schedule: "IV", dispensed: 10, remaining: 20 },
];

export function PharmacyDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DataCard
          title="Prescriptions Today"
          value="42"
          description="15 waiting for pickup"
          icon={<ClipboardList className="h-4 w-4" />}
        />
        <DataCard
          title="Inventory Items"
          value="1,245"
          description="28 need reordering"
          icon={<Pill className="h-4 w-4" />}
        />
        <DataCard
          title="Expiring Soon"
          value="35"
          description="Within 60 days"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <DataCard
          title="Insurance Claims"
          value="75"
          description="5 rejected"
          icon={<FileText className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Prescription Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rx #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Medication</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescriptionTracking.map((prescription, index) => (
                  <TableRow key={index}>
                    <TableCell>{prescription.id}</TableCell>
                    <TableCell>{prescription.patient}</TableCell>
                    <TableCell>{prescription.medication}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          prescription.status === "ready"
                            ? "default"
                            : prescription.status === "processing"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {prescription.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{prescription.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expiring Medications</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medication</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Expires In</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiringMedications.map((medication, index) => (
                  <TableRow key={index}>
                    <TableCell>{medication.name}</TableCell>
                    <TableCell>{medication.stock}</TableCell>
                    <TableCell>{medication.expiry}</TableCell>
                    <TableCell>
                      {medication.reorder ? (
                        <Badge variant="destructive">Reorder</Badge>
                      ) : (
                        <Badge variant="outline">Monitor</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RadialChart
          title="Popular Medications"
          description="Most frequently dispensed medications"
          data={[
            {
              name: "Medications",
              ...popularMedications.reduce(
                (acc, curr) => ({
                  ...acc,
                  [curr.name.toLowerCase()]: curr.value,
                }),
                {}
              ),
            },
          ]}
          dataKeys={popularMedications.map((med) => med.name.toLowerCase())}
          centerLabel="Prescriptions"
          centerValue={popularMedications.reduce(
            (sum, med) => sum + med.value,
            0
          )}
          isLoading={false}
          error={null}
        />

        <InteractivePieChart
          title="Insurance Claims Status"
          description="Distribution of claim statuses"
          data={insuranceClaimsData}
          isLoading={false}
          error={null}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Controlled Substance Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medication</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Dispensed (30 days)</TableHead>
                <TableHead>Remaining Stock</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {controlledSubstances.map((substance, index) => (
                <TableRow key={index}>
                  <TableCell>{substance.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      Schedule {substance.schedule}
                    </Badge>
                  </TableCell>
                  <TableCell>{substance.dispensed} units</TableCell>
                  <TableCell>{substance.remaining} units</TableCell>
                  <TableCell>
                    <div className="flex w-full items-center gap-2">
                      <Progress
                        value={
                          (substance.remaining /
                            (substance.remaining + substance.dispensed)) *
                          100
                        }
                        className="h-2"
                      />
                      <span className="text-xs text-muted-foreground">
                        {Math.round(
                          (substance.remaining /
                            (substance.remaining + substance.dispensed)) *
                            100
                        )}
                        %
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Medication Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="low">
            <TabsList>
              <TabsTrigger value="low">Low Stock</TabsTrigger>
              <TabsTrigger value="all">All Inventory</TabsTrigger>
              <TabsTrigger value="orders">Pending Orders</TabsTrigger>
            </TabsList>
            <TabsContent value="low" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medication</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Reorder Level</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Lisinopril 10mg</TableCell>
                    <TableCell>15 bottles</TableCell>
                    <TableCell>20 bottles</TableCell>
                    <TableCell>PharmSupply Inc.</TableCell>
                    <TableCell>
                      <Badge variant="destructive">Reorder</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Metformin 500mg</TableCell>
                    <TableCell>12 bottles</TableCell>
                    <TableCell>25 bottles</TableCell>
                    <TableCell>MediSource</TableCell>
                    <TableCell>
                      <Badge variant="destructive">Reorder</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Amoxicillin 250mg</TableCell>
                    <TableCell>18 bottles</TableCell>
                    <TableCell>20 bottles</TableCell>
                    <TableCell>PharmSupply Inc.</TableCell>
                    <TableCell>
                      <Badge variant="outline">Monitor</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="all">
              <p className="text-sm text-muted-foreground">
                Full inventory list will appear here.
              </p>
            </TabsContent>
            <TabsContent value="orders">
              <p className="text-sm text-muted-foreground">
                Pending orders will appear here.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
