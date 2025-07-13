import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Cog, Beaker, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Mechanism Design Suite</CardTitle>
          <Cog className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4">
            Design and simulate mechanical linkages, gear trains, and more with real-time animation and analysis.
          </CardDescription>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md border p-2 text-center">
              <h3 className="font-medium">Four-Bar Linkage</h3>
            </div>
            <div className="rounded-md border p-2 text-center">
              <h3 className="font-medium">Slider-Crank</h3>
            </div>
            <div className="rounded-md border p-2 text-center">
              <h3 className="font-medium">Gear Trains</h3>
            </div>
            <div className="rounded-md border p-2 text-center">
              <h3 className="font-medium">Cam Mechanisms</h3>
            </div>
          </div>
          <Button className="mt-4 w-full" asChild>
            <Link href="?tab=mechanism">
              Open Suite <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Virtual Lab</CardTitle>
          <Beaker className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4">
            Perform virtual mechanical experiments with interactive 3D simulations, data analysis, and result
            visualization.
          </CardDescription>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md border p-2 text-center">
              <h3 className="font-medium">Beam Deflection</h3>
            </div>
            <div className="rounded-md border p-2 text-center">
              <h3 className="font-medium">Tensile Testing</h3>
            </div>
            <div className="rounded-md border p-2 text-center">
              <h3 className="font-medium">Heat Conduction</h3>
            </div>
            <div className="rounded-md border p-2 text-center">
              <h3 className="font-medium">Torsion Test</h3>
            </div>
          </div>
          <Button className="mt-4 w-full" asChild>
            <Link href="?tab=lab">
              Open Lab <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Simulations (KOM & Fluid)</CardTitle>
          <Beaker className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4">
            Explore interactive experiments in Kinematics of Machines and Fluid Dynamics with real-time 2D/3D animations and analysis.
          </CardDescription>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md border p-2 text-center"><h3 className="font-medium">Slider-Crank</h3></div>
            <div className="rounded-md border p-2 text-center"><h3 className="font-medium">Four-Bar Linkage</h3></div>
            <div className="rounded-md border p-2 text-center"><h3 className="font-medium">Bernoulli’s Theorem</h3></div>
            <div className="rounded-md border p-2 text-center"><h3 className="font-medium">Reynolds Number</h3></div>
          </div>
          <Button className="mt-4 w-full" asChild>
            <Link href="/simulations">
              Open Simulations <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">CAD Modeling</CardTitle>
          <Cog className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4">
            Sketch and model mechanisms in 2D/3D. Convert sketches to mechanisms and simulate them instantly.
          </CardDescription>
          <div className="rounded-md border p-2 text-center mb-2"><h3 className="font-medium">2D Sketcher</h3></div>
          <div className="rounded-md border p-2 text-center mb-2"><h3 className="font-medium">3D Mechanism Modeler</h3></div>
          <Button className="mt-2 w-full" asChild>
            <Link href="/cad">
              Open CAD <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">AI Assistant</CardTitle>
          <Cog className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4">
            Ask questions, generate new designs, get explanations, and auto-generate quizzes with the integrated AI assistant.
          </CardDescription>
          <div className="rounded-md border p-2 text-center mb-2"><h3 className="font-medium">Prompt-based Learning</h3></div>
          <div className="rounded-md border p-2 text-center mb-2"><h3 className="font-medium">Quiz Generator</h3></div>
          <Button className="mt-2 w-full" asChild>
            <Link href="/ai-assistant">
              Open AI Assistant <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
