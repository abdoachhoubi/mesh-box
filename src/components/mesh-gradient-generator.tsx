"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { HexColorPicker } from "react-colorful"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Upload, FileJson, ImageIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface MeshPoint {
  id: string
  x: number
  y: number
  color: string
  radius: number
}

interface CanvasSize {
  width: number
  height: number
}

interface MeshGradientData {
  layout: {
    width: number
    height: number
    backgroundColor: string
  }
  points: {
    id: string
    x: number
    y: number
    color: string
    radius: number
  }[]
}

export default function MeshGradientGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [bgColor, setBgColor] = useState("#ffffff")
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 800, height: 500 })
  const [meshPoints, setMeshPoints] = useState<MeshPoint[]>([])
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("layout")

  // Generate a new mesh point
  const addMeshPoint = () => {
    const newPoint: MeshPoint = {
      id: `point-${Date.now()}`,
      x: Math.random() * canvasSize.width,
      y: Math.random() * canvasSize.height,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      radius: 150,
    }
    setMeshPoints([...meshPoints, newPoint])
    setSelectedPoint(newPoint.id)
    setActiveTab("points")
  }

  // Handle canvas mouse down for selecting or creating points
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if we clicked on an existing point
    const clickedPoint = meshPoints.find((point) => {
      const dx = point.x - x
      const dy = point.y - y
      return Math.sqrt(dx * dx + dy * dy) < 50 // 15px selection radius
    })

    if (clickedPoint) {
      setSelectedPoint(clickedPoint.id)
      setIsDragging(true)
    } else {
      setSelectedPoint(null)
    }
  }

  // Handle mouse move for dragging points
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedPoint) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setMeshPoints((points) => points.map((point) => (point.id === selectedPoint ? { ...point, x, y } : point)))
  }

  // Handle mouse up to stop dragging
  const handleCanvasMouseUp = () => {
    setIsDragging(false)
  }

  // Update point radius
  const updatePointRadius = (value: number[]) => {
    if (!selectedPoint) return

    setMeshPoints((points) =>
      points.map((point) => (point.id === selectedPoint ? { ...point, radius: value[0] } : point)),
    )
  }

  // Update point color
  const updatePointColor = (color: string) => {
    if (!selectedPoint) return

    setMeshPoints((points) => points.map((point) => (point.id === selectedPoint ? { ...point, color } : point)))
  }

  // Delete selected point
  const deleteSelectedPoint = () => {
    if (!selectedPoint) return

    setMeshPoints((points) => points.filter((point) => point.id !== selectedPoint))
    setSelectedPoint(null)
  }

  // Render the mesh gradient
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvasSize.width
    canvas.height = canvasSize.height

    // Clear canvas with background color
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // If no mesh points, return
    if (meshPoints.length === 0) return

    // Create a temporary canvas for blending
    const tempCanvas = document.createElement("canvas")
    tempCanvas.width = canvas.width
    tempCanvas.height = canvas.height
    const tempCtx = tempCanvas.getContext("2d")
    if (!tempCtx) return

    // Draw each mesh point as a radial gradient
    meshPoints.forEach((point) => {
      tempCtx.save()

      // Create radial gradient
      const gradient = tempCtx.createRadialGradient(point.x, point.y, 0, point.x, point.y, point.radius)

      gradient.addColorStop(0, point.color)
      gradient.addColorStop(1, "transparent")

      tempCtx.fillStyle = gradient
      tempCtx.globalCompositeOperation = "source-over"
      tempCtx.fillRect(0, 0, canvas.width, canvas.height)

      tempCtx.restore()
    })

    // Draw the temporary canvas onto the main canvas
    ctx.drawImage(tempCanvas, 0, 0)

    // Draw selection indicator for selected point
    if (selectedPoint) {
      const point = meshPoints.find((p) => p.id === selectedPoint)
      if (point) {
        ctx.beginPath()
        ctx.arc(point.x, point.y, 15, 0, Math.PI * 2)
        ctx.strokeStyle = "white"
        ctx.lineWidth = 2
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(point.x, point.y, 12, 0, Math.PI * 2)
        ctx.strokeStyle = "black"
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }
  }, [meshPoints, canvasSize, bgColor, selectedPoint])

  // Export as JSON
  const exportAsJson = () => {
    const data: MeshGradientData = {
      layout: {
        width: canvasSize.width,
        height: canvasSize.height,
        backgroundColor: bgColor,
      },
      points: meshPoints,
    }

    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = `mesh-gradient-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success("JSON Exported", {
      description: "Your gradient has been exported as JSON",
    })
  }

  // Export as image (PNG or JPG)
  const exportAsImage = (format: "png" | "jpg") => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Create a new canvas without the selection indicators
    const exportCanvas = document.createElement("canvas")
    exportCanvas.width = canvasSize.width
    exportCanvas.height = canvasSize.height
    const exportCtx = exportCanvas.getContext("2d")
    if (!exportCtx) return

    // Draw background
    exportCtx.fillStyle = bgColor
    exportCtx.fillRect(0, 0, canvasSize.width, canvasSize.height)

    // Draw mesh points
    meshPoints.forEach((point) => {
      exportCtx.save()

      const gradient = exportCtx.createRadialGradient(point.x, point.y, 0, point.x, point.y, point.radius)

      gradient.addColorStop(0, point.color)
      gradient.addColorStop(1, "transparent")

      exportCtx.fillStyle = gradient
      exportCtx.globalCompositeOperation = "source-over"
      exportCtx.fillRect(0, 0, canvasSize.width, canvasSize.height)

      exportCtx.restore()
    })

    // Convert to data URL
    const mimeType = format === "png" ? "image/png" : "image/jpeg"
    const quality = format === "png" ? 1 : 0.9
    const dataUrl = exportCanvas.toDataURL(mimeType, quality)

    // Create download link
    const link = document.createElement("a")
    link.href = dataUrl
    link.download = `mesh-gradient-${Date.now()}.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success(`${format.toUpperCase()} Exported`, {
      description: `Your gradient has been exported as ${format.toUpperCase()}`,
    })
  }

  // Handle JSON import
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string)

        // Validate JSON structure
        if (!validateImportedJson(json)) {
          toast.error("Invalid JSON Format", {
            description: "The imported file doesn't match the required format",
          })
          return
        }

        // Apply imported data
        setCanvasSize({
          width: json.layout.width,
          height: json.layout.height,
        })
        setBgColor(json.layout.backgroundColor)

        // Ensure each point has an ID
        const pointsWithIds = json.points.map((point: {
			id: string;
			x: number;
			y: number;
			color: string;
			radius: number;
		}) => ({
          ...point,
          id: point.id || `point-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        }))

        setMeshPoints(pointsWithIds)
        setSelectedPoint(null)

        toast.success("Import Successful", {
          description: "Your gradient has been imported and is ready to edit",
        })
      } catch (error) {
        toast.error("Import Failed", {
          description: "Failed to parse the imported file",
        })
		return error;
      }

      // Reset the input
      event.target.value = ""
    }

    reader.readAsText(file)
  }

  // Validate imported JSON
  const validateImportedJson = (json: 
	MeshGradientData
  ): json is MeshGradientData => {
    // Check layout
    if (
      !json.layout ||
      typeof json.layout.width !== "number" ||
      typeof json.layout.height !== "number" ||
      typeof json.layout.backgroundColor !== "string"
    ) {
      return false
    }

    // Check points array
    if (!Array.isArray(json.points)) {
      return false
    }

    // Check each point
    for (const point of json.points) {
      if (
        typeof point.x !== "number" ||
        typeof point.y !== "number" ||
        typeof point.color !== "string" ||
        typeof point.radius !== "number"
      ) {
        return false
      }
    }

    return true
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold">Mesh Gradient Generator</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Canvas Area */}
        <div className="flex-1 border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-move"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          />
        </div>

        {/* Controls */}
        <div className="w-full lg:w-80 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="points">Points</TabsTrigger>
            </TabsList>

            <TabsContent value="layout" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  type="number"
                  value={canvasSize.width}
                  onChange={(e) => setCanvasSize({ ...canvasSize, width: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  type="number"
                  value={canvasSize.height}
                  onChange={(e) => setCanvasSize({ ...canvasSize, height: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label>Background Color</Label>
                <Popover open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded border" style={{ backgroundColor: bgColor }} />
                        <span>{bgColor}</span>
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <HexColorPicker color={bgColor} onChange={setBgColor} />
                  </PopoverContent>
                </Popover>
              </div>
            </TabsContent>

            <TabsContent value="points" className="space-y-4">
              <Button onClick={addMeshPoint} className="w-full">
                Add Mesh Point
              </Button>

              {selectedPoint ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Point Color</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-4 w-4 rounded border"
                              style={{
                                backgroundColor: meshPoints.find((p) => p.id === selectedPoint)?.color,
                              }}
                            />
                            <span>{meshPoints.find((p) => p.id === selectedPoint)?.color}</span>
                          </div>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <HexColorPicker
                          color={meshPoints.find((p) => p.id === selectedPoint)?.color}
                          onChange={updatePointColor}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Radius</Label>
                      <span className="text-sm text-gray-500">
                        {meshPoints.find((p) => p.id === selectedPoint)?.radius}px
                      </span>
                    </div>
                    <Slider
                      value={[meshPoints.find((p) => p.id === selectedPoint)?.radius || 150]}
                      min={50}
                      max={500}
                      step={1}
                      onValueChange={updatePointRadius}
                    />
                  </div>

                  <Button variant="destructive" onClick={deleteSelectedPoint} className="w-full">
                    Delete Point
                  </Button>
                </div>
              ) : (
                <div className="text-center text-gray-500 p-4">
                  {meshPoints.length > 0 ? "Select a point to edit its properties" : "Add a point to get started"}
                </div>
              )}

              {meshPoints.length > 0 && (
                <div className="text-xs text-gray-500 mt-2">Tip: Click and drag points to move them</div>
              )}
            </TabsContent>
          </Tabs>
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-2">Export & Import</h3>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => exportAsImage("png")}>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    PNG Image
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportAsImage("jpg")}>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    JPG Image
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportAsJson}>
                    <FileJson className="h-4 w-4 mr-2" />
                    JSON Data
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="relative flex-1">
                <Button variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Import JSON
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

