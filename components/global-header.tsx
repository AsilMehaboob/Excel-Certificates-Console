"use client"

import { useState } from "react"
import { useToken } from "@/lib/token-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeSlash, CheckCircle } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

export function TokenSlot() {
  const { token, setToken } = useToken()
  const [show, setShow] = useState(false)
  const [draft, setDraft] = useState("")
  const [editing, setEditing] = useState(false)

  function startEditing() {
    setDraft(token)
    setEditing(true)
  }

  function commit() {
    setToken(draft.trim())
    setEditing(false)
    setShow(false)
  }

  function cancel() {
    setEditing(false)
    setDraft("")
  }

  return (
    <div className="flex items-center gap-2 ml-auto">
      {editing ? (
        <>
          <Input
            autoFocus
            type={show ? "text" : "password"}
            placeholder="Paste admin JWT…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit()
              if (e.key === "Escape") cancel()
            }}
            className="h-7 w-72 font-mono text-xs"
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 shrink-0"
            onClick={() => setShow((s) => !s)}
            type="button"
          >
            {show ? <EyeSlash className="size-3.5" /> : <Eye className="size-3.5" />}
          </Button>
          <Button size="sm" className="h-7 text-xs px-3" onClick={commit} type="button">
            Save
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs px-2"
            onClick={cancel}
            type="button"
          >
            Cancel
          </Button>
        </>
      ) : (
        <button
          onClick={startEditing}
          className={cn(
            "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors hover:bg-muted/50",
            token
              ? "border-primary/30 text-primary"
              : "border-dashed text-muted-foreground"
          )}
          type="button"
        >
          {token ? (
            <>
              <CheckCircle weight="fill" className="size-3" />
              Token set
            </>
          ) : (
            "Set JWT token"
          )}
        </button>
      )}
    </div>
  )
}
