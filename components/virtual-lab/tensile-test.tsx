"use client"

import { useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Play, Pause, Download, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "@/components/ui/chart"

// Material properties
const materials = {
  steel: {
    name: "Steel",
    E: 200, // GPa
    yieldStrength: 250, // MPa
    ultimateStrength: 400, // MPa
    elongation: 0.25, // 25%
    color: "#71717a",
  },
  aluminum: {
    name: "Aluminum",
    E: 69,
    yieldStrength: 95,
    ultimateStrength: 110,
    elongation: 0.12,
    color: "#94a3b8",
  },
  copper: {
    name: "Copper",
    E: 110,
    yieldStrength: 70,
    ultimateStrength: 220,
    elongation: 0.4,
    color: "#b45309",
  },
  titanium: {
    name: "Titanium",
    E: 116,
    yieldStrength: 380,
    ultimateStrength: 480,
    elongation: 0.15,
    color: "#64748b",
  },
}

export default function TensileTest() {
  // Parameters for the tensile test experiment
  const [params, setParams] = useState({
    diameter: 10, // mm
    length: 100, // mm
    material: "steel",
    strain: 0, // Current strain value (0-1)
  })

  const [isAnimating, setIsAnimating] = useState(false)
  const [stressStrainData, setStressStrainData] = useState<{ strain: number; stress: number }[]>([])
  const [currentStress, setCurrentStress] = useState(0)
  const [currentStage, setCurrentStage] = useState("elastic") // elastic, yield, plastic, necking, fracture

  // Handle parameter changes
  const handleParamChange = (param: string, value: any) => {
    setParams((prev) => ({ ...prev, [param]: value }))

    // Reset the test if material or dimensions change
    if (param !== "strain") {
      setStressStrainData([])
      setCurrentStress(0)
      setCurrentStage("elastic")
      setParams((prev) => ({ ...prev, strain: 0 }))
    }
  }

  // Toggle animation
  const toggleAnimation = () => {
    setIsAnimating(!isAnimating)
  }

  // Reset the test
  const resetTest = () => {
    setStressStrainData([])
    setCurrentStress(0)
    setCurrentStage("elastic")
    setParams((prev) => ({ ...prev, strain: 0 }))
    setIsAnimating(false)
  }

  // Calculate stress-strain curve
  useEffect(() => {
    const { material, strain } = params
    const materialProps = materials[material]

    // Calculate stress based on strain
    let stress = 0
    let stage = "elastic"

    // Convert yield and ultimate strength from MPa to Pa for calculations
    const yieldStrength = materialProps.yieldStrength * 1e6
    const ultimateStrength = materialProps.ultimateStrength * 1e6
    const E = materialProps.E * 1e9 // GPa to Pa

    // Elastic region (linear)
    const yieldStrain = yieldStrength / E

    if (strain <= yieldStrain) {
      // Elastic region (linear)
      stress = E * strain
      stage = "elastic"
    } else if (strain <= yieldStrain * 1.5) {
      // Yield region (transition)
      stress = yieldStrength + (strain - yieldStrain) * E * 0.1
      stage = "yield"
    } else if (strain <= materialProps.elongation * 0.8) {
      // Plastic region (strain hardening)
      const plasticStrain = strain - yieldStrain * 1.5
      const remainingStrain = materialProps.elongation * 0.8 - yieldStrain * 1.5
      const stressIncrease = (ultimateStrength - yieldStrength * 1.1) * (plasticStrain / remainingStrain)
      stress = yieldStrength * 1.1 + stressIncrease
      stage = "plastic"
    } else if (strain <= materialProps.elongation) {
      // Necking region (decreasing stress)
      const neckingStrain = strain - materialProps.elongation * 0.8
      const remainingStrain = materialProps.elongation - materialProps.elongation * 0.8
      const stressDecrease = ultimateStrength * 0.2 * (neckingStrain / remainingStrain)
      stress = ultimateStrength - stressDecrease
      stage = "necking"
    } else {
      // Fracture
      stress = 0
      stage = "fracture"
    }

    setCurrentStress(stress)
    setCurrentStage(stage)

    // Add point to stress-strain curve
    if (stressStrainData.length === 0 || strain > stressStrainData[stressStrainData.length - 1].strain) {
      setStressStrainData((prev) => [...prev, { strain, stress }])
    }
  }, [params.strain, params.material])

  // Animation loop
  useEffect(() => {
    if (!isAnimating) return

    const materialProps = materials[params.material]
    const maxStrain = materialProps.elongation * 1.1 // Go slightly beyond elongation to show fracture

    let animationId: number
    let lastTime = performance.now()

    const animate = (time: number) => {
      const deltaTime = (time - lastTime) / 1000 // in seconds
      lastTime = time

      // Increase strain gradually
      setParams((prev) => {
        const newStrain = Math.min(prev.strain + deltaTime * 0.05, maxStrain)

        // Stop animation if we reach fracture
        if (newStrain >= maxStrain) {
          setIsAnimating(false)
        }

        return { ...prev, strain: newStrain }
      })

      if (isAnimating) {
        animationId = requestAnimationFrame(animate)
      }
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [isAnimating, params.material])

  // Calculate cross-sectional area
  const initialArea = Math.PI * Math.pow(params.diameter / 2, 2) // mm²

  // Calculate current area (accounting for necking)
  const currentArea =
    currentStage === "necking" || currentStage === "fracture"
      ? initialArea * (1 - params.strain * 0.5) // Simplified necking model
      : initialArea * (1 - params.strain * 0.3) // Simplified area reduction

  // Calculate force
  const force = (currentStress * currentArea) / 1000 // N

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Left panel - Parameters */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="material">Material</Label>
            <Select value={params.material} onValueChange={(value) => handleParamChange("material", value)}>
              <SelectTrigger id="material">
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(materials).map(([key, material]) => (
                  <SelectItem key={key} value={key}>
                    {material.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diameter">Specimen Diameter: {params.diameter} mm</Label>
            <div className="flex items-center space-x-2">
              <Slider
                id="diameter"
                min={5}
                max={20}
                step={1}
                value={[params.diameter]}
                onValueChange={(value) => handleParamChange("diameter", value[0])}
              />
              <Input
                type="number"
                value={params.diameter}
                onChange={(e) => handleParamChange("diameter", Number.parseFloat(e.target.value))}
                className="w-20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="length">Specimen Length: {params.length} mm</Label>
            <div className="flex items-center space-x-2">
              <Slider
                id="length"
                min={50}
                max={200}
                step={10}
                value={[params.length]}
                onValueChange={(value) => handleParamChange("length", value[0])}
              />
              <Input
                type="number"
                value={params.length}
                onChange={(e) => handleParamChange("length", Number.parseFloat(e.target.value))}
                className="w-20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="strain">Applied Strain: {(params.strain * 100).toFixed(1)}%</Label>
            <div className="flex items-center space-x-2">
              <Slider
                id="strain"
                min={0}
                max={materials[params.material].elongation * 1.1}
                step={0.01}
                value={[params.strain]}
                onValueChange={(value) => handleParamChange("strain", value[0])}
                disabled={isAnimating}
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button onClick={toggleAnimation} disabled={currentStage === "fracture"}>
              {isAnimating ? (
                <>
                  <Pause className="mr-2 h-4 w-4" /> Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" /> Run Test
                </>
              )}
            </Button>
            <Button variant="outline" onClick={resetTest}>
              <RefreshCw className="mr-2 h-4 w-4" /> Reset
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Middle panel - Simulation */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Simulation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-square w-full border rounded-md overflow-hidden">
            <Canvas camera={{ position: [0, 0, 200], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <TensileSpecimen
                diameter={params.diameter}
                length={params.length}
                strain={params.strain}
                stage={currentStage}
                material={params.material}
              />
              <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
              <gridHelper args={[200, 20]} />
            </Canvas>
          </div>

          <div className="mt-4 p-4 border rounded-md bg-muted/50">
            <h3 className="font-medium mb-2">Material Properties:</h3>
            <div className="text-sm space-y-1">
              <p>Young's Modulus (E): {materials[params.material].E} GPa</p>
              <p>Yield Strength: {materials[params.material].yieldStrength} MPa</p>
              <p>Ultimate Strength: {materials[params.material].ultimateStrength} MPa</p>
              <p>Elongation at Break: {(materials[params.material].elongation * 100).toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Right panel - Results */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stressStrainData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="strain"
                  label={{ value: "Strain (ε)", position: "insideBottomRight", offset: 0 }}
                  tickFormatter={(value) => (value * 100).toFixed(0) + "%"}
                />
                <YAxis
                  label={{ value: "Stress (MPa)", angle: -90, position: "insideLeft" }}
                  tickFormatter={(value) => (value / 1e6).toFixed(0)}
                  domain={[0, "dataMax * 1.1"]}
                />
                <Tooltip
                  formatter={(value) => [(value / 1e6).toFixed(2) + " MPa", "Stress"]}
                  labelFormatter={(value) => "Strain: " + (value * 100).toFixed(2) + "%"}
                />
                <Legend />
                <Line type="monotone" dataKey="stress" stroke="#8884d8" name="Stress" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-4 border rounded-md bg-muted/50">
            <h3 className="font-medium mb-2">Current Values:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="font-medium">Strain:</p>
                <p>{(params.strain * 100).toFixed(2)}%</p>
              </div>
              <div>
                <p className="font-medium">Stress:</p>
                <p>{(currentStress / 1e6).toFixed(2)} MPa</p>
              </div>
              <div>
                <p className="font-medium">Force:</p>
                <p>{force.toFixed(2)} N</p>
              </div>
              <div>
                <p className="font-medium">Current Area:</p>
                <p>{currentArea.toFixed(2)} mm²</p>
              </div>
              <div>
                <p className="font-medium">Elongation:</p>
                <p>{(params.strain * params.length).toFixed(2)} mm</p>
              </div>
              <div>
                <p className="font-medium">Stage:</p>
                <p className="capitalize">{currentStage}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Three.js component for the tensile specimen visualization
function TensileSpecimen({ diameter, length, strain, stage, material }) {
  // Scale for visualization
  const scaledLength = length * 0.8
  const scaledDiameter = diameter * 0.8

  // Calculate deformed length
  const deformedLength = scaledLength * (1 + strain)

  // Calculate necking effect
  let neckingFactor = 1
  if (stage === "necking") {
    neckingFactor = 1 - strain * 0.5
  } else if (stage === "plastic") {
    neckingFactor = 1 - strain * 0.3
  } else if (stage === "fracture") {
    neckingFactor = 0.5 // Broken
  }

  // Calculate necking position (center for now)
  const neckingPosition = 0

  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      {/* Specimen */}
      {stage !== "fracture" ? (
        <mesh>
          <cylinderGeometry
            args={[
              (scaledDiameter / 2) * neckingFactor, // Top radius
              (scaledDiameter / 2) * neckingFactor, // Bottom radius
              deformedLength, // Height
              32, // Segments
            ]}
          />
          <meshStandardMaterial color={materials[material].color} />
        </mesh>
      ) : (
        // Fractured specimen (two parts)
        <>
          <mesh position={[deformedLength * 0.3, 0, 0]}>
            <cylinderGeometry
              args={[
                (scaledDiameter / 2) * 0.7, // Top radius
                scaledDiameter / 2, // Bottom radius
                deformedLength * 0.4, // Height
                32, // Segments
              ]}
            />
            <meshStandardMaterial color={materials[material].color} />
          </mesh>
          <mesh position={[-deformedLength * 0.3, 0, 0]}>
            <cylinderGeometry
              args={[
                scaledDiameter / 2, // Top radius
                (scaledDiameter / 2) * 0.7, // Bottom radius
                deformedLength * 0.4, // Height
                32, // Segments
              ]}
            />
            <meshStandardMaterial color={materials[material].color} />
          </mesh>
        </>
      )}

      {/* Grips */}
      <mesh position={[deformedLength / 2 + 10, 0, 0]}>
        <cylinderGeometry args={[scaledDiameter, scaledDiameter, 10, 32]} />
        <meshStandardMaterial color="gray" />
      </mesh>
      <mesh position={[-deformedLength / 2 - 10, 0, 0]}>
        <cylinderGeometry args={[scaledDiameter, scaledDiameter, 10, 32]} />
        <meshStandardMaterial color="gray" />
      </mesh>

      {/* Testing machine frame (simplified) */}
      <mesh position={[deformedLength / 2 + 25, 0, 0]}>
        <boxGeometry args={[20, scaledDiameter * 3, scaledDiameter * 3]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      <mesh position={[-deformedLength / 2 - 25, 0, 0]}>
        <boxGeometry args={[20, scaledDiameter * 3, scaledDiameter * 3]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
    </group>
  )
}
