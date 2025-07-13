import type React from "react"

export const LineChart = ({ children, data }: { children: React.ReactNode; data: any[] }) => {
  return (
    <svg width="100%" height="100%" viewBox={`0 0 600 400`}>
      {children}
    </svg>
  )
}

export const Line = ({
  type,
  dataKey,
  stroke,
  name,
  dot,
}: { type: string; dataKey: string; stroke: string; name: string; dot: boolean }) => {
  return <path d="M0,0" stroke={stroke} />
}

export const XAxis = ({ dataKey, label }: { dataKey: string; label: any }) => {
  return <text>XAxis</text>
}

export const YAxis = ({ label }: { label: any }) => {
  return <text>YAxis</text>
}

export const CartesianGrid = ({ strokeDasharray }: { strokeDasharray: string }) => {
  return <rect width="100%" height="100%" fill="none" stroke="#ccc" strokeDasharray={strokeDasharray} />
}

export const Tooltip = () => {
  return <text>Tooltip</text>
}

export const Legend = () => {
  return <text>Legend</text>
}

export const ResponsiveContainer = ({
  children,
  width,
  height,
}: { children: React.ReactNode; width: string; height: string }) => {
  return <div>{children}</div>
}
