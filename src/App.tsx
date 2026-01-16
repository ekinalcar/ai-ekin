import { useEffect, useRef, useState, type FormEvent } from "react"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

const starterPrompts = [
  "What are you building right now?",
  "Give me your 30-second intro.",
  "What kind of work excites you most?",
  "Share a project you are proud of.",
  "How can I collaborate with you?",
]

const quickFacts = [
  { label: "Role", value: "Senior Frontend Engineer (CoFa, DKB)" },
  { label: "Focus", value: "Payments, UI systems, product delivery" },
  { label: "Location", value: "Berlin, Germany" },
  { label: "Stack", value: "React, TypeScript, GraphQL" },
]

const socialLinks = [
  { label: "Email", href: "mailto:ekinalcar@gmail.com" },
  { label: "GitHub", href: "https://github.com/ekinalcar" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/ekin-alcar-30b66a31/",
  },
]

const initialMessages: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "Hi, I’m Ekin’s AI twin. Ask me anything about his work, experiments, or what he’s building next.",
  },
]

const getInitialTheme = () => {
  if (typeof window === "undefined") {
    return "dark" as const
  }
  const stored = window.localStorage.getItem("theme")
  if (stored === "light" || stored === "dark") {
    return stored
  }
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark"
}

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme)
  const endRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem("theme", theme)
  }, [theme])

  const sendMessage = async (override?: string) => {
    const content = (override ?? input).trim()
    if (!content || isLoading) {
      return
    }

    setError(null)
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }]
    setMessages(nextMessages)
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      })

      if (!response.ok) {
        const problem = await response.text()
        throw new Error(problem || "Request failed.")
      }

      const data = (await response.json()) as { reply?: string }
      const reply = data.reply?.trim() || "No response yet. Try again?"
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: reply,
      }
      setMessages([...nextMessages, assistantMessage])
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong."
      setError(message)
      const fallbackMessage: ChatMessage = {
        role: "assistant",
        content: "I ran into a snag reaching the model. Try again in a moment.",
      }
      setMessages([...nextMessages, fallbackMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void sendMessage()
  }

  const focusInput = () => {
    inputRef.current?.focus()
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[color:var(--bg)] text-[color:var(--text)]">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 top-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(110,231,255,0.35),_transparent_70%)] blur-2xl"
        style={{ animation: "float-slow 14s ease-in-out infinite" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-24 h-96 w-96 rounded-full bg-[radial-gradient(circle,_rgba(251,191,36,0.28),_transparent_70%)] blur-2xl"
        style={{ animation: "float-slow 18s ease-in-out infinite" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(167,139,250,0.3),_transparent_70%)] blur-2xl"
        style={{ animation: "float-slow 16s ease-in-out infinite" }}
      />

      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 pb-16 pt-10">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="glow-ring flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6ee7ff] via-[#a78bfa] to-[#fcd34d] text-sm font-bold text-[#0b0b10]">
              EA
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--muted)]">
                ekinalcar.com
              </p>
              <p className="text-sm text-[color:var(--muted)]">
                AI prompt profile
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <button
              type="button"
              onClick={() =>
                setTheme((current) => (current === "dark" ? "light" : "dark"))
              }
              className="rounded-full border border-[color:var(--border-strong)] px-3 py-2 text-[11px] font-semibold text-[color:var(--text)] transition hover:border-[color:var(--text)]"
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
          <div className="hidden items-center gap-4 text-xs uppercase tracking-[0.25em] text-[color:var(--muted)] md:flex">
            <a
              href="#chat"
              className="transition hover:text-[color:var(--text)]"
            >
              Live prompt
            </a>
            <a
              href="mailto:ekinalcar@gmail.com"
              className="transition hover:text-[color:var(--text)]"
            >
              Contact
            </a>
            <button
              type="button"
              onClick={focusInput}
              className="rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-[11px] font-semibold text-[color:var(--text)] transition hover:border-[color:var(--text)]"
            >
              Start a chat
            </button>
            <button
              type="button"
              onClick={() =>
                setTheme((current) => (current === "dark" ? "light" : "dark"))
              }
              className="rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-[11px] font-semibold text-[color:var(--text)] transition hover:border-[color:var(--text)]"
            >
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
          </div>
        </nav>

        <section className="mt-16 grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              <p className="fade-up text-xs uppercase tracking-[0.35em] text-[color:var(--muted)]">
                AI Ekin
              </p>
              <h1 className="fade-up fade-delay-1 font-serif text-4xl leading-tight sm:text-6xl">
                Your prompt-first window into Ekin’s work, thinking, and next
                moves.
                <span className="text-gradient block">
                  Ask. Explore. Collaborate.
                </span>
              </h1>
              <p className="fade-up fade-delay-2 text-base text-[color:var(--muted-2)] sm:text-lg">
                This is a living profile powered by OpenAI. Ask a question and
                get a direct, human-sounding response grounded in Ekin’s real
                experience.
              </p>
              <div className="fade-up fade-delay-3 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={focusInput}
                  className="rounded-full bg-[color:var(--text)] px-6 py-3 text-sm font-semibold text-[color:var(--bg)] transition hover:-translate-y-0.5"
                >
                  Ask AI Ekin
                </button>
                <a
                  href="mailto:ekinalcar@gmail.com"
                  className="rounded-full border border-[color:var(--border-strong)] px-6 py-3 text-sm font-semibold text-[color:var(--text)] transition hover:border-[color:var(--text)]"
                >
                  Work together
                </a>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {quickFacts.map((fact) => (
                <div
                  key={fact.label}
                  className="glass-panel rounded-2xl px-4 py-5"
                >
                  <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--muted)]">
                    {fact.label}
                  </p>
                  <p className="mt-3 text-sm text-[color:var(--text)]">
                    {fact.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.25em] text-[color:var(--muted)]">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-[color:var(--chip-border)] px-4 py-2 text-[11px] font-semibold text-[color:var(--text)] transition hover:border-[color:var(--text)]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div
            id="chat"
            className="glass-panel flex min-h-[520px] flex-col rounded-3xl p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--muted)]">
                  Live prompt
                </p>
                <h2 className="font-serif text-2xl text-[color:var(--text)]">
                  Chat with AI Ekin
                </h2>
              </div>
              <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--chip-bg)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-[color:var(--text)]">
                online
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void sendMessage(prompt)}
                  className="rounded-full border border-[color:var(--chip-border)] bg-[color:var(--chip-bg)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)] transition hover:border-[color:var(--text)] hover:text-[color:var(--text)]"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="mt-6 flex flex-1 flex-col overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--panel)]">
              <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
                {messages.map((message, index) => {
                  const isUser = message.role === "user"
                  return (
                    <div
                      key={`${message.role}-${index}`}
                      className={`flex ${
                        isUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          isUser
                            ? "bg-[color:var(--bubble-user)] text-[color:var(--bubble-user-text)]"
                            : "bg-[color:var(--bubble-ai)] text-[color:var(--bubble-ai-text)]"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  )
                })}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-[color:var(--bubble-ai)] px-4 py-3 text-sm text-[color:var(--muted)]">
                      Thinking…
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>

              {error && (
                <p className="mx-4 mb-4 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-xs text-red-200">
                  {error}
                </p>
              )}

              <form
                onSubmit={handleSubmit}
                className="border-t border-[color:var(--border)]"
              >
                <div className="flex gap-3 px-4 py-4">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    rows={2}
                    placeholder="Ask about payments, frontend systems, or rugby..."
                    className="min-h-[56px] flex-1 resize-none rounded-2xl border border-[color:var(--border)] bg-[color:var(--chip-bg)] px-4 py-3 text-sm text-[color:var(--text)] outline-none transition focus:border-[color:var(--border-strong)]"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="rounded-2xl bg-[color:var(--text)] px-5 py-3 text-sm font-semibold text-[color:var(--bg)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
