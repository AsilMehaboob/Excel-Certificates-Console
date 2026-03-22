"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { TokenSlot } from "@/components/global-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Plus,
  Minus,
  Trash,
  CheckCircle,
  XCircle,
  SpinnerGap,
  Warning,
  User,
  Envelope,
} from "@phosphor-icons/react"
import { useToken } from "@/lib/token-context"

type Participant = {
  name: string
  email: string
}

type ParticipantResult = {
  id?: string | number
  name: string
  email: string
  status: "sent" | "failed" | "skipped"
  error?: string
}

type GenerateResult = {
  eventName: string
  sentCount: number
  failedCount: number
  emailsSent: ParticipantResult[]
  failedEmails: ParticipantResult[]
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1"

const emptyParticipant = (): Participant => ({ name: "", email: "" })

export default function ManualPage() {
  const { token } = useToken()
  const [eventId, setEventId] = useState("")
  const [cName, setCName] = useState("")
  const [participants, setParticipants] = useState<Participant[]>([emptyParticipant()])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenerateResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  async function handlePreview(e: React.FormEvent) {
    e.preventDefault()

    if (!token) {
      setError('No JWT token set. Click "Set JWT token" in the top-right corner.')
      return
    }

    const validParticipants = participants.filter((p) => p.name.trim() && p.email.trim())
    if (validParticipants.length === 0) {
      setError("Please add at least one participant with a name and email to preview.")
      return
    }

    setPreviewLoading(true)
    setError(null)

    try {
      const firstP = validParticipants[0]
      const body = {
        pName: firstP.name,
        eName: cName || `Event ${eventId}`,
        isWinner: false,
        position: null,
        cName: cName || null
      }
      const res = await fetch(`${BASE_URL}/generate/preview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Preview failed")
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
      setPreviewOpen(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setPreviewLoading(false)
    }
  }

  function addRow() {
    setParticipants((prev) => [...prev, emptyParticipant()])
  }

  function removeRow(index: number) {
    setParticipants((prev) => prev.filter((_, i) => i !== index))
  }

  function updateRow(index: number, field: keyof Participant, value: string) {
    setParticipants((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    )
  }

  function handleCellPaste(
    e: React.ClipboardEvent<HTMLInputElement>,
    rowIndex: number,
    field: keyof Participant
  ) {
    const text = e.clipboardData.getData("text")
    const lines = text.trim().split("\n").filter(Boolean)

    if (lines.length <= 1 && !text.includes("\t")) return

    e.preventDefault()

    const parsed: Participant[] = lines.map((line) => {
      const parts = line.split(/[\t,]/).map((p) => p.trim())
      if (field === "email") {
        return { name: "", email: parts[0] || "" }
      }
      return { name: parts[0] || "", email: parts[1] || "" }
    })

    if (parsed.length === 0) return

    setParticipants((prev) => {
      const before = prev.slice(0, rowIndex).filter((p) => p.name || p.email)
      const after = prev.slice(rowIndex + parsed.length)
      const merged = parsed.map((newRow, idx) => {
        const existing = prev[rowIndex + idx]
        if (field === "email" && existing) {
          return { name: existing.name, email: newRow.email }
        }
        return newRow
      })
      const result = [...before, ...merged, ...after].filter((p) => p.name || p.email)
      return result.length > 0 ? result : [emptyParticipant()]
    })
  }

  function increment() { setEventId(String(Number(eventId || 0) + 1)) }
  function decrement() { setEventId(String(Math.max(1, Number(eventId || 0) - 1))) }

  async function handleSubmit() {
    setPreviewOpen(false)
    if (!token) {
      setError('No JWT token set. Click "Set JWT token" in the top-right corner.')
      setLoading(false)
      return
    }

    setLoading(true)
    setResult(null)
    setError(null)

    const validParticipants = participants.filter((p) => p.name.trim() && p.email.trim())
    if (validParticipants.length === 0) {
      setError("Please add at least one participant with a name and email.")
      setLoading(false)
      return
    }

    try {
      const body: Record<string, unknown> = {
        eventId: Number(eventId),
        participants: validParticipants,
      }
      if (cName.trim()) body.cName = cName.trim()

      const res = await fetch(`${BASE_URL}/generate/manual`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || "Manual generation failed")
      setResult(data.data as GenerateResult)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const allResults = result ? [...result.emailsSent, ...result.failedEmails] : []

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm font-medium text-muted-foreground">Manual Entry</span>
          <TokenSlot />
        </header>

        <div className="flex flex-col gap-6 p-6 max-w-4xl">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Manual Entry</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manually specify participant names and emails. All participants receive Participation
              certificates. Paste CSV/tab-separated data directly into any Name or Email cell.
            </p>
          </div>

          <form onSubmit={handlePreview} className="flex flex-col gap-5">
            {/* Event config */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Request Configuration</CardTitle>
                <CardDescription className="text-sm">
                  Event details and optional template override. JWT token is set globally in the header.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
                </div>
              </CardContent>
            </Card>

            {/* Participants */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-medium">Participants</CardTitle>
                    <CardDescription className="text-sm mt-0.5">
                      Each participant receives a Participation certificate. Paste from Excel directly into any cell.
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="font-mono tabular-nums">
                    {participants.filter((p) => p.name || p.email).length} entries
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>
                          <span className="flex items-center gap-1"><User className="size-3" /> Name</span>
                        </TableHead>
                        <TableHead>
                          <span className="flex items-center gap-1"><Envelope className="size-3" /> Email</span>
                        </TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {participants.map((p, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                          <TableCell className="py-1.5">
                            <Input
                              value={p.name}
                              onChange={(e) => updateRow(i, "name", e.target.value)}
                              onPaste={(e) => handleCellPaste(e, i, "name")}
                              placeholder="Participant name"
                              className="h-9 text-sm border-0 bg-transparent px-2 focus-visible:ring-0 shadow-none"
                            />
                          </TableCell>
                          <TableCell className="py-1.5">
                            <Input
                              type="email"
                              value={p.email}
                              onChange={(e) => updateRow(i, "email", e.target.value)}
                              onPaste={(e) => handleCellPaste(e, i, "email")}
                              placeholder="email@example.com"
                              className="h-9 text-sm border-0 bg-transparent px-2 focus-visible:ring-0 shadow-none"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeRow(i)}
                              disabled={participants.length === 1}
                            >
                              <Trash className="size-3.5 text-muted-foreground" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRow}
                  className="self-start"
                >
                  <Plus />
                  Add Row
                </Button>
              </CardContent>
            </Card>

            {error && (
              <Alert className="border-destructive/40 bg-destructive/10 text-destructive text-sm flex items-start gap-2">
                <Warning weight="fill" className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </Alert>
            )}

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={previewLoading || !eventId}>
                {previewLoading ? (
                  <>
                    <SpinnerGap className="animate-spin" />
                    Generating Preview…
                  </>
                ) : (
                  "Preview Certificate"
                )}
              </Button>
              {result && (
                <span className="text-sm text-muted-foreground">
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

          {loading && (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-3 border rounded-xl border-dashed bg-muted/10 mt-2">
              <SpinnerGap className="animate-spin size-8" />
              <p className="text-sm font-medium">Processing & Sending Certificates...</p>
            </div>
          )}

          {result && !loading && (
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
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Note</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allResults.map((p, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {p.email || "—"}
                          </TableCell>
                          <TableCell>
                            {p.status === "sent" ? (
                              <Badge variant="default" className="gap-1 text-xs">
                                <CheckCircle weight="fill" /> Sent
                              </Badge>
                            ) : p.status === "skipped" ? (
                              <Badge variant="secondary" className="text-xs">Skipped</Badge>
                            ) : (
                              <Badge variant="destructive" className="gap-1 text-xs">
                                <XCircle weight="fill" /> Failed
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {p.error || "—"}
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

        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Certificate Preview</DialogTitle>
              <DialogDescription>
                Preview uses the first participant's data. Review the layout before confirming.
              </DialogDescription>
            </DialogHeader>
            <div className="flex aspect-video w-full rounded-md border bg-muted/20 overflow-hidden items-center justify-center">
              {previewUrl ? (
                <iframe src={previewUrl} className="w-full h-full border-none" title="Certificate Preview" />
              ) : (
                <SpinnerGap className="animate-spin size-6 text-muted-foreground" />
              )}
            </div>
            <DialogFooter className="sm:justify-between">
              <Button variant="ghost" onClick={() => setPreviewOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <SpinnerGap className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Confirm & Send"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
