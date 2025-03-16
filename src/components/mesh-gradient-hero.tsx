"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"

interface MeshPoint {
  id: string
  x: number
  y: number
  color: string
  radius: number
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
      color: "#FF5E5B",
      radius: 200,
    },
    {
      id: "point-2",
      x: 400,
      y: 150,
      color: "#39A0ED",
      radius: 250,
    },
    {
      id: "point-3",
      x: 250,
      y: 300,
      color: "#8A4FFF",
      radius: 200,
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
    }

    // Initial resize
    resizeCanvas()

    // Set up resize observer
    const resizeObserver = new ResizeObserver(resizeCanvas)
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement)
    }

    // Clear canvas with background color
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

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
      const gradient = tempCtx.createRadialGradient(
        point.x * 2,
        point.y * 2,
        0,
        point.x * 2,
        point.y * 2,
        point.radius * 2,
      )

      gradient.addColorStop(0, point.color)
      gradient.addColorStop(1, "transparent")

      tempCtx.fillStyle = gradient
      tempCtx.globalCompositeOperation = "source-over"
      tempCtx.fillRect(0, 0, canvas.width, canvas.height)

      tempCtx.restore()
    })

    // Draw the temporary canvas onto the main canvas
    ctx.drawImage(tempCanvas, 0, 0)

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

