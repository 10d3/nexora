// "use client"

// import { Users, Calendar, BookOpen, FileCheck } from "lucide-react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Badge } from "@/components/ui/badge"
// import { Progress } from "@/components/ui/progress"
// import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// import {
//   Chart,
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
//   ChartTooltipItem,
//   ChartTooltipLabel,
//   ChartTooltipValue,
// } from "@/components/ui/chart"
// import { Bar } from "recharts"
// import { DataCard } from "../shared/data-card"

// // Sample data
// const classSchedule = [
//   { time: "9:00 AM", class: "Mathematics 101", teacher: "Dr. Smith", room: "A101", students: 25 },
//   { time: "10:30 AM", class: "Physics 202", teacher: "Prof. Johnson", room: "B205", students: 18 },
//   { time: "1:00 PM", class: "English Literature", teacher: "Ms. Wilson", room: "C103", students: 30 },
//   { time: "2:30 PM", class: "Computer Science", teacher: "Dr. Brown", room: "Lab 3", students: 22 },
// ]

// const studentAttendance = [
//   { name: "Mathematics", present: 85, absent: 15 },
//   { name: "Physics", present: 78, absent: 22 },
//   { name: "English", present: 90, absent: 10 },
//   { name: "Computer Science", present: 82, absent: 18 },
//   { name: "History", present: 75, absent: 25 },
// ]

// const courseEnrollment = [
//   { name: "Mathematics", value: 120 },
//   { name: "Physics", value: 85 },
//   { name: "English", value: 150 },
//   { name: "Computer Science", value: 95 },
//   { name: "History", value: 75 },
// ]

// const teacherPerformance = [
//   { name: "Dr. Smith", rating: 4.8, classes: 3, students: 75, feedback: "Excellent" },
//   { name: "Prof. Johnson", rating: 4.5, classes: 4, students: 90, feedback: "Very Good" },
//   { name: "Ms. Wilson", rating: 4.7, classes: 3, students: 85, feedback: "Excellent" },
//   { name: "Dr. Brown", rating: 4.3, classes: 5, students: 110, feedback: "Good" },
// ]

// const assignmentTracking = [
//   { course: "Mathematics 101", title: "Calculus Homework", due: "Nov 15, 2023", submitted: 18, total: 25 },
//   { course: "Physics 202", title: "Lab Report", due: "Nov 10, 2023", submitted: 15, total: 18 },
//   { course: "English Literature", title: "Essay", due: "Nov 20, 2023", submitted: 12, total: 30 },
//   { course: "Computer Science", title: "Programming Project", due: "Nov 25, 2023", submitted: 8, total: 22 },
// ]

// const feeCollection = [
//   { student: "John Smith", id: "ST001", amount: "$1,500", status: "paid", date: "Sep 5, 2023" },
//   { student: "Sarah Johnson", id: "ST002", amount: "$1,500", status: "partial", date: "Sep 8, 2023" },
//   { student: "Michael Brown", id: "ST003", amount: "$1,500", status: "pending", date: "-" },
//   { student: "Emma Wilson", id: "ST004", amount: "$1,500", status: "paid", date: "Sep 3, 2023" },
// ]

// export function EducationDashboard() {
//   return (
//     <div className="space-y-6">
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//         <DataCard
//           title="Total Students"
//           value="450"
//           description="↑ 5% from last semester"
//           icon={<Users className="h-4 w-4" />}
//         />
//         <DataCard
//           title="Classes Today"
//           value="24"
//           description="4 labs, 20 lectures"
//           icon={<BookOpen className="h-4 w-4" />}
//         />
//         <DataCard
//           title="Average Attendance"
//           value="85%"
//           description="↑ 3% from last month"
//           icon={<Calendar className="h-4 w-4" />}
//         />
//         <DataCard title="Assignments Due" value="15" description="This week" icon={<FileCheck className="h-4 w-4" />} />
//       </div>

//       <div className="grid gap-4 md:grid-cols-2">
//         <Card>
//           <CardHeader>
//             <CardTitle>Class Schedule</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <Tabs defaultValue="today">
//               <TabsList>
//                 <TabsTrigger value="today">Today</TabsTrigger>
//                 <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
//                 <TabsTrigger value="week">This Week</TabsTrigger>
//               </TabsList>
//               <TabsContent value="today" className="space-y-4">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Time</TableHead>
//                       <TableHead>Class</TableHead>
//                       <TableHead>Teacher</TableHead>
//                       <TableHead>Room</TableHead>
//                       <TableHead>Students</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {classSchedule.map((schedule, index) => (
//                       <TableRow key={index}>
//                         <TableCell>{schedule.time}</TableCell>
//                         <TableCell>{schedule.class}</TableCell>
//                         <TableCell>{schedule.teacher}</TableCell>
//                         <TableCell>{schedule.room}</TableCell>
//                         <TableCell>{schedule.students}</TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </TabsContent>
//               <TabsContent value="tomorrow">
//                 <p className="text-sm text-muted-foreground">Schedule for tomorrow will appear here.</p>
//               </TabsContent>
//               <TabsContent value="week">
//                 <p className="text-sm text-muted-foreground">Schedule for this week will appear here.</p>
//               </TabsContent>
//             </Tabs>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Student Attendance</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ChartContainer className="h-[300px]">
//               <Chart>
//                 <Bar dataKey="present" data={studentAttendance} fill="hsl(var(--primary))" radius={4} name="Present" />
//                 <Bar
//                   dataKey="absent"
//                   data={studentAttendance}
//                   fill="hsl(var(--destructive))"
//                   radius={4}
//                   name="Absent"
//                 />
//               </Chart>
//               <ChartTooltip>
//                 <ChartTooltipContent>
//                   <ChartTooltipItem>
//                     <ChartTooltipLabel />: <ChartTooltipValue />%
//                   </ChartTooltipItem>
//                 </ChartTooltipContent>
//               </ChartTooltip>
//             </ChartContainer>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="grid gap-4 md:grid-cols-2">
//         <Card>
//           <CardHeader>
//             <CardTitle>Course Enrollment</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ChartContainer className="h-[300px]">
//               <Chart>
//                 <Bar dataKey="value" data={courseEnrollment} fill="hsl(var(--primary))" radius={4} />
//               </Chart>
//               <ChartTooltip>
//                 <ChartTooltipContent>
//                   <ChartTooltipItem>
//                     <ChartTooltipLabel />: <ChartTooltipValue /> students
//                   </ChartTooltipItem>
//                 </ChartTooltipContent>
//               </ChartTooltip>
//             </ChartContainer>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Teacher Performance</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Teacher</TableHead>
//                   <TableHead>Rating</TableHead>
//                   <TableHead>Classes</TableHead>
//                   <TableHead>Students</TableHead>
//                   <TableHead>Feedback</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {teacherPerformance.map((teacher, index) => (
//                   <TableRow key={index}>
//                     <TableCell>
//                       <div className="flex items-center gap-2">
//                         <Avatar className="h-8 w-8">
//                           <AvatarFallback>{teacher.name[0]}</AvatarFallback>
//                         </Avatar>
//                         {teacher.name}
//                       </div>
//                     </TableCell>
//                     <TableCell>{teacher.rating}/5.0</TableCell>
//                     <TableCell>{teacher.classes}</TableCell>
//                     <TableCell>{teacher.students}</TableCell>
//                     <TableCell>
//                       <Badge
//                         variant={
//                           teacher.feedback === "Excellent"
//                             ? "default"
//                             : teacher.feedback === "Very Good"
//                               ? "secondary"
//                               : "outline"
//                         }
//                       >
//                         {teacher.feedback}
//                       </Badge>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="grid gap-4 md:grid-cols-2">
//         <Card>
//           <CardHeader>
//             <CardTitle>Assignment Tracking</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Course</TableHead>
//                   <TableHead>Assignment</TableHead>
//                   <TableHead>Due Date</TableHead>
//                   <TableHead>Submission</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {assignmentTracking.map((assignment, index) => (
//                   <TableRow key={index}>
//                     <TableCell>{assignment.course}</TableCell>
//                     <TableCell>{assignment.title}</TableCell>
//                     <TableCell>{assignment.due}</TableCell>
//                     <TableCell>
//                       <div className="flex w-full items-center gap-2">
//                         <Progress value={(assignment.submitted / assignment.total) * 100} className="h-2" />
//                         <span className="text-xs text-muted-foreground">
//                           {assignment.submitted}/{assignment.total}
//                         </span>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Fee Collection Status</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Student</TableHead>
//                   <TableHead>ID</TableHead>
//                   <TableHead>Amount</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead>Payment Date</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {feeCollection.map((fee, index) => (
//                   <TableRow key={index}>
//                     <TableCell>{fee.student}</TableCell>
//                     <TableCell>{fee.id}</TableCell>
//                     <TableCell>{fee.amount}</TableCell>
//                     <TableCell>
//                       <Badge
//                         variant={fee.status === "paid" ? "default" : fee.status === "partial" ? "secondary" : "outline"}
//                       >
//                         {fee.status}
//                       </Badge>
//                     </TableCell>
//                     <TableCell>{fee.date}</TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }


import React from 'react'

export default function EducationDashboard() {
  return (
    <div>Education</div>
  )
}

