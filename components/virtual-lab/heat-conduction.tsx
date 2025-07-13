"use client"

import { TabsContent } from "@/components/ui/tabs"

import { TabsTrigger } from "@/components/ui/tabs"

import { TabsList } from "@/components/ui/tabs"

import { Tabs } from "@/components/ui/tabs"

import { useState, useEffect, useRef } from "react"
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
  copper: {
    name: "Copper",
    thermalConductivity: 385, // W/(m·K)
    density: 8960, // kg/m³
    specificHeat: 386, // J/(kg·K)
    color: "#b45309",
  },
  aluminum: {
    name: "Aluminum",
    thermalConductivity: 205,
    density: 2700,
    specificHeat: 900,
    color: "#94a3b8",
  },
  steel: {
    name: "Steel",
    thermalConductivity: 50,
    density: 7850,
    specificHeat: 490,
    color: "#71717a",
  },
  glass: {
    name: "Glass",
    thermalConductivity: 1.05,
    density: 2500,
    specificHeat: 840,
    color: "#cbd5e1",
  },
}

export default function HeatConduction() {
  // Parameters for the heat conduction experiment
  const [params, setParams] = useState({
    length: 0.2, // m
    diameter: 0.02, // m
    material: "copper",
    hotEndTemp: 100, // °C
    coldEndTemp: 20, // °C
    time: 0, // seconds
  })

  const [isAnimating, setIsAnimating] = useState(false)
  const [temperatureProfile, setTemperatureProfile] = useState<{ position: number; temperature: number }[]>([])
  const [timeSeriesData, setTimeSeriesData] = useState<{ time: number; temp1: number; temp2: number; temp3: number }[]>(
    [],
  )

  const animationRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)

  // Handle parameter changes
  const handleParamChange = (param: string, value: any) => {
    setParams((prev) => ({ ...prev, [param]: value }))

    // Reset simulation if parameters other than time change
    if (param !== "time") {
      calculateInitialTemperatureProfile()
      setTimeSeriesData([])
      setParams((prev) => ({ ...prev, time: 0 }))
    }
  }

  // Toggle animation
  const toggleAnimation = () => {
    setIsAnimating(!isAnimating)
  }

  // Reset simulation
  const resetSimulation = () => {
    setIsAnimating(false)
    calculateInitialTemperatureProfile()
    setTimeSeriesData([])
    setParams((prev) => ({ ...prev, time: 0 }))
  }

  // Calculate initial temperature profile (linear)
  const calculateInitialTemperatureProfile = () => {
    const { length, hotEndTemp, coldEndTemp } = params
    const points = 20
    const newProfile = []

    for (let i = 0; i <= points; i++) {
      const position = (i / points) * length
      const temperature = hotEndTemp - (hotEndTemp - coldEndTemp) * (position / length)
      newProfile.push({ position, temperature })
    }

    setTemperatureProfile(newProfile)
  }

  // Initialize temperature profile
  useEffect(() => {
    calculateInitialTemperatureProfile()
  }, [])

  // Calculate thermal diffusivity
  const calculateThermalDiffusivity = () => {
    const { material } = params
    const materialProps = materials[material]

    // Thermal diffusivity = k / (ρ * c)
    return materialProps.thermalConductivity / (materialProps.density * materialProps.specificHeat)
  }

  // Update temperature profile over time
  const updateTemperatureProfile = (deltaTime: number) => {
    const { length, hotEndTemp, coldEndTemp } = params
    const alpha = calculateThermalDiffusivity() // m²/s

    // Use 1D heat equation (simplified)
    const newProfile = [...temperatureProfile]
    const dx = length / (newProfile.length - 1)
    const dt = deltaTime

    // Check stability condition (simplified)
    const stability = (alpha * dt) / (dx * dx)
    if (stability > 0.5) {
      console.warn("Simulation may be unstable, reducing time step")
      return
    }

    // Apply heat equation to interior points
    for (let i = 1; i < newProfile.length - 1; i++) {
      const leftTemp = newProfile[i - 1].temperature
      const rightTemp = newProfile[i + 1].temperature
      const currentTemp = newProfile[i].temperature

      // Finite difference approximation of heat equation
      const newTemp = currentTemp + ((alpha * dt) / (dx * dx)) * (leftTemp - 2 * currentTemp + rightTemp)
      newProfile[i].temperature = newTemp
    }

    // Boundary conditions (fixed temperatures)
    newProfile[0].temperature = hotEndTemp
    newProfile[newProfile.length - 1].temperature = coldEndTemp

    setTemperatureProfile(newProfile)

    // Update time series data (record temperatures at 25%, 50%, and 75% of length)
    const quarter = Math.floor(newProfile.length / 4)
    const half = Math.floor(newProfile.length / 2)
    const threeQuarters = Math.floor((3 * newProfile.length) / 4)

    setTimeSeriesData((prev) => {
      const newData = [
        ...prev,
        {
          time: params.time,
          temp1: newProfile[quarter].temperature,
          temp2: newProfile[half].temperature,
          temp3: newProfile[threeQuarters].temperature,
        },
      ]

      // Keep last 100 points
      return newData.slice(-100)
    })
  }

  // Animation loop
  useEffect(() => {
    if (!isAnimating) {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      return
    }

    lastTimeRef.current = performance.now()

    const animate = (time: number) => {
      const deltaTime = (time - lastTimeRef.current) / 1000 // in seconds
      lastTimeRef.current = time

      // Update time
      setParams((prev) => ({ ...prev, time: prev.time + deltaTime }))

      // Update temperature profile
      updateTemperatureProfile(deltaTime)

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isAnimating, temperatureProfile])

  // Calculate heat flux
  const calculateHeatFlux = () => {
    const { material } = params
    const materialProps = materials[material]

    // Get temperature gradient at hot end
    if (temperatureProfile.length < 2) return 0

    const dT = temperatureProfile[0].temperature - temperatureProfile[1].temperature
    const dx = temperatureProfile[1].position - temperatureProfile[0].position

    // Heat flux = -k * dT/dx
    return -materialProps.thermalConductivity * (dT / dx)
  }

  // Calculate steady-state temperature profile (analytical solution)
  const calculateSteadyStateProfile = () => {
    const { length, hotEndTemp, coldEndTemp } = params
    const points = 20
    const steadyStateProfile = []

    for (let i = 0; i <= points; i++) {
      const position = (i / points) * length
      const temperature = hotEndTemp - (hotEndTemp - coldEndTemp) * (position / length)
      steadyStateProfile.push({ position, temperature })
    }

    return steadyStateProfile
  }

  // Steady-state profile for comparison
  const steadyStateProfile = calculateSteadyStateProfile()

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
                    {material.name} (k = {material.thermalConductivity} W/m·K)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="length">Rod Length: {params.length} m</Label>
            <div className="flex items-center space-x-2">
              <Slider
                id="length"
                min={0.1}
                max={0.5}
                step={0.05}
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
            <Label htmlFor="diameter">Rod Diameter: {params.diameter} m</Label>
            <div className="flex items-center space-x-2">
              <Slider
                id="diameter"
                min={0.01}
                max={0.05}
                step={0.005}
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
            <Label htmlFor="hotEndTemp">Hot End Temperature: {params.hotEndTemp} °C</Label>
            <div className="flex items-center space-x-2">
              <Slider
                id="hotEndTemp"
                min={50}
                max={200}
                step={5}
                value={[params.hotEndTemp]}
                onValueChange={(value) => handleParamChange("hotEndTemp", value[0])}
              />
              <Input
                type="number"
                value={params.hotEndTemp}
                onChange={(e) => handleParamChange("hotEndTemp", Number.parseFloat(e.target.value))}
                className="w-20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coldEndTemp">Cold End Temperature: {params.coldEndTemp} °C</Label>
            <div className="flex items-center space-x-2">
              <Slider
                id="coldEndTemp"
                min={0}
                max={50}
                step={5}
                value={[params.coldEndTemp]}
                onValueChange={(value) => handleParamChange("coldEndTemp", value[0])}
              />
              <Input
                type="number"
                value={params.coldEndTemp}
                onChange={(e) => handleParamChange("coldEndTemp", Number.parseFloat(e.target.value))}
                className="w-20"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button onClick={toggleAnimation}>
              {isAnimating ? (
                <>
                  <Pause className="mr-2 h-4 w-4" /> Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" /> Simulate
                </>
              )}
            </Button>
            <Button variant="outline" onClick={resetSimulation}>
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
            <Canvas camera={{ position: [0, 0.1, 0.5], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[0.2, 0.2, 0.2]} />
              <HeatConductionRod
                length={params.length}
                diameter={params.diameter}
                material={params.material}
                temperatureProfile={temperatureProfile}
                hotEndTemp={params.hotEndTemp}
                coldEndTemp={params.coldEndTemp}
              />
              <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
              <gridHelper args={[1, 10]} />
            </Canvas>
          </div>

          <div className="mt-4 p-4 border rounded-md bg-muted/50">
            <h3 className="font-medium mb-2">Heat Conduction Equations:</h3>
            <div className="text-sm space-y-1">
              <p>Heat Equation: ∂T/∂t = α∇²T</p>
              <p>Fourier's Law: q = -k∇T</p>
              <p>Thermal Diffusivity: α = k/(ρc) = {calculateThermalDiffusivity().toExponential(4)} m²/s</p>
              <p>Simulation Time: {params.time.toFixed(2)} s</p>
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
          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Temperature Profile</TabsTrigger>
              <TabsTrigger value="time">Time Series</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="position"
                      label={{ value: "Position (m)", position: "insideBottomRight", offset: 0 }}
                      domain={[0, params.length]}
                    />
                    <YAxis
                      label={{ value: "Temperature (°C)", angle: -90, position: "insideLeft" }}
                      domain={[Math.min(params.coldEndTemp - 5, 0), params.hotEndTemp + 5]}
                    />
                    <Tooltip />
                    <Legend />
                    <Line
                      data={temperatureProfile}
                      type="monotone"
                      dataKey="temperature"
                      stroke="#8884d8"
                      name="Current"
                      dot={false}
                    />
                    <Line
                      data={steadyStateProfile}
                      type="monotone"
                      dataKey="temperature"
                      stroke="#82ca9d"
                      name="Steady State"
                      dot={false}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="time">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" label={{ value: "Time (s)", position: "insideBottomRight", offset: 0 }} />
                    <YAxis
                      label={{ value: "Temperature (°C)", angle: -90, position: "insideLeft" }}
                      domain={[Math.min(params.coldEndTemp - 5, 0), params.hotEndTemp + 5]}
                    />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="temp1" stroke="#8884d8" name="25% Length" dot={false} />
                    <Line type="monotone" dataKey="temp2" stroke="#82ca9d" name="50% Length" dot={false} />
                    <Line type="monotone" dataKey="temp3" stroke="#ffc658" name="75% Length" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-4 p-4 border rounded-md bg-muted/50">
            <h3 className="font-medium mb-2">Results:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="font-medium">Heat Flux:</p>
                <p>{calculateHeatFlux().toFixed(2)} W/m²</p>
              </div>
              <div>
                <p className="font-medium">Heat Transfer Rate:</p>
                <p>{((calculateHeatFlux() * Math.PI * params.diameter * params.diameter) / 4).toFixed(2)} W</p>
              </div>
              <div>
                <p className="font-medium">Thermal Resistance:</p>
                <p>
                  {(
                    params.length /
                    ((materials[params.material].thermalConductivity * Math.PI * params.diameter * params.diameter) / 4)
                  ).toFixed(4)}{" "}
                  K/W
                </p>
              </div>
              <div>
                <p className="font-medium">Time Constant:</p>
                <p>{((params.length * params.length) / (4 * calculateThermalDiffusivity())).toFixed(2)} s</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Three.js component for the heat conduction rod visualization
function HeatConductionRod({ length, diameter, material, temperatureProfile, hotEndTemp, coldEndTemp }) {
  // Temperature to color mapping
  const tempToColor = (temp) => {
    // Map temperature to color (blue to red)
    const normalizedTemp = (temp - coldEndTemp) / (hotEndTemp - coldEndTemp)
    const r = Math.min(255, Math.round(normalizedTemp * 255))
    const b = Math.min(255, Math.round((1 - normalizedTemp) * 255))
    const g = Math.round(Math.max(0, 1 - 2 * Math.abs(normalizedTemp - 0.5)) * 255)

    return `rgb(${r}, ${g}, ${b})`
  }

  return (
    <group rotation={[0, 0, 0]}>
      {/* Render rod segments with temperature gradient */}
      {temperatureProfile.map((point, i) => {
        if (i < temperatureProfile.length - 1) {
          const nextPoint = temperatureProfile[i + 1]
          const segmentLength = nextPoint.position - point.position
          const segmentPosition = (point.position + nextPoint.position) / 2 - length / 2
          const avgTemp = (point.temperature + nextPoint.temperature) / 2

          return (
            <mesh key={i} position={[segmentPosition, 0, 0]}>
              <cylinderGeometry args={[diameter / 2, diameter / 2, segmentLength, 16]} rotation={[Math.PI / 2, 0, 0]} />
              <meshStandardMaterial color={tempToColor(avgTemp)} />
            </mesh>
          )
        }
        return null
      })}

      {/* Hot end heat source */}
      <mesh position={[-length / 2 - 0.02, 0, 0]}>
        <boxGeometry args={[0.02, diameter * 1.5, diameter * 1.5]} />
        <meshStandardMaterial color="red" />
      </mesh>

      {/* Cold end heat sink */}
      <mesh position={[length / 2 + 0.02, 0, 0]}>
        <boxGeometry args={[0.02, diameter * 1.5, diameter * 1.5]} />
        <meshStandardMaterial color="blue" />
      </mesh>

      {/* Temperature labels */}
      <mesh position={[-length / 2 - 0.05, diameter, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.05, 0.02]} />
        <meshBasicMaterial color="white" transparent opacity={0.8} />
      </mesh>

      <mesh position={[length / 2 + 0.05, diameter, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.05, 0.02]} />
        <meshBasicMaterial color="white" transparent opacity={0.8} />
      </mesh>
    </group>
  )
}
