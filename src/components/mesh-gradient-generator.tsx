"use client"

import type React from "react"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { HexColorPicker } from "react-colorful"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Upload, FileJson, ImageIcon, Plus, Minus } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"

interface MeshPoint {
  id: string
  x: number
  y: number
  color: string
  radius: number
  blur: number
  opacity: number
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
    quality: number
  }
  points: {
    id: string
    x: number
    y: number
    color: string
    radius: number
    blur: number
    opacity: number
  }[]
}

export default function MeshGradientGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [bgColor, setBgColor] = useState("#000000")
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 800, height: 500 })
  const [meshPoints, setMeshPoints] = useState<MeshPoint[]>([])
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("layout")
  const [renderQuality, setRenderQuality] = useState(2) // Higher = better quality
  const [showPointIndicators, setShowPointIndicators] = useState(true)
  const [useGaussianBlur, setUseGaussianBlur] = useState(true)

  // Generate a new mesh point
  const addMeshPoint = () => {
    const newPoint: MeshPoint = {
      id: `point-${Date.now()}`,
      x: Math.random() * canvasSize.width,
      y: Math.random() * canvasSize.height,
      color: "#6b46c1", // Deep purple
      radius: 300,
      blur: 0.4,
      opacity: 0.8,
    }
    setMeshPoints([...meshPoints, newPoint])
    setSelectedPoint(newPoint.id)
    setActiveTab("points")
  }

  // Add example gradient
  const addExampleGradient = useCallback(() => {
	const width = canvasSize.width;
	const height = canvasSize.height;
  
	setBgColor("#000000");
	setMeshPoints([
	  {
		id: "point-1",
		x: width * 0.7,
		y: height * 0.8,
		color: "#6b46c1",
		radius: width * 0.6,
		blur: 0.4,
		opacity: 0.9,
	  },
	  {
		id: "point-2",
		x: width * 0.3,
		y: height * 0.9,
		color: "#9f7aea",
		radius: width * 0.5,
		blur: 0.5,
		opacity: 0.8,
	  },
	  {
		id: "point-3",
		x: width * 0.5,
		y: height * 0.2,
		color: "#000000",
		radius: width * 0.7,
		blur: 0.6,
		opacity: 0.9,
	  },
	]);
  }, [canvasSize]);

  // Handle canvas mouse down for selecting or creating points
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()

    // Calculate the scaling factor between the canvas display size and its internal dimensions
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    // Apply scaling to get the correct coordinates
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    // Check if we clicked on an existing point
    const clickedPoint = meshPoints.find((point) => {
      const dx = point.x - x
      const dy = point.y - y
      return Math.sqrt(dx * dx + dy * dy) < 100
    })

    if (clickedPoint) {
		console.log(clickedPoint);
		
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

    // Calculate the scaling factor between the canvas display size and its internal dimensions
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    // Apply scaling to get the correct coordinates
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

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

  // Update point blur
  const updatePointBlur = (value: number[]) => {
    if (!selectedPoint) return

    setMeshPoints((points) =>
      points.map((point) => (point.id === selectedPoint ? { ...point, blur: value[0] } : point)),
    )
  }

  // Update point opacity
  const updatePointOpacity = (value: number[]) => {
    if (!selectedPoint) return

    setMeshPoints((points) =>
      points.map((point) => (point.id === selectedPoint ? { ...point, opacity: value[0] } : point)),
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

  // Apply Gaussian blur to a canvas
  const applyGaussianBlur = (canvas: HTMLCanvasElement, radius: number) => {
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Create a temporary canvas
    const tempCanvas = document.createElement("canvas")
    tempCanvas.width = canvas.width
    tempCanvas.height = canvas.height
    const tempCtx = tempCanvas.getContext("2d")
    if (!tempCtx) return

    // Copy the original canvas to the temporary canvas
    tempCtx.drawImage(canvas, 0, 0)

    // Apply horizontal blur
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.filter = `blur(${radius}px)`
    ctx.drawImage(tempCanvas, 0, 0)
    ctx.restore()

    // Clean up
    tempCanvas.remove()
  }

  // Initialize with default points
  useEffect(() => {
    if (meshPoints.length === 0) {
      addExampleGradient();
    }
  }, [meshPoints.length, addExampleGradient])

  // Render the mesh gradient
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Function to handle canvas resizing
    const resizeCanvas = () => {
      const canvasContainer = canvas.parentElement
      if (!canvasContainer) return

      // Get the container's dimensions
      const containerWidth = canvasContainer.clientWidth
      const containerHeight = canvasContainer.clientHeight

      // Set the canvas display size to match the container
      canvas.style.width = `${containerWidth}px`
      canvas.style.height = `${containerHeight}px`

      // Set the canvas internal dimensions to match our state with quality multiplier
      canvas.width = canvasSize.width * renderQuality
      canvas.height = canvasSize.height * renderQuality
      
      // Redraw everything when canvas size changes
      drawCanvas()
    }

    // Function to draw the canvas content
    const drawCanvas = () => {
      // Clear canvas with background color
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw each mesh point as a radial gradient
      meshPoints.forEach((point) => {
        const scaledX = point.x * renderQuality
        const scaledY = point.y * renderQuality
        const scaledRadius = point.radius * renderQuality

        const gradient = ctx.createRadialGradient(scaledX, scaledY, 0, scaledX, scaledY, scaledRadius)

        // Create color with opacity
        const rgbaColor = hexToRgba(point.color, point.opacity)

        gradient.addColorStop(0, rgbaColor)
        gradient.addColorStop(1, "rgba(0,0,0,0)")

        // Fill with gradient
        ctx.save()
        ctx.fillStyle = gradient
        ctx.globalCompositeOperation = "lighter"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.restore()
      })

      // Draw selection indicator for selected point if enabled
      if (showPointIndicators && selectedPoint) {
        const point = meshPoints.find((p) => p.id === selectedPoint)
        if (point) {
          const scaledX = point.x * renderQuality
          const scaledY = point.y * renderQuality

          ctx.beginPath()
          ctx.arc(scaledX, scaledY, 15 * renderQuality, 0, Math.PI * 2)
          ctx.strokeStyle = "white"
          ctx.lineWidth = 2 * renderQuality
          ctx.stroke()

          ctx.beginPath()
          ctx.arc(scaledX, scaledY, 12 * renderQuality, 0, Math.PI * 2)
          ctx.strokeStyle = "black"
          ctx.lineWidth = 1 * renderQuality
          ctx.stroke()
        }
      }
    }

    // Initial resize
    resizeCanvas()

    // Set up resize observer
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas()
    })
    
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement)
    }

    // Draw the canvas initially
    drawCanvas()

    // Cleanup
    return () => {
      resizeObserver.disconnect()
    }
  }, [meshPoints, canvasSize, bgColor, selectedPoint, renderQuality, showPointIndicators, useGaussianBlur])

  // Helper function to convert hex to rgba
  const hexToRgba = (hex: string, opacity: number): string => {
    try {
      hex = hex.replace("#", "")

      // Handle shorthand hex
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
      }

      const r = Number.parseInt(hex.substring(0, 2), 16)
      const g = Number.parseInt(hex.substring(2, 4), 16)
      const b = Number.parseInt(hex.substring(4, 6), 16)

      if (isNaN(r) || isNaN(g) || isNaN(b)) {
        return `rgba(107, 70, 193, ${opacity})`
      }

      return `rgba(${r}, ${g}, ${b}, ${opacity})`
    } catch (error) {
		console.log(error);
      return `rgba(107, 70, 193, ${opacity})`
    }
  }

  // Export as JSON
  const exportAsJson = () => {
    const data: MeshGradientData = {
      layout: {
        width: canvasSize.width,
        height: canvasSize.height,
        backgroundColor: bgColor,
        quality: renderQuality,
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
    exportCanvas.width = canvasSize.width * renderQuality
    exportCanvas.height = canvasSize.height * renderQuality
    const exportCtx = exportCanvas.getContext("2d")
    if (!exportCtx) return

    // Draw background
    exportCtx.fillStyle = bgColor
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height)

    // Create a temporary canvas for blending
    const tempCanvas = document.createElement("canvas")
    tempCanvas.width = exportCanvas.width
    tempCanvas.height = exportCanvas.height
    const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true })
    if (!tempCtx) return

    // Fill temp canvas with background color
    tempCtx.fillStyle = bgColor
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)

    // Draw each mesh point as a radial gradient
    meshPoints.forEach((point) => {
      // Create a separate canvas for each point to apply individual blur
      const pointCanvas = document.createElement("canvas")
      pointCanvas.width = tempCanvas.width
      pointCanvas.height = tempCanvas.height
      const pointCtx = pointCanvas.getContext("2d")
      if (!pointCtx) return

      // Create radial gradient
      const scaledX = point.x * renderQuality
      const scaledY = point.y * renderQuality
      const scaledRadius = point.radius * renderQuality

      const gradient = pointCtx.createRadialGradient(scaledX, scaledY, 0, scaledX, scaledY, scaledRadius)

      // Create color with opacity
      const color = point.color
      const rgbaColor = hexToRgba(color, point.opacity)

      gradient.addColorStop(0, rgbaColor)
      gradient.addColorStop(1, "rgba(0,0,0,0)")

      // Fill the point canvas with the gradient
      pointCtx.fillStyle = gradient
      pointCtx.fillRect(0, 0, pointCanvas.width, pointCanvas.height)

      // Apply blur if enabled
      if (useGaussianBlur && point.blur > 0) {
        const blurAmount = point.blur * 50 * renderQuality
        applyGaussianBlur(pointCanvas, blurAmount)
      }

      // Blend the point onto the temp canvas
      tempCtx.globalCompositeOperation = "lighter"
      tempCtx.drawImage(pointCanvas, 0, 0)
    })

    // Draw the temporary canvas onto the export canvas
    exportCtx.drawImage(tempCanvas, 0, 0)

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

        if (json.layout.quality) {
          setRenderQuality(json.layout.quality)
        }

        // Ensure each point has all required properties
        const pointsWithDefaults = json.points.map((point: MeshPoint) => ({
          id: point.id || `point-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          x: point.x,
          y: point.y,
          color: point.color,
          radius: point.radius,
          blur: point.blur !== undefined ? point.blur : 0.4,
          opacity: point.opacity !== undefined ? point.opacity : 0.8,
        }))

        setMeshPoints(pointsWithDefaults)
        setSelectedPoint(null)

        toast.success("Import Successful", {
          description: "Your gradient has been imported and is ready to edit",
        })
      } catch (error) {
        toast.error("Import Failed", {
          description: "Failed to parse the imported file",
        })
		return error
      }

      // Reset the input
      event.target.value = ""
    }

    reader.readAsText(file)
  }

  // Validate imported JSON
  const validateImportedJson = (json: MeshGradientData) => {
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
        <div
          className="flex-1 border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900"
          style={{ height: "500px" }}
        >
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

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Render Quality</Label>
                  <span className="text-sm text-gray-500">{renderQuality}x</span>
                </div>
                <Slider
                  value={[renderQuality]}
                  min={1}
                  max={4}
                  step={1}
                  onValueChange={(value) => setRenderQuality(value[0])}
                />
              </div>

              <div className="flex items-center justify-between space-y-0 pt-2">
                <Label htmlFor="show-indicators">Show Point Indicators</Label>
                <Switch id="show-indicators" checked={showPointIndicators} onCheckedChange={setShowPointIndicators} />
              </div>

              <div className="flex items-center justify-between space-y-0 pt-2">
                <Label htmlFor="use-blur">Use Gaussian Blur</Label>
                <Switch id="use-blur" checked={useGaussianBlur} onCheckedChange={setUseGaussianBlur} />
              </div>
            </TabsContent>

            <TabsContent value="points" className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={addMeshPoint} className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Point
                </Button>
                <Button variant="outline" onClick={addExampleGradient} className="flex-1">
                  Load Example
                </Button>
              </div>

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
                      max={800}
                      step={1}
                      onValueChange={updatePointRadius}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Blur</Label>
                      <span className="text-sm text-gray-500">
                        {(meshPoints.find((p) => p.id === selectedPoint)?.blur || 0).toFixed(1)}
                      </span>
                    </div>
                    <Slider
                      value={[meshPoints.find((p) => p.id === selectedPoint)?.blur || 0]}
                      min={0}
                      max={1}
                      step={0.1}
                      onValueChange={updatePointBlur}
                      disabled={!useGaussianBlur}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Opacity</Label>
                      <span className="text-sm text-gray-500">
                        {(meshPoints.find((p) => p.id === selectedPoint)?.opacity || 1).toFixed(1)}
                      </span>
                    </div>
                    <Slider
                      value={[meshPoints.find((p) => p.id === selectedPoint)?.opacity || 1]}
                      min={0.1}
                      max={1}
                      step={0.1}
                      onValueChange={updatePointOpacity}
                    />
                  </div>

                  <Button variant="destructive" onClick={deleteSelectedPoint} className="w-full">
                    <Minus className="h-4 w-4 mr-2" />
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
