import { createFileRoute } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { useState } from "react";
import logo from "@/assets/phronos-logo.svg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Phronos — AI, rebuilt from the bit up" },
      {
        name: "description",
        content: "No floats. XNOR backprop. FHE-native by design. Something fundamental is coming.",
      },
    ],
  }),
});

function Index() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || isSubmitting || submitted) return;

    setIsSubmitting(true);
    setStatusMessage("");

    try {
      const response = await fetch("/api/notify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => undefined)) as
          | { error?: string }
          | undefined;
        throw new Error(body?.error ?? "Could not join the waitlist");
      }

      setSubmitted(true);
      setStatusMessage("You're on the list. We'll notify you when there is news.");
    } catch (error) {
      console.error(error);
      setStatusMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative h-screen overflow-hidden bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 md:px-16 pt-5 md:pt-7 animate-fade-in flex-shrink-0">
        <a href="/" className="flex items-center gap-3">
          <img src={logo} alt="Phronos" className="h-16 md:h-20 w-auto" />
        </a>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center px-6 flex-1 text-center">
        <h1 className="font-display text-[clamp(2.5rem,7vw,6rem)] leading-[1.05] tracking-tight max-w-5xl animate-fade-up">
          AI, rebuilt
          <br />
          from the bit up.
        </h1>

        {/* Divider with mark */}
        <div
          className="mt-5 flex items-center gap-4 animate-fade-up"
          style={{ animationDelay: "200ms" }}
        >
          <span className="h-px w-16 bg-foreground/30" />
          <img
            src={logo}
            alt=""
            aria-hidden
            className="h-5 w-5 object-contain opacity-70"
            style={{ objectPosition: "left", clipPath: "inset(0 90% 0 0)" }}
          />
          <span className="h-px w-16 bg-foreground/30" />
        </div>

        <p
          className="mt-3 text-base md:text-lg text-muted-foreground max-w-2xl animate-fade-up"
          style={{ animationDelay: "350ms" }}
        >
          No floats. XNOR backprop. FHE-native by design.
        </p>

        {/* Email capture */}
        <form
          onSubmit={handleSubmit}
          className="mt-5 w-full max-w-xl animate-fade-up"
          style={{ animationDelay: "500ms" }}
        >
          <div className="flex items-center gap-2 rounded-full bg-card border border-border/60 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)] pl-6 pr-2 py-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={submitted ? "We'll notify you with news." : "Enter your email"}
              disabled={submitted || isSubmitting}
              className="flex-1 bg-transparent outline-none text-sm md:text-base placeholder:text-muted-foreground/70 py-2"
            />
            <button
              type="submit"
              disabled={submitted || isSubmitting}
              className="rounded-full bg-primary text-primary-foreground text-sm md:text-base px-6 md:px-8 py-3 font-medium transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-70"
            >
              {submitted ? "Thanks" : isSubmitting ? "Sending" : "Notify Me"}
            </button>
          </div>
          <p className="sr-only" aria-live="polite">
            {statusMessage}
          </p>
        </form>

        {/* Footer note */}
        <div
          className="mt-6 flex flex-col items-center gap-3 animate-fade-in"
          style={{ animationDelay: "800ms" }}
        >
          <p className="text-[11px] tracking-[0.32em] uppercase text-muted-foreground">
            Coming soon
          </p>
          <span className="h-8 w-px bg-foreground/20" />
        </div>
      </section>
    </main>
  );
}
