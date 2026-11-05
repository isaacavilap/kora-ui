"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "kora-ui";

export default function Demo() {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="orders">Orders</TabsTrigger>
        <TabsTrigger value="customers">Customers</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="text-sm">Sales for this month.</TabsContent>
      <TabsContent value="orders" className="text-sm">Every order, newest first.</TabsContent>
      <TabsContent value="customers" className="text-sm">People who bought from you.</TabsContent>
      <TabsContent value="settings" className="text-sm">Store preferences.</TabsContent>
    </Tabs>
  );
}

