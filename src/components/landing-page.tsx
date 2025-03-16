"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Download, Github, Layers, Palette, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import MeshGradientHero from "./mesh-gradient-hero"
import MeshGradientGenerator from "./mesh-gradient-generator"

export default function LandingPage() {
  const [showFullGenerator, setShowFullGenerator] = useState(false)

  return (
    <div className="flex flex-col min-h-screen w-full items-center">
      {/* Navigation */}
      <header className="container border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Layers className="h-6 w-6" />
            <span className="text-xl font-bold">MeshBox</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:underline underline-offset-4">
              How It Works
            </Link>
            <Link href="#generator" className="text-sm font-medium hover:underline underline-offset-4">
              Try It
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/abdoachhoubi/mesh-box"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="icon">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Button>
            </Link>
            <Button>Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_600px] lg:gap-12 xl:grid-cols-[1fr_800px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Create Beautiful Mesh Gradients
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Design stunning, silky-smooth mesh gradients for your projects with our intuitive, browser-based tool.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" asChild>
                  <Link href="#generator">
                    Try It Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="mx-auto aspect-video overflow-hidden rounded-xl border bg-background object-cover shadow-xl">
              <MeshGradientHero />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Features</div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Everything You Need to Create Perfect Gradients
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our mesh gradient generator provides all the tools you need to create stunning visual effects for your
                designs.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3 lg:gap-12">
            <div className="flex flex-col items-center space-y-2 rounded-lg p-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Palette className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Intuitive Controls</h3>
              <p className="text-muted-foreground">
                Easily add, move, and customize mesh points with our user-friendly interface.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg p-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Download className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Multiple Export Options</h3>
              <p className="text-muted-foreground">
                Export your gradients as PNG, JPG, or save as JSON for future editing.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg p-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Share2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Import & Share</h3>
              <p className="text-muted-foreground">
                Import previously created gradients and share your designs with others.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">How It Works</div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Create Mesh Gradients in 3 Simple Steps
              </h2>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-4 rounded-lg border bg-background p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                1
              </div>
              <h3 className="text-xl font-bold">Add Mesh Points</h3>
              <p className="text-muted-foreground text-center">
                Click the &quot;Add Mesh Point&quot; button to create points on your canvas.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 rounded-lg border bg-background p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                2
              </div>
              <h3 className="text-xl font-bold">Customize & Position</h3>
              <p className="text-muted-foreground text-center">
                Adjust colors, radius, and drag points to create your perfect gradient.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 rounded-lg border bg-background p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                3
              </div>
              <h3 className="text-xl font-bold">Export & Use</h3>
              <p className="text-muted-foreground text-center">
                Export your creation in your preferred format and use it in your projects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Generator Section */}
      <section id="generator" className="container py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Try It Now</div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Create Your Own Mesh Gradient</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Use our interactive tool to design your perfect gradient right in your browser.
              </p>
            </div>
          </div>

          <div className="mt-12">
            {showFullGenerator ? (
              <MeshGradientGenerator />
            ) : (
              <div className="flex flex-col items-center space-y-6">
                <div className="w-full max-w-3xl aspect-video overflow-hidden rounded-xl border bg-background shadow-xl">
                  <MeshGradientHero interactive />
                </div>
                <Button size="lg" onClick={() => setShowFullGenerator(true)}>
                  Open Full Generator
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Ready to Create Beautiful Gradients?
              </h2>
              <p className="max-w-[600px] text-primary-foreground/80 md:text-xl/relaxed">
                Start designing stunning mesh gradients for your projects today.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" variant="secondary" asChild>
                <Link href="#generator">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2023 MeshBox. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Terms
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Privacy
            </Link>
            <Link
              href="https://github.com/abdoachhoubi/mesh-box"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="icon">
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </Button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

