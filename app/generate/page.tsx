"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowRight,
  Export,
  CheckCircle,
  XCircle,
  SpinnerGap,
  Warning,
  User,
  Envelope,
  Trophy,
  Plus,
  Minus,
} from "@phosphor-icons/react"

type ParticipantResult = {
  id?: string | number
  name: string
  email: string
  status: "sent" | "failed" | "skipped"
  error?: string
  isWinner?: boolean
  position?: number | null
  team?: { name?: string }
}

type GenerateResult = {
  eventName: string
  sentCount: number
  failedCount: number
  emailsSent: ParticipantResult[]
  failedEmails: ParticipantResult[]
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1"

export default function GeneratePage() {
  const [token, setToken] = useState("")
  const [eventId, setEventId] = useState("")
  const [cName, setCName] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenerateResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const body: Record<string, unknown> = { eventId: Number(eventId) }
      if (cName.trim()) body.cName = cName.trim()

      const res = await fetch(`${BASE_URL}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Certificate generation failed")
      }

      setResult(data.data as GenerateResult)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  function increment() {
    setEventId(String(Number(eventId || 0) + 1))
  }

  function decrement() {
    setEventId(String(Math.max(1, Number(eventId || 0) - 1)))
  }

  const allResults = result ? [...result.emailsSent, ...result.failedEmails] : []

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm font-medium text-muted-foreground">Generate Certificates</span>
        </header>

        <div className="flex flex-col gap-6 p-6 max-w-3xl">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Auto Generate</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Fetches checked-in participants from the Events API and dispatches certificates via
              email. Winners automatically receive Appreciation certificates.
            </p>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Request Parameters</CardTitle>
              <CardDescription className="text-sm">
                Provide your admin JWT token and the target event ID.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="flex flex-col gap-5">
                {/* JWT Token */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="token" className="text-sm font-medium">
                    JWT Token <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="token"
                    type="password"
                    placeholder="eyJhbGci..."
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Admin JWT. Generate with <code className="font-mono">node token.js</code> in the
                    service repo.
                  </p>
                </div>

                {/* Event ID */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="eventId" className="text-sm font-medium">
                    Event ID <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex items-center gap-2 w-44">
                    <Button type="button" variant="outline" size="icon" onClick={decrement}>
                      <Minus className="size-4" />
                    </Button>
                    <Input
                      id="eventId"
                      type="number"
                      placeholder="42"
                      value={eventId}
                      onChange={(e) => setEventId(e.target.value)}
                      required
                      className="text-sm text-center"
                    />
                    <Button type="button" variant="outline" size="icon" onClick={increment}>
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </div>

                {/* Certificate Name */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="cName" className="text-sm font-medium">
                    Certificate Name{" "}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="cName"
                    placeholder="e.g. EXCEL MAIN DAYS"
                    value={cName}
                    onChange={(e) => setCName(e.target.value)}
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Matches the <code className="font-mono">c_name</code> column in the Supabase
                    certificate_templates table. Leave blank to use the first matching template.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <Button type="submit" disabled={loading || !token || !eventId}>
                    {loading ? (
                      <>
                        <SpinnerGap className="animate-spin" />
                        Processing…
                      </>
                    ) : (
                      <>
                        <Export className="size-4" />
                        Generate & Send
                      </>
                    )}
                  </Button>
                  {result && (
                    <span className="text-xs text-muted-foreground">
                      Last run:{" "}
                      <span className="text-primary font-medium">{result.sentCount} sent</span>
                      {result.failedCount > 0 && (
                        <span className="text-destructive font-medium ml-1">
                          · {result.failedCount} failed
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {error && (
            <Alert className="border-destructive/40 bg-destructive/10 text-destructive text-sm flex items-start gap-2">
              <Warning weight="fill" className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </Alert>
          )}

          {result && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">{result.eventName}</h2>
                <Badge variant="default" className="gap-1">
                  <CheckCircle weight="fill" />
                  {result.sentCount} sent
                </Badge>
                {result.failedCount > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <XCircle weight="fill" />
                    {result.failedCount} failed
                  </Badge>
                )}
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>
                          <span className="flex items-center gap-1">
                            <User className="size-3" /> Name
                          </span>
                        </TableHead>
                        <TableHead>
                          <span className="flex items-center gap-1">
                            <Envelope className="size-3" /> Email
                          </span>
                        </TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allResults.map((p, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                          <TableCell className="font-medium">
                            <span className="flex items-center gap-1.5">
                              {p.isWinner && (
                                <Trophy weight="fill" className="size-3 text-chart-1" />
                              )}
                              {p.name}
                              {p.isWinner && p.team?.name && (
                                <span className="text-muted-foreground font-normal">
                                  ({p.team.name})
                                </span>
                              )}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground font-mono text-xs">
                            {p.email || "—"}
                          </TableCell>
                          <TableCell>
                            {p.isWinner ? (
                              <Badge variant="secondary" className="gap-1 text-xs">
                                <Trophy weight="fill" className="size-3 text-chart-1" />
                                {p.position === 1 ? "1st" : p.position === 2 ? "2nd" : "3rd"} Prize
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Participation
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {p.status === "sent" ? (
                              <Badge variant="default" className="gap-1 text-xs">
                                <CheckCircle weight="fill" />
                                Sent
                              </Badge>
                            ) : p.status === "skipped" ? (
                              <Badge variant="secondary" className="text-xs">
                                Skipped
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="gap-1 text-xs">
                                <XCircle weight="fill" />
                                Failed
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
