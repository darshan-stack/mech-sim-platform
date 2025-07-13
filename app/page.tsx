import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModeToggle } from "@/components/mode-toggle"
import Dashboard from "@/components/dashboard"
import MechanismDesignSuite from "@/components/mechanism-design-suite"
import VirtualLab from "@/components/virtual-lab"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-2xl font-bold">MechSim</h1>
          <ModeToggle />
        </div>
      </header>
      <main className="container py-6">
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="mechanism">Mechanism Design</TabsTrigger>
            <TabsTrigger value="lab">Virtual Lab</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="space-y-4">
            <Dashboard />
          </TabsContent>
          <TabsContent value="mechanism" className="space-y-4">
            <MechanismDesignSuite />
          </TabsContent>
          <TabsContent value="lab" className="space-y-4">
            <VirtualLab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
