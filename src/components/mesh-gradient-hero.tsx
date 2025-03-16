"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"

interface MeshPoint {
  id: string
  x: number
  y: number
  color: string
  radius: number
  blur: number
  opacity: number
}

interface MeshGradientHeroProps {
  interactive?: boolean
}

export default function MeshGradientHero({ interactive = false }: MeshGradientHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [meshPoints, setMeshPoints] = useState<MeshPoint[]>([
    {
      id: "point-1",
      x: 150,
      y: 100,
      color: "#6b46c1", // Deep purple
      radius: 300,
      blur: 0.4,
      opacity: 0.9,
    },
    {
      id: "point-2",
      x: 400,
      y: 150,
      color: "#9f7aea", // Medium purple
      radius: 250,
      blur: 0.5,
      opacity: 0.8,
    },
    {
      id: "point-3",
      x: 250,
      y: 300,
      color: "#000000", // Black
      radius: 350,
      blur: 0.6,
      opacity: 0.9,
    },
  ])
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const animationFrameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)

  // Animate the mesh points
  useEffect(() => {
    if (!interactive) {
      const animate = (time: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = time
        // const deltaTime = time - lastTimeRef.current
        // lastTimeRef.current = time

        setMeshPoints((prevPoints) =>
          prevPoints.map((point) => {
            // Create a gentle floating animation for each point
            const newX = point.x + Math.sin(time * 0.001 + Number.parseInt(point.id.split("-")[1])) * 0.5
            const newY = point.y + Math.cos(time * 0.001 + Number.parseInt(point.id.split("-")[1]) * 0.7) * 0.5
            return {
              ...point,
              x: newX,
              y: newY,
            }
          }),
        )

        animationFrameRef.current = requestAnimationFrame(animate)
      }

      animationFrameRef.current = requestAnimationFrame(animate)

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }
    }
  }, [interactive])

  // Handle canvas mouse down for selecting or creating points
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return

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
      return Math.sqrt(dx * dx + dy * dy) < 15 // 15px selection radius
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
    if (!interactive || !isDragging || !selectedPoint) return

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
    if (!interactive) return
    setIsDragging(false)
  }

  // Apply Gaussian blur to a canvas
//   const applyGaussianBlur = (canvas: HTMLCanvasElement, radius: number) => {
//     const ctx = canvas.getContext("2d")
//     if (!ctx) return

//     // Create a temporary canvas
//     const tempCanvas = document.createElement("canvas")
//     tempCanvas.width = canvas.width
//     tempCanvas.height = canvas.height
//     const tempCtx = tempCanvas.getContext("2d")
//     if (!tempCtx) return

//     // Copy the original canvas to the temporary canvas
//     tempCtx.drawImage(canvas, 0, 0)

//     // Apply horizontal blur
//     ctx.clearRect(0, 0, canvas.width, canvas.height)
//     ctx.save()
//     ctx.filter = `blur(${radius}px)`
//     ctx.drawImage(tempCanvas, 0, 0)
//     ctx.restore()

//     // Clean up
//     tempCanvas.remove()
//   }

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

      // Set the canvas internal dimensions
      canvas.width = containerWidth * 2 // Higher resolution for better quality
      canvas.height = containerHeight * 2

      // Redraw everything when canvas size changes
      drawCanvas()
    }

    // Function to draw the canvas content
    const drawCanvas = () => {
      // Clear canvas with background color
      ctx.fillStyle = "#000000"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw each mesh point as a radial gradient
      meshPoints.forEach((point) => {
        const scaledX = point.x * 2
        const scaledY = point.y * 2
        const scaledRadius = point.radius * 2

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

      // Draw selection indicator for selected point if interactive
      if (interactive && selectedPoint) {
        const point = meshPoints.find((p) => p.id === selectedPoint)
        if (point) {
          ctx.beginPath()
          ctx.arc(point.x * 2, point.y * 2, 30, 0, Math.PI * 2)
          ctx.strokeStyle = "white"
          ctx.lineWidth = 4
          ctx.stroke()

          ctx.beginPath()
          ctx.arc(point.x * 2, point.y * 2, 24, 0, Math.PI * 2)
          ctx.strokeStyle = "black"
          ctx.lineWidth = 2
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
  }, [meshPoints, selectedPoint, interactive])

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${interactive ? "cursor-move" : ""}`}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onMouseLeave={handleCanvasMouseUp}
    />
  )
}

