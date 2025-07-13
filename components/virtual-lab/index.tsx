"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import BeamDeflection from "./beam-deflection"
import TensileTest from "./tensile-test"
import HeatConduction from "./heat-conduction"
import TorsionTest from "./torsion-test"
import FEA3DSimulation from "./fea-3d"
import FluidDynamicsModule from "./fluid-dynamics"
import FEA3DRealWorld from "./fea-3d-realworld"
import FluidDynamicsRealWorld from "./fluid-dynamics-realworld"
import MeshImport from "./mesh-import"
import CustomBoundaries from "./custom-boundaries"
import AnimatedResults from "./animated-results"

export default function VirtualLab() {
  const [activeTab, setActiveTab] = useState("beam")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Virtual Lab for Mechanical Experiments</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="beam">Beam Deflection</TabsTrigger>
          <TabsTrigger value="tensile">Tensile Testing</TabsTrigger>
          <TabsTrigger value="heat">Heat Conduction</TabsTrigger>
          <TabsTrigger value="torsion">Torsion Test</TabsTrigger>
          <TabsTrigger value="fea-3d">3D FEA Simulation</TabsTrigger>
          <TabsTrigger value="fea-3d-real">FEA Real-World Example</TabsTrigger>
          <TabsTrigger value="fluid">Fluid Dynamics</TabsTrigger>
          <TabsTrigger value="fluid-real">Fluid Real-World Example</TabsTrigger>
          <TabsTrigger value="mesh-import">Mesh Import</TabsTrigger>
          <TabsTrigger value="custom-boundaries">Custom Boundaries</TabsTrigger>
          <TabsTrigger value="animated-results">Animated Results</TabsTrigger>
        </TabsList>

        <Card>
          <CardContent className="p-6">
            <TabsContent value="beam" className="space-y-4">
              <BeamDeflection />
            </TabsContent>

            <TabsContent value="tensile" className="space-y-4">
              <TensileTest />
            </TabsContent>

            <TabsContent value="heat" className="space-y-4">
              <HeatConduction />
            </TabsContent>

            <TabsContent value="torsion" className="space-y-4">
              <TorsionTest />
            </TabsContent>

            <TabsContent value="fea-3d" className="space-y-4">
              <FEA3DSimulation />
            </TabsContent>

            <TabsContent value="fea-3d-real" className="space-y-4">
              <FEA3DRealWorld />
            </TabsContent>

            <TabsContent value="fluid" className="space-y-4">
              <FluidDynamicsModule />
            </TabsContent>

            <TabsContent value="fluid-real" className="space-y-4">
              <FluidDynamicsRealWorld />
            </TabsContent>

            <TabsContent value="mesh-import" className="space-y-4">
              <MeshImport />
            </TabsContent>

            <TabsContent value="custom-boundaries" className="space-y-4">
              <CustomBoundaries />
            </TabsContent>

            <TabsContent value="animated-results" className="space-y-4">
              <AnimatedResults />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}
