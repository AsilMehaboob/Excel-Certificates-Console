"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  Envelope,
  CheckCircle,
  XCircle,
  Clock,
} from "@phosphor-icons/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TokenSlot } from "@/components/global-header"

const stats = [
  {
    label: "Generate (Auto)",
    description: "Fetch participants from Events API and dispatch certificates",
    icon: ArrowRight,
    href: "/generate",
    badge: "API",
    badgeVariant: "default" as const,
  },
  {
    label: "Manual Entry",
    description: "Manually specify participants by name and email for an event",
    icon: Envelope,
    href: "/manual",
    badge: "Manual",
    badgeVariant: "secondary" as const,
  },
]

const features = [
  {
    icon: CheckCircle,
    title: "SVG → PDF",
    desc: "Converts Supabase-stored SVG templates into personalized PDFs.",
    color: "text-primary",
  },
  {
    icon: Envelope,
    title: "Email Dispatch",
    desc: "Sends certificates via SMTP with professional formatting.",
    color: "text-primary",
  },
  {
    icon: XCircle,
    title: "Error Handling",
    desc: "Tracks failed deliveries with per-participant status reporting.",
    color: "text-destructive",
  },
  {
    icon: Clock,
    title: "Batch Processing",
    desc: "Processes participants in configurable batches with rate limiting.",
    color: "text-primary",
  },
]

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm font-medium text-muted-foreground">
            Dashboard
          </span>
          <TokenSlot />
        </header>

        {/* Content */}
        <div className="flex flex-col gap-6 p-6">
          {/* Hero */}
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-semibold tracking-tight">Certificate Console</h1>
            <p className="text-sm text-muted-foreground max-w-lg">
              Generate and distribute personalized certificates for Excel MEC events. Supports both
              participation and appreciation (winner) certificates.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {stats.map((item) => (
              <Card
                key={item.label}
                className="group cursor-pointer transition-all hover:ring-1 hover:ring-primary/40"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">{item.label}</CardTitle>
                    <Badge variant={item.badgeVariant}>{item.badge}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <CardDescription className="text-sm leading-relaxed mb-4">
                    {item.description}
                  </CardDescription>
                  <Button size="sm" variant="outline" render={<Link href={item.href} />}>
                    Open
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* How It Works */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              How It Works
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <Card key={f.title} className="py-4">
                  <CardContent className="flex flex-col gap-2 px-4">
                    <f.icon weight="fill" className={`size-5 ${f.color}`} />
                    <p className="text-sm font-semibold">{f.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* API Info */}
          <Card className="border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Backend Endpoint
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 font-mono text-xs bg-muted/40 rounded-md px-3 py-2">
                <Badge variant="secondary" className="font-mono text-[10px]">POST</Badge>
                <span className="text-foreground">/api/v1/generate</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs bg-muted/40 rounded-md px-3 py-2">
                <Badge variant="secondary" className="font-mono text-[10px]">POST</Badge>
                <span className="text-foreground">/api/v1/generate/manual</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs bg-muted/40 rounded-md px-3 py-2">
                <Badge variant="secondary" className="font-mono text-[10px]">POST</Badge>
                <span className="text-foreground">/api/v1/generate/custom</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                All endpoints require a valid JWT admin token in the{" "}
                <code className="font-mono bg-muted/50 px-1 rounded">Authorization: Bearer</code>{" "}
                header.
              </p>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
