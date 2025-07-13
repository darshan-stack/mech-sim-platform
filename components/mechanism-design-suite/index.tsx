"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import FourBarLinkage from "./four-bar-linkage"
import SliderCrank from "./slider-crank"
import GearTrain from "./gear-train"
import AllThingsAddMechanism from "./all-things-add"

export default function MechanismDesignSuite() {
  const [activeTab, setActiveTab] = useState("four-bar")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Mechanism Design Suite</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="four-bar">Four-Bar Linkage</TabsTrigger>
          <TabsTrigger value="slider-crank">Slider-Crank</TabsTrigger>
          <TabsTrigger value="gear-train">Gear Train</TabsTrigger>
          <TabsTrigger value="all-add">All Things Add</TabsTrigger>
        </TabsList>

        <Card>
          <CardContent className="p-6">
            <TabsContent value="four-bar" className="space-y-4">
              <FourBarLinkage />
            </TabsContent>

            <TabsContent value="slider-crank" className="space-y-4">
              <SliderCrank />
            </TabsContent>

            <TabsContent value="gear-train" className="space-y-4">
              <GearTrain />
            </TabsContent>

            <TabsContent value="all-add" className="space-y-4">
              <AllThingsAddMechanism />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}
