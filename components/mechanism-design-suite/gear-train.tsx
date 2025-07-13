"use client"

import { useState, useEffect, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Play, Pause, Download, Plus, Minus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

export default function GearTrain() {
  // Parameters for the gear train
  const [gears, setGears] = useState([
    { teeth: 20, radius: 2, color: "#3b82f6", position: [0, 0, 0], angle: 0 },
    { teeth: 40, radius: 4, color: "#10b981", position: [6, 0, 0], angle: 0 },
  ])

  const [drivingRPM, setDrivingRPM] = useState(30)
  const [isAnimating, setIsAnimating] = useState(false)
  const [time, setTime] = useState(0)
  const [speedData, setSpeedData] = useState<{ time: number; gear1: number; gear2: number }[]>([])

  const animationRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)

  // Add a new gear
  const addGear = () => {
    if (gears.length >= 5) return // Limit to 5 gears for simplicity

    const lastGear = gears[gears.length - 1]
    const newRadius = 2 + Math.random() * 3 // Random radius between 2 and 5
    const newTeeth = Math.round(newRadius * 10) // Teeth proportional to radius

    // Position the new gear next to the last one
    const newX = lastGear.position[0] + lastGear.radius + newRadius

    setGears([
      ...gears,
      {
        teeth: newTeeth,
        radius: newRadius,
        color: getRandomColor(),
        position: [newX, 0, 0],
        angle: 0,
      },
    ])
  }

  // Remove the last gear
  const removeGear = () => {
    if (gears.length <= 2) return // Keep at least 2 gears
    setGears(gears.slice(0, -1))
  }

  // Generate a random color
  const getRandomColor = () => {
    const colors = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // Handle RPM change
  const handleRPMChange = (value: number) => {
    setDrivingRPM(value)
  }

  // Toggle animation
  const toggleAnimation = () => {
    setIsAnimating(!isAnimating)
  }

  // Calculate gear ratios and speeds
  const calculateGearSpeeds = () => {
    const speeds = [drivingRPM]

    for (let i = 1; i < gears.length; i++) {
      // Speed of driven gear = (driving gear teeth / driven gear teeth) * driving gear speed
      const ratio = gears[i - 1].teeth / gears[i].teeth
      speeds.push(speeds[i - 1] * ratio)
    }

    return speeds
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

      // Update time
      setTime((prev) => prev + deltaTime)

      // Calculate gear speeds
      const speeds = calculateGearSpeeds()

      // Update gear angles
      const newGears = [...gears]
      for (let i = 0; i < newGears.length; i++) {
        // Convert RPM to radians per second
        const angularVelocity = (speeds[i] * 2 * Math.PI) / 60

        // Update angle based on angular velocity and time
        // Alternate direction for meshing gears
        const direction = i % 2 === 0 ? 1 : -1
        newGears[i].angle += direction * angularVelocity * deltaTime
      }
      setGears(newGears)

      // Update speed data for graphs (keep last 100 points)
      setSpeedData((prev) => {
        const newData = [
          ...prev,
          {
            time: elapsedTime,
            gear1: speeds[0],
            gear2: speeds[speeds.length - 1],
          },
        ]
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
  }, [isAnimating, gears, drivingRPM])

  // Calculate overall gear ratio
  const overallRatio = gears.length > 1 ? (gears[0].teeth / gears[gears.length - 1].teeth).toFixed(3) : "1.000"

  // Calculate speeds for all gears
  const gearSpeeds = calculateGearSpeeds()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Left panel - Parameters */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="drivingRPM">Driving Gear RPM: {drivingRPM}</Label>
            <div className="flex items-center space-x-2">
              <Slider
                id="drivingRPM"
                min={5}
                max={100}
                step={1}
                value={[drivingRPM]}
                onValueChange={(value) => handleRPMChange(value[0])}
              />
              <Input
                type="number"
                value={drivingRPM}
                onChange={(e) => handleRPMChange(Number.parseFloat(e.target.value))}
                className="w-20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Gear Configuration</Label>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={addGear} disabled={gears.length >= 5}>
                  <Plus className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={removeGear} disabled={gears.length <= 2}>
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 max-h-[200px] overflow-y-auto p-2 border rounded-md">
              {gears.map((gear, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-2 border rounded-md"
                  style={{ borderColor: gear.color }}
                >
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: gear.color }}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Gear {index + 1}</p>
                    <p className="text-xs">Teeth: {gear.teeth}</p>
                    <p className="text-xs">Radius: {gear.radius.toFixed(1)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{gearSpeeds[index].toFixed(1)} RPM</p>
                  </div>
                </div>
              ))}
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
          <div className="aspect-square w-full border rounded-md overflow-hidden">
            <Canvas camera={{ position: [0, 15, 20], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <GearTrainVisualization gears={gears} />
              <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
              <gridHelper args={[30, 30]} />
              <axesHelper args={[5]} />
            </Canvas>
          </div>

          <div className="mt-4 p-4 border rounded-md bg-muted/50">
            <h3 className="font-medium mb-2">Gear Train Equations:</h3>
            <div className="text-sm space-y-1">
              <p>Gear Ratio: n₁/n₂ = d₂/d₁ = N₂/N₁</p>
              <p>Where: n = speed, d = diameter, N = number of teeth</p>
              <p>Overall Ratio: {overallRatio}</p>
              <p>Output Speed: {gearSpeeds[gearSpeeds.length - 1].toFixed(2)} RPM</p>
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
          <Tabs defaultValue="speed" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="speed">Speed</TabsTrigger>
              <TabsTrigger value="ratio">Ratio</TabsTrigger>
            </TabsList>

            <TabsContent value="speed">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={speedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" label={{ value: "Time (s)", position: "insideBottomRight", offset: 0 }} />
                    <YAxis label={{ value: "Speed (RPM)", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="gear1" stroke="#3b82f6" name="Input Speed" dot={false} />
                    <Line
                      type="monotone"
                      dataKey="gear2"
                      stroke={gears[gears.length - 1].color}
                      name="Output Speed"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="ratio">
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4">Gear Ratios</h3>
                  <div className="space-y-2">
                    {gears.slice(1).map((gear, index) => {
                      const ratio = (gears[index].teeth / gear.teeth).toFixed(3)
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <span>
                            Gear {index + 1} to Gear {index + 2}
                          </span>
                          <span className="font-medium">Ratio: {ratio}</span>
                        </div>
                      )
                    })}

                    <div className="mt-4 pt-4 border-t">
                      me="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between font-bold">
                        <span>Overall Ratio:</span>
                        <span>{overallRatio}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-4 p-4 border rounded-md bg-muted/50">
            <h3 className="font-medium mb-2">Transmission Data:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="font-medium">Input Speed:</p>
                <p>{gearSpeeds[0].toFixed(2)} RPM</p>
              </div>
              <div>
                <p className="font-medium">Output Speed:</p>
                <p>{gearSpeeds[gearSpeeds.length - 1].toFixed(2)} RPM</p>
              </div>
              <div>
                <p className="font-medium">Torque Ratio:</p>
                <p>{(1 / Number.parseFloat(overallRatio)).toFixed(3)}</p>
              </div>
              <div>
                <p className="font-medium">Efficiency:</p>
                <p>{(0.98 ** (gears.length - 1) * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Three.js component for the gear train visualization
function GearTrainVisualization({ gears }) {
  return (
    <group>
      {/* Render each gear */}
      {gears.map((gear, index) => (
        <group key={index} position={[gear.position[0], gear.position[1], gear.position[2]]}>
          {/* Gear body */}
          <mesh rotation={[Math.PI / 2, 0, gear.angle]}>
            <cylinderGeometry args={[gear.radius, gear.radius, 0.5, 32]} />
            <meshStandardMaterial color={gear.color} />
          </mesh>

          {/* Gear teeth representation */}
          <mesh rotation={[Math.PI / 2, 0, gear.angle]}>
            <torusGeometry args={[gear.radius, 0.2, 16, gear.teeth]} />
            <meshStandardMaterial color={gear.color} />
          </mesh>

          {/* Center hole */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.6, 32]} />
            <meshStandardMaterial color="gray" />
          </mesh>

          {/* Text label for number of teeth */}
          <mesh position={[0, 0, 0.3]} rotation={[0, 0, 0]}>
            <planeGeometry args={[gear.radius * 1.2, 0.6]} />
            <meshBasicMaterial color="white" transparent opacity={0.7} />
          </mesh>
        </group>
      ))}

      {/* Base plate */}
      <mesh position={[gears[Math.floor(gears.length / 2)].position[0], -1, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[gears[gears.length - 1].position[0] + 5, 0.5, 5]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    </group>
  )
}
