"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  GearSix,
  Database,
  Envelope,
  Lock,
  Globe,
  Package,
} from "@phosphor-icons/react"

const configGroups = [
  {
    title: "Events API",
    icon: Globe,
    items: [
      { key: "EVENTS_API_BASE_URL", description: "Base URL for the Excel Events Service API" },
    ],
  },
  {
    title: "SMTP / Email",
    icon: Envelope,
    items: [
      { key: "SMTP_HOST", description: "SMTP server hostname" },
      { key: "SMTP_PORT", description: "SMTP connection port (587 = TLS)" },
      { key: "SMTP_USER", description: "SMTP credentials — username / access key" },
      { key: "SMTP_FROM", description: "Sender email address displayed to recipients" },
      { key: "SMTP_PASS", description: "SMTP password / secret key" },
    ],
  },
  {
    title: "Authentication",
    icon: Lock,
    items: [
      {
        key: "JWT_SECRET_KEY",
        description: "Secret used to sign and verify admin JWT tokens",
      },
    ],
  },
  {
    title: "Supabase",
    icon: Database,
    items: [
      { key: "SUPABASE_URL", description: "Supabase project URL" },
      {
        key: "SUPABASE_SERVICE_KEY",
        description: "Supabase service role key (full access, keep secret)",
      },
    ],
  },
  {
    title: "Processing",
    icon: Package,
    items: [
      {
        key: "BATCH_SIZE",
        description: "Number of certificates processed concurrently per batch (default: 3)",
      },
      { key: "YEAR", description: "Event year for context (e.g. 2025)" },
      { key: "PORT", description: "Port the Express service listens on (default: 5000)" },
    ],
  },
]

const templateSchema = [
  { col: "id", type: "uuid", note: "Primary key" },
  { col: "c_name", type: "text", note: 'Template name — e.g. "EXCEL MAIN DAYS"' },
  { col: "c_type", type: "integer", note: "0 = Participation, 1 = Appreciation" },
  { col: "svg_path", type: "text", note: "Filename in certificate-templates bucket" },
  { col: "constraints", type: "jsonb", note: '{"max_width": 598} — name field max px' },
  { col: "main_font_path", type: "text", note: "Filename in certificate-fonts bucket" },
  { col: "name_font_path", type: "text", note: "Font for participant name rendering" },
]

const templateVars = [
  { variable: "{p_name}", description: "Replaced with participant (or team) name" },
  { variable: "{e_name}", description: "Replaced with event name from API" },
  { variable: "{c_type}", description: "Set to Participation or Appreciation" },
  { variable: "{pos}", description: "First Prize / Second Prize / Third Prize (winners only)" },
]

export default function SettingsPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm font-medium text-muted-foreground">Settings &amp; Reference</span>
        </header>

        <div className="flex flex-col gap-6 p-6 max-w-3xl">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Environment variable reference for the Excel Certificates Service backend, and
              certificate template schema documentation.
            </p>
          </div>

          {/* Env Vars */}
          <div className="flex flex-col gap-4">
            <h2 className="font-heading text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Environment Variables (.env)
            </h2>
            {configGroups.map((group) => (
              <Card key={group.title}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <group.icon className="size-4 text-primary" />
                    {group.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {group.items.map((item) => (
                      <div key={item.key} className="flex items-start justify-between gap-4 px-4 py-2.5">
                        <code className="font-mono text-xs text-foreground shrink-0">
                          {item.key}
                        </code>
                        <p className="text-xs text-muted-foreground text-right">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Template Schema */}
          <div className="flex flex-col gap-4">
            <h2 className="font-heading text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Certificate Template Schema
            </h2>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">certificate_templates (Supabase)</CardTitle>
                <CardDescription className="text-xs">
                  Managed via the Supabase dashboard. SVG and font files are stored in Supabase
                  Storage buckets.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {templateSchema.map((row) => (
                    <div key={row.col} className="flex items-start gap-4 px-4 py-2.5">
                      <code className="font-mono text-xs text-foreground w-36 shrink-0">{row.col}</code>
                      <Badge variant="outline" className="font-mono text-[10px] shrink-0">
                        {row.type}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{row.note}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Template Variables */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">SVG Template Variables</CardTitle>
                <CardDescription className="text-xs">
                  Embed these placeholders in your Figma-exported SVG to enable dynamic text
                  substitution.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {templateVars.map((v) => (
                    <div key={v.variable} className="flex items-start gap-4 px-4 py-2.5">
                      <code className="font-mono text-xs text-primary w-24 shrink-0">{v.variable}</code>
                      <p className="text-xs text-muted-foreground">{v.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Supabase Buckets */}
            <Card className="border-dashed">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Supabase Storage Buckets</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 pb-4">
                <div className="flex items-center gap-2 font-mono text-xs bg-muted/40 rounded-md px-3 py-2">
                  <Badge variant="secondary" className="text-[10px]">bucket</Badge>
                  <span>certificate-templates</span>
                  <span className="text-muted-foreground ml-auto">SVG template files</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs bg-muted/40 rounded-md px-3 py-2">
                  <Badge variant="secondary" className="text-[10px]">bucket</Badge>
                  <span>certificate-fonts</span>
                  <span className="text-muted-foreground ml-auto">.ttf font files</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
