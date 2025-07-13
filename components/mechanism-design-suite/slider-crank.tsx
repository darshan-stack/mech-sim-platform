"use client"

import { useState, useEffect, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Play, Pause, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FullscreenCanvasWrapper from "./fullscreen-canvas-wrapper"
import AnalysisXYPlot from "./analysis-xy-plot"
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

export default function SliderCrank() {
  // Parameters for the slider-crank mechanism
  const [params, setParams] = useState({
    crankLength: 2,
    connectingRodLength: 6,
    rpm: 30,
  })

  const [isAnimating, setIsAnimating] = useState(false)
  const [angle, setAngle] = useState(0)
  const [positionData, setPositionData] = useState<{ time: number; x: number }[]>([])
  const [velocityData, setVelocityData] = useState<{ time: number; v: number }[]>([])
  const [accelerationData, setAccelerationData] = useState<{ time: number; a: number }[]>([])
  const animationRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)

  // Handle parameter changes
  const handleParamChange = (param: string, value: number) => {
    setParams((prev) => ({ ...prev, [param]: value }))
  }

  // Toggle animation
  const toggleAnimation = () => {
    setIsAnimating(!isAnimating)
  }

  // Calculate slider position based on crank angle
  const calculateSliderPosition = (crankAngle: number) => {
    const { crankLength, connectingRodLength } = params

    // X position of the crank pin
    const crankX = crankLength * Math.cos(crankAngle)
    const crankY = crankLength * Math.sin(crankAngle)

    // Calculate slider position (X only, as Y is constrained to 0)
    const sliderX = crankX + Math.sqrt(connectingRodLength * connectingRodLength - crankY * crankY)

    return { crankX, crankY, sliderX }
  }

  // Calculate slider velocity
  const calculateSliderVelocity = (crankAngle: number) => {
    const { crankLength, connectingRodLength, rpm } = params

    // Angular velocity of crank in rad/s
    const omega = (rpm * 2 * Math.PI) / 60

    // Slider velocity equation
    const crankY = crankLength * Math.sin(crankAngle)
    const beta = Math.asin(crankY / connectingRodLength)

    // v = -r*omega*sin(theta)/cos(beta)
    const velocity = (-crankLength * omega * Math.sin(crankAngle)) / Math.cos(beta)

    return velocity
  }

  // Calculate slider acceleration
  const calculateSliderAcceleration = (crankAngle: number) => {
    const { crankLength, connectingRodLength, rpm } = params

    // Angular velocity of crank in rad/s
    const omega = (rpm * 2 * Math.PI) / 60

    // Slider acceleration equation (simplified)
    const acceleration =
      -crankLength *
      omega *
      omega *
      (Math.cos(crankAngle) + (crankLength / connectingRodLength) * Math.cos(2 * crankAngle))

    return acceleration
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

    startTimeRef.current = performance.now()
    lastTimeRef.current = startTimeRef.current

    const animate = (time: number) => {
      const deltaTime = (time - lastTimeRef.current) / 1000 // in seconds
      const elapsedTime = (time - startTimeRef.current) / 1000

      // Calculate new angle based on RPM
      const angleIncrement = ((params.rpm * 2 * Math.PI) / 60) * deltaTime
      const newAngle = angle + angleIncrement
      setAngle(newAngle)

      // Calculate positions
      const { sliderX } = calculateSliderPosition(newAngle)
      const velocity = calculateSliderVelocity(newAngle)
      const acceleration = calculateSliderAcceleration(newAngle)

      // Update data for graphs (keep last 100 points)
      setPositionData((prev) => {
        const newData = [...prev, { time: elapsedTime, x: sliderX }]
        return newData.slice(-100)
      })

      setVelocityData((prev) => {
        const newData = [...prev, { time: elapsedTime, v: velocity }]
        return newData.slice(-100)
      })

      setAccelerationData((prev) => {
        const newData = [...prev, { time: elapsedTime, a: acceleration }]
        return newData.slice(-100)
      })

      lastTimeRef.current = time
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isAnimating, angle, params])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Left panel - Parameters */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="crankLength">Crank Length: {params.crankLength}</Label>
            <div className="flex items-center space-x-2">
              <Slider
                id="crankLength"
                min={1}
                max={5}
                step={0.1}
                value={[params.crankLength]}
                onValueChange={(value) => handleParamChange("crankLength", value[0])}
              />
              <Input
                type="number"
                value={params.crankLength}
                onChange={(e) => handleParamChange("crankLength", Number.parseFloat(e.target.value))}
                className="w-20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="connectingRodLength">Connecting Rod Length: {params.connectingRodLength}</Label>
            <div className="flex items-center space-x-2">
              <Slider
                id="connectingRodLength"
                min={3}
                max={12}
                step={0.1}
                value={[params.connectingRodLength]}
                onValueChange={(value) => handleParamChange("connectingRodLength", value[0])}
              />
              <Input
                type="number"
                value={params.connectingRodLength}
                onChange={(e) => handleParamChange("connectingRodLength", Number.parseFloat(e.target.value))}
                className="w-20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rpm">RPM: {params.rpm}</Label>
            <div className="flex items-center space-x-2">
              <Slider
                id="rpm"
                min={5}
                max={60}
                step={1}
                value={[params.rpm]}
                onValueChange={(value) => handleParamChange("rpm", value[0])}
              />
              <Input
                type="number"
                value={params.rpm}
                onChange={(e) => handleParamChange("rpm", Number.parseFloat(e.target.value))}
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
                  <Play className="mr-2 h-4 w-4" /> Animate
                </>
              )}
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
          <FullscreenCanvasWrapper height={300}>
            <Canvas camera={{ position: [7, 5, 7] }} style={{ height: '100%' }}>
              <ambientLight intensity={0.7} />
              <pointLight position={[10, 10, 10]} />
              <SliderCrankMechanism
                crankLength={params.crankLength}
                connectingRodLength={params.connectingRodLength}
                angle={angle}
              />
              <OrbitControls />
            </Canvas>
          </FullscreenCanvasWrapper>
          <AnalysisXYPlot title="Slider Position vs. Time" xLabel="Time (s)" yLabel="Position" data={{
            labels: positionData.map(d => d.time.toFixed(2)),
            datasets: [
              {
                label: 'Position',
                data: positionData.map(d => d.x),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4,
              },
            ],
          }} />

          <div className="mt-4 p-4 border rounded-md bg-muted/50">
            <h3 className="font-medium mb-2">Kinematic Equations:</h3>
            <div className="text-sm space-y-1">
              <p>Position: x = r·cos(θ) + l·cos(β)</p>
              <p>Velocity: v = -r·ω·sin(θ)/cos(β)</p>
              <p>Acceleration: a = -r·ω²·[cos(θ) + (r/l)·cos(2θ)]</p>
              <p>Where β = sin⁻¹(r·sin(θ)/l)</p>
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
          <Tabs defaultValue="position" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="position">Position</TabsTrigger>
              <TabsTrigger value="velocity">Velocity</TabsTrigger>
              <TabsTrigger value="acceleration">Acceleration</TabsTrigger>
            </TabsList>

            <TabsContent value="position">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={positionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" label={{ value: "Time (s)", position: "insideBottomRight", offset: 0 }} />
                    <YAxis label={{ value: "Position", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="x" stroke="#8884d8" name="Slider Position" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="velocity">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={velocityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" label={{ value: "Time (s)", position: "insideBottomRight", offset: 0 }} />
                    <YAxis label={{ value: "Velocity", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="v" stroke="#82ca9d" name="Slider Velocity" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="acceleration">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={accelerationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" label={{ value: "Time (s)", position: "insideBottomRight", offset: 0 }} />
                    <YAxis label={{ value: "Acceleration", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="a" stroke="#ff8042" name="Slider Acceleration" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-4 p-4 border rounded-md bg-muted/50">
            <h3 className="font-medium mb-2">Current Values:</h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="font-medium">Position:</p>
                <p>{positionData.length > 0 ? positionData[positionData.length - 1].x.toFixed(2) : "0.00"}</p>
              </div>
              <div>
                <p className="font-medium">Velocity:</p>
                <p>{velocityData.length > 0 ? velocityData[velocityData.length - 1].v.toFixed(2) : "0.00"}</p>
              </div>
              <div>
                <p className="font-medium">Acceleration:</p>
                <p>
                  {accelerationData.length > 0 ? accelerationData[accelerationData.length - 1].a.toFixed(2) : "0.00"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Three.js component for the slider-crank mechanism visualization
function SliderCrankMechanism({ crankLength, connectingRodLength, angle }) {
  // Calculate positions for the mechanism
  const crankX = crankLength * Math.cos(angle)
  const crankY = crankLength * Math.sin(angle)

  // Calculate slider position
  const sliderX = crankX + Math.sqrt(connectingRodLength * connectingRodLength - crankY * crankY)

  // Calculate connecting rod angle
  const rodAngle = Math.atan2(crankY, sliderX - crankX)

  return (
    <group>
      {/* Base */}
      <mesh position={[sliderX / 2, 0, -0.5]}>
        <boxGeometry args={[sliderX + 5, 0.5, 1]} />
        <meshStandardMaterial color="gray" />
      </mesh>

      {/* Crank pivot */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="red" />
      </mesh>

      {/* Crank */}
      <group rotation={[0, 0, angle]}>
        <mesh position={[crankLength / 2, 0, 0]}>
          <boxGeometry args={[crankLength, 0.2, 0.2]} />
          <meshStandardMaterial color="blue" />
        </mesh>
      </group>

      {/* Crank pin */}
      <mesh position={[crankX, crankY, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="green" />
      </mesh>

      {/* Connecting rod */}
      <mesh position={[(crankX + sliderX) / 2, crankY / 2, 0]} rotation={[0, 0, rodAngle]}>
        <boxGeometry args={[connectingRodLength, 0.15, 0.15]} />
        <meshStandardMaterial color="orange" />
      </mesh>

      {/* Slider */}
      <mesh position={[sliderX, 0, 0]}>
        <boxGeometry args={[1, 1, 0.5]} />
        <meshStandardMaterial color="purple" />
      </mesh>

      {/* Slider path */}
      <mesh position={[sliderX / 2, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, sliderX + 5, 8]} />
        <meshStandardMaterial color="gray" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}
