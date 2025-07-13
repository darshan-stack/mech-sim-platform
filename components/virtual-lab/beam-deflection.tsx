"use client"

import { useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  steel: { name: "Steel", E: 200, color: "#71717a" },
  aluminum: { name: "Aluminum", E: 69, color: "#94a3b8" },
  copper: { name: "Copper", E: 110, color: "#b45309" },
  titanium: { name: "Titanium", E: 116, color: "#64748b" },
}

// Beam support types
const supportTypes = {
  cantilever: { name: "Cantilever", factor: 1 },
  simplySupported: { name: "Simply Supported", factor: 48 / 5 },
  fixed: { name: "Fixed Both Ends", factor: 192 },
}

export default function BeamDeflection() {
  // Parameters for the beam deflection experiment
  const [params, setParams] = useState({
    length: 1, // meters
    width: 0.05, // meters
    height: 0.01, // meters
    force: 100, // Newtons
    material: "steel",
    supportType: "cantilever",
  })

  const [deflectionData, setDeflectionData] = useState<{ x: number; y: number }[]>([])
  const [stressData, setStressData] = useState<{ x: number; stress: number }[]>([])

  // Handle parameter changes
  const handleParamChange = (param: string, value: any) => {
    setParams((prev) => ({ ...prev, [param]: value }))
  }

  // Calculate beam deflection
  useEffect(() => {
    calculateDeflection()
  }, [params])

  const calculateDeflection = () => {
    const { length, width, height, force, material, supportType } = params

    // Moment of inertia for rectangular cross-section
    const I = (width * Math.pow(height, 3)) / 12 // m^4

    // Young's modulus in GPa converted to Pa
    const E = materials[material].E * 1e9 // Pa

    // Support factor
    const factor = supportTypes[supportType].factor

    // Generate deflection curve data
    const points = 50
    const newDeflectionData = []
    const newStressData = []

    for (let i = 0; i <= points; i++) {
      const x = (i / points) * length
      let deflection = 0
      let stress = 0

      if (supportType === "cantilever") {
        // Cantilever beam: y = -Fx²(3L-x)/(6EI)
        deflection = -(force * Math.pow(x, 2) * (3 * length - x)) / (6 * E * I)
        // Bending stress: σ = My/I where M = F(L-x)
        const M = force * (length - x)
        stress = (M * (height / 2)) / I
      } else if (supportType === "simplySupported") {
        // Simply supported beam with center load: y = -Fx(3L²-4x²)/(48EI)
        deflection = -(force * x * (3 * Math.pow(length, 2) - 4 * Math.pow(x, 2))) / (48 * E * I)
        // Bending stress: σ = My/I where M = Fx/2 for x < L/2 and M = F(L-x)/2 for x > L/2
        const M = x <= length / 2 ? (force * x) / 2 : (force * (length - x)) / 2
        stress = (M * (height / 2)) / I
      } else if (supportType === "fixed") {
        // Fixed both ends: y = -Fx²(L-x)²/(192EIL)
        deflection = -(force * Math.pow(x, 2) * Math.pow(length - x, 2)) / (192 * E * I * length)
        // Bending stress is more complex for fixed ends
        const M = (force * x * (1 - x / length)) / 2
        stress = (M * (height / 2)) / I
      }

      newDeflectionData.push({ x, y: deflection })
      newStressData.push({ x, stress })
    }

    setDeflectionData(newDeflectionData)
    setStressData(newStressData)
  }

  // Calculate maximum deflection
  const maxDeflection =
    deflectionData.length > 0
      ? Math.abs(
          deflectionData.reduce((max, point) => (Math.abs(point.y) > Math.abs(max.y) ? point : max), deflectionData[0])
            .y,
        )
      : 0

  // Calculate maximum stress
  const maxStress =
    stressData.length > 0
      ? stressData.reduce((max, point) => (point.stress > max.stress ? point : max), stressData[0]).stress
      : 0

  // Reset to default parameters
  const resetParams = () => {
    setParams({
      length: 1,
      width: 0.05,
      height: 0.01,
      force: 100,
      material: "steel",
      supportType: "cantilever",
    })
  }

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
                    {material.name} (E = {material.E} GPa)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supportType">Support Type</Label>
            <Select value={params.supportType} onValueChange={(value) => handleParamChange("supportType", value)}>
              <SelectTrigger id="supportType">
                <SelectValue placeholder="Select support type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(supportTypes).map(([key, type]) => (
                  <SelectItem key={key} value={key}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="length">Beam Length: {params.length} m</Label>
            <div className="flex items-center space-x-2">
              <Slider
                id="length"
                min={0.5}
                max={2}
                step={0.1}
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
            <Label htmlFor="width">Beam Width: {params.width} m</Label>
            <div className="flex items-center space-x-2">
              <Slider
                id="width"
                min={0.01}
                max={0.1}
                step={0.01}
                value={[params.width]}
                onValueChange={(value) => handleParamChange("width", value[0])}
              />
              <Input
                type="number"
                value={params.width}
                onChange={(e) => handleParamChange("width", Number.parseFloat(e.target.value))}
                className="w-20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="height">Beam Height: {params.height} m</Label>
            <div className="flex items-center space-x-2">
              <Slider
                id="height"
                min={0.005}
                max={0.05}
                step={0.005}
                value={[params.height]}
                onValueChange={(value) => handleParamChange("height", value[0])}
              />
              <Input
                type="number"
                value={params.height}
                onChange={(e) => handleParamChange("height", Number.parseFloat(e.target.value))}
                className="w-20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="force">Applied Force: {params.force} N</Label>
            <div className="flex items-center space-x-2">
              <Slider
                id="force"
                min={10}
                max={1000}
                step={10}
                value={[params.force]}
                onValueChange={(value) => handleParamChange("force", value[0])}
              />
              <Input
                type="number"
                value={params.force}
                onChange={(e) => handleParamChange("force", Number.parseFloat(e.target.value))}
                className="w-20"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={resetParams}>
              <RefreshCw className="mr-2 h-4 w-4" /> Reset
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export Results
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
            <Canvas camera={{ position: [0, 0, 2], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <BeamVisualization
                length={params.length}
                width={params.width}
                height={params.height}
                deflectionData={deflectionData}
                supportType={params.supportType}
                material={params.material}
                maxDeflection={maxDeflection}
              />
              <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
              <gridHelper args={[3, 30]} />
              <axesHelper args={[1]} />
            </Canvas>
          </div>

          <div className="mt-4 p-4 border rounded-md bg-muted/50">
            <h3 className="font-medium mb-2">Beam Deflection Equations:</h3>
            <div className="text-sm space-y-1">
              {params.supportType === "cantilever" && <p>y = -Fx²(3L-x)/(6EI)</p>}
              {params.supportType === "simplySupported" && <p>y = -Fx(3L²-4x²)/(48EI)</p>}
              {params.supportType === "fixed" && <p>y = -Fx²(L-x)²/(192EIL)</p>}
              <p>Where: E = Young's modulus, I = Moment of inertia</p>
              <p>I = bh³/12 = {((params.width * Math.pow(params.height, 3)) / 12).toExponential(4)} m⁴</p>
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
          <Tabs defaultValue="deflection" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="deflection">Deflection</TabsTrigger>
              <TabsTrigger value="stress">Stress</TabsTrigger>
            </TabsList>

            <TabsContent value="deflection">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={deflectionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="x" label={{ value: "Position (m)", position: "insideBottomRight", offset: 0 }} />
                    <YAxis
                      label={{ value: "Deflection (m)", angle: -90, position: "insideLeft" }}
                      domain={["auto", "auto"]}
                    />
                    <Tooltip formatter={(value) => value.toExponential(4)} />
                    <Legend />
                    <Line type="monotone" dataKey="y" stroke="#8884d8" name="Deflection" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="stress">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="x" label={{ value: "Position (m)", position: "insideBottomRight", offset: 0 }} />
                    <YAxis label={{ value: "Stress (Pa)", angle: -90, position: "insideLeft" }} />
                    <Tooltip formatter={(value) => value.toExponential(4)} />
                    <Legend />
                    <Line type="monotone" dataKey="stress" stroke="#82ca9d" name="Bending Stress" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-4 p-4 border rounded-md bg-muted/50">
            <h3 className="font-medium mb-2">Results:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="font-medium">Maximum Deflection:</p>
                <p>{maxDeflection.toExponential(4)} m</p>
              </div>
              <div>
                <p className="font-medium">Maximum Stress:</p>
                <p>{maxStress.toExponential(4)} Pa</p>
                <p>{(maxStress / 1e6).toFixed(2)} MPa</p>
              </div>
              <div>
                <p className="font-medium">Moment of Inertia:</p>
                <p>{((params.width * Math.pow(params.height, 3)) / 12).toExponential(4)} m⁴</p>
              </div>
              <div>
                <p className="font-medium">Section Modulus:</p>
                <p>{((params.width * Math.pow(params.height, 2)) / 6).toExponential(4)} m³</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Three.js component for the beam visualization
function BeamVisualization({ length, width, height, deflectionData, supportType, material, maxDeflection }) {
  // Scale the deflection for visualization
  const scaleFactor = maxDeflection > 0 ? 0.2 / maxDeflection : 1

  // Create points for the beam curve
  const points = deflectionData.map((point) => [
    point.x - length / 2, // Center the beam
    point.y * scaleFactor, // Scale the deflection
    0,
  ])

  return (
    <group position={[0, 0, 0]}>
      {/* Beam visualization */}
      {points.length > 0 && (
        <group>
          {/* Beam with deflection */}
          {points.map((point, i) => {
            if (i < points.length - 1) {
              const nextPoint = points[i + 1]
              const dx = nextPoint[0] - point[0]
              const dy = nextPoint[1] - point[1]
              const length = Math.sqrt(dx * dx + dy * dy)
              const angle = Math.atan2(dy, dx)

              return (
                <mesh
                  key={i}
                  position={[(point[0] + nextPoint[0]) / 2, (point[1] + nextPoint[1]) / 2, 0]}
                  rotation={[0, 0, angle]}
                >
                  <boxGeometry args={[length, height, width]} />
                  <meshStandardMaterial color={materials[material].color} />
                </mesh>
              )
            }
            return null
          })}

          {/* Force arrow */}
          <mesh position={[0, points[Math.floor(points.length / 2)][1] + 0.1, 0]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.03, 0.1, 8]} />
            <meshStandardMaterial color="red" />
          </mesh>
          <mesh position={[0, points[Math.floor(points.length / 2)][1] + 0.15, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 0.1, 8]} />
            <meshStandardMaterial color="red" />
          </mesh>

          {/* Supports */}
          {supportType === "cantilever" && (
            <mesh position={[-length / 2, 0, 0]}>
              <boxGeometry args={[0.1, 0.3, width * 1.5]} />
              <meshStandardMaterial color="gray" />
            </mesh>
          )}

          {supportType === "simplySupported" && (
            <>
              <mesh position={[-length / 2, -0.1, 0]}>
                <cylinderGeometry args={[0.03, 0.03, width * 1.5, 8]} rotation={[Math.PI / 2, 0, 0]} />
                <meshStandardMaterial color="gray" />
              </mesh>
              <mesh position={[length / 2, -0.1, 0]}>
                <cylinderGeometry args={[0.03, 0.03, width * 1.5, 8]} rotation={[Math.PI / 2, 0, 0]} />
                <meshStandardMaterial color="gray" />
              </mesh>
            </>
          )}

          {supportType === "fixed" && (
            <>
              <mesh position={[-length / 2, 0, 0]}>
                <boxGeometry args={[0.1, 0.3, width * 1.5]} />
                <meshStandardMaterial color="gray" />
              </mesh>
              <mesh position={[length / 2, 0, 0]}>
                <boxGeometry args={[0.1, 0.3, width * 1.5]} />
                <meshStandardMaterial color="gray" />
              </mesh>
            </>
          )}
        </group>
      )}
    </group>
  )
}
