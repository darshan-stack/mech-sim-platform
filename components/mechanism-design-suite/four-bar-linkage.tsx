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

// Four-bar linkage simulation component
export default function FourBarLinkage() {
  // Parameters for the four-bar linkage
  const [params, setParams] = useState({
    crankLength: 2,
    coupleLength: 5,
    followerLength: 4,
    fixedLength: 7,
    rpm: 30,
  })

  const [isAnimating, setIsAnimating] = useState(false)
  const [angle, setAngle] = useState(0)
  const [positionData, setPositionData] = useState<{ time: number; x: number; y: number }[]>([])
  const [velocityData, setVelocityData] = useState<{ time: number; vx: number; vy: number }[]>([])
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

  // Calculate linkage positions based on crank angle
  const calculateLinkagePositions = (crankAngle: number) => {
    const { crankLength, coupleLength, followerLength, fixedLength } = params

    // Position of the crank end (point A)
    const Ax = crankLength * Math.cos(crankAngle)
    const Ay = crankLength * Math.sin(crankAngle)

    // Calculate position of point B (intersection of two circles)
    // Circle 1: center at A, radius = coupleLength
    // Circle 2: center at (fixedLength, 0), radius = followerLength

    const Cx = fixedLength // Fixed pivot point for the follower
    const Cy = 0

    // Distance between centers
    const d = Math.sqrt((Cx - Ax) * (Cx - Ax) + (Cy - Ay) * (Cy - Ay))

    // Check if the linkage can form a closed loop
    if (d > coupleLength + followerLength || d < Math.abs(coupleLength - followerLength)) {
      // Linkage cannot form a closed loop
      return { Ax, Ay, Bx: Ax, By: Ay, valid: false }
    }

    // Calculate position of point B
    const a = (coupleLength * coupleLength - followerLength * followerLength + d * d) / (2 * d)
    const h = Math.sqrt(coupleLength * coupleLength - a * a)

    const Bx = Ax + (a * (Cx - Ax)) / d - (h * (Cy - Ay)) / d
    const By = Ay + (a * (Cy - Ay)) / d + (h * (Cx - Ax)) / d

    return { Ax, Ay, Bx, By, valid: true }
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
      const { Ax, Ay, Bx, By, valid } = calculateLinkagePositions(newAngle)

      if (valid) {
        // Update position data for graphs (keep last 100 points)
        setPositionData((prev) => {
          const newData = [...prev, { time: elapsedTime, x: Bx, y: By }]
          return newData.slice(-100)
        })

        // Calculate velocity (simple finite difference)
        setPositionData((prevPositionData) => {
          if (prevPositionData.length > 0) {
            const prevPoint = prevPositionData[prevPositionData.length - 1]
            const dt = elapsedTime - prevPoint.time
            if (dt > 0) {
              const vx = (Bx - prevPoint.x) / dt
              const vy = (By - prevPoint.y) / dt

              setVelocityData((prevVelocityData) => {
                const newData = [...prevVelocityData, { time: elapsedTime, vx, vy }]
                return newData.slice(-100)
              })
            }
          }
          return prevPositionData
        })
      }

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
            <Label htmlFor="coupleLength">Coupler Length: {params.coupleLength}</Label>
            <div className="flex items-center space-x-2">
              <Slider
                id="coupleLength"
                min={2}
                max={10}
                step={0.1}
                value={[params.coupleLength]}
                onValueChange={(value) => handleParamChange("coupleLength", value[0])}
              />
              <Input
                type="number"
                value={params.coupleLength}
                onChange={(e) => handleParamChange("coupleLength", Number.parseFloat(e.target.value))}
                className="w-20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="followerLength">Follower Length: {params.followerLength}</Label>
            <div className="flex items-center space-x-2">
              <Slider
                id="followerLength"
                min={2}
                max={10}
                step={0.1}
                value={[params.followerLength]}
                onValueChange={(value) => handleParamChange("followerLength", value[0])}
              />
              <Input
                type="number"
                value={params.followerLength}
                onChange={(e) => handleParamChange("followerLength", Number.parseFloat(e.target.value))}
                className="w-20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fixedLength">Fixed Length: {params.fixedLength}</Label>
            <div className="flex items-center space-x-2">
              <Slider
                id="fixedLength"
                min={4}
                max={15}
                step={0.1}
                value={[params.fixedLength]}
                onValueChange={(value) => handleParamChange("fixedLength", value[0])}
              />
              <Input
                type="number"
                value={params.fixedLength}
                onChange={(e) => handleParamChange("fixedLength", Number.parseFloat(e.target.value))}
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
              <FourBarMechanism
                crankLength={params.crankLength}
                coupleLength={params.coupleLength}
                followerLength={params.followerLength}
                fixedLength={params.fixedLength}
                angle={angle}
              />
              <OrbitControls />
            </Canvas>
          </FullscreenCanvasWrapper>
          <AnalysisXYPlot title="Coupler X vs. Time" xLabel="Time (s)" yLabel="X Position" data={{
            labels: positionData.map(d => d.time.toFixed(2)),
            datasets: [
              {
                label: 'X Position',
                data: positionData.map(d => d.x),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4,
              },
              {
                label: 'Y Position',
                data: positionData.map(d => d.y),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.4,
              },
            ],
          }} />
          <div className="mt-4 p-4 border rounded-md bg-muted/50">
            <h3 className="font-medium mb-2">Kinematic Equations:</h3>
            <div className="text-sm space-y-1">
              <p>Position: r₂cos(θ₂) + r₃cos(θ₃) = r₁cos(θ₁) + r₄cos(θ₄)</p>
              <p>Velocity: -r₂ω₂sin(θ₂) - r₃ω₃sin(θ₃) = -r₁ω₁sin(θ₁) - r₄ω₄sin(θ₄)</p>
              <p>Acceleration: -r₂α₂sin(θ₂) - r₂ω₂²cos(θ₂) - r₃α₃sin(θ₃) - r₃ω₃²cos(θ₃) = ...</p>
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="position">Position</TabsTrigger>
              <TabsTrigger value="velocity">Velocity</TabsTrigger>
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
                    <Line type="monotone" dataKey="x" stroke="#8884d8" name="X Position" dot={false} />
                    <Line type="monotone" dataKey="y" stroke="#82ca9d" name="Y Position" dot={false} />
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
                    <Line type="monotone" dataKey="vx" stroke="#8884d8" name="X Velocity" dot={false} />
                    <Line type="monotone" dataKey="vy" stroke="#82ca9d" name="Y Velocity" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-4 p-4 border rounded-md bg-muted/50">
            <h3 className="font-medium mb-2">Current Values:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="font-medium">Coupler Point:</p>
                <p>X: {positionData.length > 0 ? positionData[positionData.length - 1].x.toFixed(2) : "0.00"}</p>
                <p>Y: {positionData.length > 0 ? positionData[positionData.length - 1].y.toFixed(2) : "0.00"}</p>
              </div>
              <div>
                <p className="font-medium">Velocity:</p>
                <p>Vx: {velocityData.length > 0 ? velocityData[velocityData.length - 1].vx.toFixed(2) : "0.00"}</p>
                <p>Vy: {velocityData.length > 0 ? velocityData[velocityData.length - 1].vy.toFixed(2) : "0.00"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* XY Analysis Plot for Four-Bar Linkage */}
      <div className="mt-4">
        <AnalysisXYPlot title="Coupler X vs. Time" xLabel="Time (s)" yLabel="X Position" data={{
          labels: positionData.map(d => d.time.toFixed(2)),
          datasets: [
            {
              label: 'X Position',
              data: positionData.map(d => d.x),
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.4,
            },
            {
              label: 'Y Position',
              data: positionData.map(d => d.y),
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              tension: 0.4,
            },
          ],
        }} />
      </div>
    </div>
  )
}


// Three.js component for the four-bar linkage visualization
function FourBarMechanism({ crankLength, coupleLength, followerLength, fixedLength, angle }) {
  const { Ax, Ay, Bx, By, valid } = calculateLinkagePositions(
    angle,
    crankLength,
    coupleLength,
    followerLength,
    fixedLength,
  )

  // Calculate positions for the mechanism
  function calculateLinkagePositions(crankAngle, crankLength, coupleLength, followerLength, fixedLength) {
    // Position of the crank end (point A)
    const Ax = crankLength * Math.cos(crankAngle)
    const Ay = crankLength * Math.sin(crankAngle)

    // Fixed pivot point for the follower
    const Cx = fixedLength
    const Cy = 0

    // Distance between centers
    const d = Math.sqrt((Cx - Ax) * (Cx - Ax) + (Cy - Ay) * (Cy - Ay))

    // Check if the linkage can form a closed loop
    if (d > coupleLength + followerLength || d < Math.abs(coupleLength - followerLength)) {
      return { Ax, Ay, Bx: Ax, By: Ay, valid: false }
    }

    // Calculate position of point B
    const a = (coupleLength * coupleLength - followerLength * followerLength + d * d) / (2 * d)
    const h = Math.sqrt(coupleLength * coupleLength - a * a)

    const Bx = Ax + (a * (Cx - Ax)) / d - (h * (Cy - Ay)) / d
    const By = Ay + (a * (Cy - Ay)) / d + (h * (Cx - Ax)) / d

    return { Ax, Ay, Bx, By, valid: true }
  }

  return (
    <group>
      {/* Ground link */}
      <mesh position={[fixedLength / 2, 0, 0]}>
        <boxGeometry args={[fixedLength, 0.1, 0.1]} />
        <meshStandardMaterial color="gray" />
      </mesh>

      {/* Fixed pivots */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="red" />
      </mesh>

      <mesh position={[fixedLength, 0, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="red" />
      </mesh>

      {/* Crank */}
      <group rotation={[0, 0, angle]}>
        <mesh position={[crankLength / 2, 0, 0]}>
          <boxGeometry args={[crankLength, 0.15, 0.15]} />
          <meshStandardMaterial color="blue" />
        </mesh>
      </group>

      {/* Crank end point */}
      <mesh position={[Ax, Ay, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="green" />
      </mesh>

      {valid && (
        <>
          {/* Coupler */}
          <mesh position={[(Ax + Bx) / 2, (Ay + By) / 2, 0]} rotation={[0, 0, Math.atan2(By - Ay, Bx - Ax)]}>
            <boxGeometry args={[coupleLength, 0.15, 0.15]} />
            <meshStandardMaterial color="orange" />
          </mesh>

          {/* Follower */}
          <mesh position={[(Bx + fixedLength) / 2, By / 2, 0]} rotation={[0, 0, Math.atan2(By, Bx - fixedLength)]}>
            <boxGeometry args={[followerLength, 0.15, 0.15]} />
            <meshStandardMaterial color="purple" />
          </mesh>

          {/* Coupler point */}
          <mesh position={[Bx, By, 0]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="green" />
          </mesh>

          {/* Coupler curve trace */}
          <mesh position={[Bx, By, 0]}>
            <ringGeometry args={[0.05, 0.1, 16]} />
            <meshStandardMaterial color="yellow" transparent opacity={0.7} />
          </mesh>
        </>
      )}
    </group>
  )
}
