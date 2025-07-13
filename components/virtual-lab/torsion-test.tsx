"use client"

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
  steel: {
    name: "Steel",
    shearModulus: 80, // GPa
    yieldStrength: 250, // MPa
    color: "#71717a",
  },
  aluminum: {
    name: "Aluminum",
    shearModulus: 26,
    yieldStrength: 95,
    color: "#94a3b8",
  },
  brass: {
    name: "Brass",
    shearModulus: 39,
    yieldStrength: 160,
    color: "#ca8a04",
  },
  titanium: {
    name: "Titanium",
    shearModulus: 44,
    yieldStrength: 380,
    color: "#64748b",
  },
}

export default function TorsionTest() {
  // Parameters for the torsion test experiment
  const [params, setParams] = useState({
    diameter: 10, // mm
    length: 200, // mm
    material: "steel",
    torque: 0, // N·m
    maxTorque: 50, // N·m
  })

  const [isAnimating, setIsAnimating] = useState(false)
  const [torqueAngleData, setTorqueAngleData] = useState<{ torque: number; angle: number }[]>([])
  const [currentAngle, setCurrentAngle] = useState(0) // degrees
  const [currentStage, setCurrentStage] = useState("elastic") // elastic, plastic, failure

  const animationRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)

  // Handle parameter changes
  const handleParamChange = (param: string, value: any) => {
    setParams((prev) => ({ ...prev, [param]: value }))

    // Reset the test if material or dimensions change
    if (param !== "torque") {
      setTorqueAngleData([])
      setCurrentAngle(0)
      setCurrentStage("elastic")
    } else {
      // Calculate angle for current torque
      calculateAngle(value)
    }
  }

  // Toggle animation
  const toggleAnimation = () => {
    setIsAnimating(!isAnimating)
  }

  // Reset the test
  const resetTest = () => {
    setTorqueAngleData([])
    setCurrentAngle(0)
    setCurrentStage("elastic")
    setParams((prev) => ({ ...prev, torque: 0 }))
    setIsAnimating(false)
  }

  // Calculate angle of twist for a given torque
  const calculateAngle = (torque: number) => {
    const { diameter, length, material } = params
    const materialProps = materials[material]

    // Convert units
    const radius = diameter / 2 / 1000 // mm to m
    const L = length / 1000 // mm to m
    const G = materialProps.shearModulus * 1e9 // GPa to Pa

    // Polar moment of inertia
    const J = (Math.PI * Math.pow(radius, 4)) / 2 // m^4

    // Maximum shear stress
    const maxShearStress = (torque * radius) / J // Pa

    // Yield torque
    const yieldTorque = (materialProps.yieldStrength * 1e6 * J) / radius // N·m

    let angle = 0

    if (torque <= yieldTorque) {
      // Elastic region (linear)
      angle = (torque * L) / (G * J) // radians
      setCurrentStage("elastic")
    } else if (torque <= yieldTorque * 1.5) {
      // Plastic region (non-linear)
      const elasticAngle = (yieldTorque * L) / (G * J)
      const plasticFactor = 1 + Math.pow((torque - yieldTorque) / (0.5 * yieldTorque), 2)
      angle = elasticAngle * plasticFactor
      setCurrentStage("plastic")
    } else {
      // Failure region (rapid increase)
      const elasticAngle = (yieldTorque * L) / (G * J)
      const plasticAngle = elasticAngle * 1 + Math.pow(0.5, 2)
      const failureFactor = 1 + Math.pow((torque - yieldTorque * 1.5) / (0.1 * yieldTorque), 3)
      angle = plasticAngle * failureFactor
      setCurrentStage("failure")
    }

    // Convert to degrees
    angle = angle * (180 / Math.PI)
    setCurrentAngle(angle)

    // Add point to torque-angle curve
    if (torqueAngleData.length === 0 || torque > torqueAngleData[torqueAngleData.length - 1].torque) {
      setTorqueAngleData((prev) => [...prev, { torque, angle }])
    }
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

      // Increase torque gradually
      setParams((prev) => {
        const torqueIncrement = deltaTime * 5 // N·m per second
        const newTorque = Math.min(prev.torque + torqueIncrement, prev.maxTorque)

        // Stop animation if we reach max torque
        if (newTorque >= prev.maxTorque) {
          setIsAnimating(false)
        }

        return { ...prev, torque: newTorque }
      })

      // Calculate angle for current torque
      calculateAngle(params.torque + deltaTime * 5)

      if (isAnimating) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isAnimating, params.torque, params.maxTorque])

  // Calculate polar moment of inertia
  const calculatePolarMomentOfInertia = () => {
    const radius = params.diameter / 2 / 1000 // mm to m
    return (Math.PI * Math.pow(radius, 4)) / 2 // m^4
  }

  // Calculate maximum shear stress
  const calculateMaxShearStress = () => {
    const radius = params.diameter / 2 / 1000 // mm to m
    const J = calculatePolarMomentOfInertia()
    return (params.torque * radius) / J // Pa
  }

  // Calculate yield torque
  const calculateYieldTorque = () => {
    const radius = params.diameter / 2 / 1000 // mm to m
    const J = calculatePolarMomentOfInertia()
    return (materials[params.material].yieldStrength * 1e6 * J) / radius // N·m
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
                    {material.name} (G = {material.shearModulus} GPa)
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
                min={100}
                max={500}
                step={50}
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
            <Label htmlFor="maxTorque">Maximum Torque: {params.maxTorque} N·m</Label>
            <div className="flex items-center space-x-2">
              <Slider
                id="maxTorque"
                min={10}
                max={100}
                step={5}
                value={[params.maxTorque]}
                onValueChange={(value) => handleParamChange("maxTorque", value[0])}
              />
              <Input
                type="number"
                value={params.maxTorque}
                onChange={(e) => handleParamChange("maxTorque", Number.parseFloat(e.target.value))}
                className="w-20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="torque">Applied Torque: {params.torque.toFixed(2)} N·m</Label>
            <div className="flex items-center space-x-2">
              <Slider
                id="torque"
                min={0}
                max={params.maxTorque}
                step={0.5}
                value={[params.torque]}
                onValueChange={(value) => handleParamChange("torque", value[0])}
                disabled={isAnimating}
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button onClick={toggleAnimation} disabled={params.torque >= params.maxTorque}>
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
            <Canvas camera={{ position: [0, 0.2, 0.5], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[0.2, 0.2, 0.2]} />
              <TorsionSpecimen
                diameter={params.diameter}
                length={params.length}
                angle={currentAngle}
                material={params.material}
                stage={currentStage}
              />
              <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
              <gridHelper args={[1, 10]} />
            </Canvas>
          </div>

          <div className="mt-4 p-4 border rounded-md bg-muted/50">
            <h3 className="font-medium mb-2">Torsion Equations:</h3>
            <div className="text-sm space-y-1">
              <p>Angle of Twist: θ = TL/(GJ)</p>
              <p>Maximum Shear Stress: τ = Tr/J</p>
              <p>Polar Moment of Inertia: J = πr⁴/2 = {calculatePolarMomentOfInertia().toExponential(4)} m⁴</p>
              <p>Yield Torque: {calculateYieldTorque().toFixed(2)} N·m</p>
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
              <LineChart data={torqueAngleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="angle" label={{ value: "Angle (degrees)", position: "insideBottomRight", offset: 0 }} />
                <YAxis dataKey="torque" label={{ value: "Torque (N·m)", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="torque" stroke="#8884d8" name="Torque-Angle Curve" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-4 border rounded-md bg-muted/50">
            <h3 className="font-medium mb-2">Current Values:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="font-medium">Torque:</p>
                <p>{params.torque.toFixed(2)} N·m</p>
              </div>
              <div>
                <p className="font-medium">Angle of Twist:</p>
                <p>{currentAngle.toFixed(2)}°</p>
              </div>
              <div>
                <p className="font-medium">Max Shear Stress:</p>
                <p>{(calculateMaxShearStress() / 1e6).toFixed(2)} MPa</p>
              </div>
              <div>
                <p className="font-medium">Deformation Stage:</p>
                <p className="capitalize">{currentStage}</p>
              </div>
              <div>
                <p className="font-medium">Shear Modulus:</p>
                <p>{materials[params.material].shearModulus} GPa</p>
              </div>
              <div>
                <p className="font-medium">Torsional Stiffness:</p>
                <p>{(params.torque / ((currentAngle * Math.PI) / 180)).toFixed(2)} N·m/rad</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Three.js component for the torsion specimen visualization
function TorsionSpecimen({ diameter, length, angle, material, stage }) {
  // Scale for visualization
  const scaledLength = (length / 1000) * 0.8
  const scaledDiameter = (diameter / 1000) * 0.8

  // Number of segments to show twist
  const segments = 10

  // Create segments with progressive twist
  const renderSegments = () => {
    const segmentLength = scaledLength / segments
    const segmentElements = []

    for (let i = 0; i < segments; i++) {
      // Progressive twist angle
      const segmentAngle = ((angle * Math.PI) / 180) * (i / segments)
      const position = [-scaledLength / 2 + (i + 0.5) * segmentLength, 0, 0]

      // Add fracture effect for failure stage
      let segmentDiameter = scaledDiameter
      if (stage === "failure" && i === Math.floor(segments / 2)) {
        segmentDiameter = scaledDiameter * 0.7 // Necking at failure point
      }

      segmentElements.push(
        <mesh key={i} position={position} rotation={[0, 0, segmentAngle]}>
          <cylinderGeometry
            args={[segmentDiameter / 2, segmentDiameter / 2, segmentLength * 0.9, 16]}
            rotation={[Math.PI / 2, 0, 0]}
          />
          <meshStandardMaterial color={materials[material].color} />
        </mesh>,
      )

      // Add twist lines to visualize the torsion
      if (i % 2 === 0) {
        segmentElements.push(
          <mesh key={`line-${i}`} position={position} rotation={[0, 0, segmentAngle]}>
            <boxGeometry args={[segmentLength * 0.9, scaledDiameter * 1.01, 0.001]} />
            <meshStandardMaterial color="black" />
          </mesh>,
        )
      }
    }

    return segmentElements
  }

  return (
    <group>
      {/* Specimen segments */}
      {renderSegments()}

      {/* Fixed end */}
      <mesh position={[-scaledLength / 2 - 0.02, 0, 0]}>
        <cylinderGeometry
          args={[scaledDiameter * 0.8, scaledDiameter * 0.8, 0.02, 16]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        <meshStandardMaterial color="gray" />
      </mesh>

      {/* Rotating end */}
      <mesh position={[scaledLength / 2 + 0.02, 0, 0]} rotation={[0, 0, (angle * Math.PI) / 180]}>
        <cylinderGeometry
          args={[scaledDiameter * 0.8, scaledDiameter * 0.8, 0.02, 16]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        <meshStandardMaterial color="gray" />
      </mesh>

      {/* Torque arrow */}
      <mesh position={[scaledLength / 2 + 0.05, 0, 0]} rotation={[0, 0, (angle * Math.PI) / 180]}>
        <torusGeometry args={[scaledDiameter * 0.6, 0.005, 16, 32, Math.PI * 1.5]} />
        <meshStandardMaterial color="red" />
      </mesh>

      {/* Arrow head */}
      <mesh
        position={[scaledLength / 2 + 0.05, scaledDiameter * 0.6, 0]}
        rotation={[0, 0, (angle * Math.PI) / 180 + Math.PI / 4]}
      >
        <coneGeometry args={[0.01, 0.02, 8]} />
        <meshStandardMaterial color="red" />
      </mesh>
    </group>
  )
}
