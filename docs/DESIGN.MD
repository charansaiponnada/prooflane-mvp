# ProofLane — Design System & UI Specification

**Stack:** Next.js (App Router) + Tailwind CSS + **shadcn/ui** (New York style) + **Phosphor Icons**
**Aesthetic direction:** high-contrast, evidentiary, quiet — the UI itself should feel like something a skeptical auditor would trust. No gradients, no decorative color, no "AI product" purple. Black, white, and one status vocabulary for verified/invalid.

---

## 1. Setup

```bash
npx shadcn@latest init
```

When prompted:
- **Style:** New York
- **Base color:** Neutral
- **CSS variables:** Yes (required — this is how the light/dark tokens below plug in)

```bash
npm install @phosphor-icons/react
```

Add components as needed, e.g.:
```bash
npx shadcn@latest add card badge table tabs button dialog separator tooltip scroll-area alert
```

---

## 2. Theme tokens

Strict two-mode theme — no "system accent," no colored surfaces. Put this in `app/globals.css`, replacing shadcn's generated `:root` / `.dark` blocks.

```css
@layer base {
  :root {
    /* LIGHT — white surface, black text */
    --background: 0 0% 100%;          /* #FFFFFF */
    --foreground: 0 0% 5%;            /* #0D0D0D — near-black, softer than pure #000 on white */

    --card: 0 0% 100%;
    --card-foreground: 0 0% 5%;

    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 5%;

    --primary: 0 0% 5%;               /* black-on-white primary actions */
    --primary-foreground: 0 0% 100%;

    --secondary: 0 0% 96%;            /* faint grey card fill, not pure white, for hierarchy */
    --secondary-foreground: 0 0% 5%;

    --muted: 0 0% 96%;
    --muted-foreground: 0 0% 38%;     /* body copy that isn't primary text */

    --accent: 0 0% 93%;
    --accent-foreground: 0 0% 5%;

    --border: 0 0% 88%;
    --input: 0 0% 88%;
    --ring: 0 0% 5%;

    /* Status vocabulary — the ONLY color allowed in the UI */
    --verified: 162 100% 33%;         /* teal-green, e.g. #00A868 */
    --verified-foreground: 0 0% 100%;
    --invalid: 356 76% 56%;           /* red, e.g. #E5484D */
    --invalid-foreground: 0 0% 100%;
    --simulated: 38 92% 50%;          /* amber — for "simulated, not hardware" badges only */
    --simulated-foreground: 0 0% 5%;

    --radius: 0.5rem;
  }

  .dark {
    /* DARK — black surface, white text */
    --background: 0 0% 0%;            /* #000000 */
    --foreground: 0 0% 98%;           /* #FAFAFA — near-white, softer than pure white on black */

    --card: 0 0% 6%;                  /* slightly lifted panel, not pure black, for depth */
    --card-foreground: 0 0% 98%;

    --popover: 0 0% 6%;
    --popover-foreground: 0 0% 98%;

    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 0%;

    --secondary: 0 0% 12%;
    --secondary-foreground: 0 0% 98%;

    --muted: 0 0% 12%;
    --muted-foreground: 0 0% 65%;

    --accent: 0 0% 15%;
    --accent-foreground: 0 0% 98%;

    --border: 0 0% 18%;
    --input: 0 0% 18%;
    --ring: 0 0% 98%;

    --verified: 162 84% 45%;
    --verified-foreground: 0 0% 5%;
    --invalid: 356 90% 65%;
    --invalid-foreground: 0 0% 5%;
    --simulated: 38 95% 60%;
    --simulated-foreground: 0 0% 5%;

    --radius: 0.5rem;
  }
}
```

**Why not pure `#000`/`#FFF` for text?** Pure black-on-white and pure white-on-black both cause visible halation/vibration for extended reading — every serious "black and white" interface (Linear, Vercel, Stripe docs dark mode) pulls text in by a few percent for exactly this reason. This spec keeps your brief (white↔black surfaces, black↔white text) while keeping body copy readable. If you want *literal* `#000`/`#FFF` everywhere regardless, swap `0 0% 5%` → `0 0% 0%` and `0 0% 98%` → `0 0% 100%` — the rest of the system still works.

### 2.1 Fonts ("better fonts" spec)

| Role | Font | Notes |
|---|---|---|
| UI / body | **Inter** or **Geist Sans** | Variable weight, excellent at small sizes, this is the shadcn default pairing target |
| Headings | **Geist Sans** (bold/semibold) or **Söhne** if licensed | Keep it in the same family as body — no display serif; this is an evidence product, not a magazine |
| Numeric/data (amounts, hashes, IDs) | **Geist Mono** or **JetBrains Mono** | Use for every amount, hash, receipt ID, approval ID — tabular figures on, so columns of numbers align |
| Code blocks | **JetBrains Mono** | `record()` calls, receipt JSON |

```ts
// app/layout.tsx
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
```

```css
:root {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
body { font-family: var(--font-sans); font-feature-settings: "cv11", "ss01"; }
```

Type scale (Tailwind classes, use consistently — don't invent new sizes per screen):

| Use | Class |
|---|---|
| Page title | `text-2xl font-semibold tracking-tight` |
| Section header | `text-lg font-semibold` |
| Body | `text-sm text-foreground` |
| Secondary/meta | `text-sm text-muted-foreground` |
| Amounts, hashes, IDs | `font-mono text-sm tabular-nums` |
| Status badge text | `text-xs font-medium uppercase tracking-wide` |

---

## 3. Icons — Phosphor, monochrome

```tsx
import { ShieldCheck, ShieldWarning, Lock, FileText, Eye, EyeSlash } from "@phosphor-icons/react";
```

**Rules:**
- Weight: `regular` for inline/body icons, `bold` for nav and empty-state icons, `fill` reserved *only* for the verified/invalid status icons (a filled check vs. a filled X reads faster than outline in a pass/fail moment)
- Color: `currentColor`, inherited from `text-foreground` (or `text-muted-foreground` for secondary icons) — never hardcode a hex. This is what "black icons" actually means in a two-theme product: **black in light mode, white in dark mode, because a literally-always-black icon disappears on a black background.** If a truly fixed-black icon is required regardless of theme (e.g. inside a light-surface card that never inverts), set it explicitly with `text-[hsl(0_0%_5%)]`.
- Size: `size={16}` inline with text, `size={20}` in buttons/badges, `size={24}` for section icons, `size={32}+` only for empty states
- Never use Phosphor's `duotone` or filled-color variants — they reintroduce color the theme is deliberately avoiding

**Icon vocabulary for ProofLane specifically:**

| Concept | Icon |
|---|---|
| Verified / valid receipt | `ShieldCheck` (fill weight, `text-verified`) |
| Invalid / tampered | `ShieldWarning` or `XCircle` (fill weight, `text-invalid`) |
| Simulated attestation | `Flask` or `WarningCircle` (`text-simulated`) |
| Hidden/committed field | `EyeSlash` |
| Selectively disclosed field | `Eye` |
| Receipt / evidence pack | `FileText` / `FileLock` |
| Signature | `SealCheck` |
| Hash / commitment | `Fingerprint` |
| Trust boundary / gateway | `ShieldStar` or `DoorOpen` |
| Capture coverage | `Pulse` |
| Copy receipt / export | `Export`, `Copy` |

---

## 4. Component mapping

Every ProofLane screen maps to shadcn primitives — don't build custom components where these cover it.

| Screen | shadcn components |
|---|---|
| **Receipt viewer** | `Card` (receipt container), `Separator` between field groups, `Badge` for attestation mode, `Tooltip` on hashes to show full value |
| **Verifier dashboard** | `Table` for the verdict list (Binding / Ed25519 / ML-DSA-65 / Inclusion / Attestation), `Badge` per row (verified/invalid/simulated variants below) |
| **Selective disclosure panel** | `Dialog` to request/confirm a disclosure, `Alert` to show the disclosed value + match confirmation |
| **Tamper demo** | Two `Card`s side by side (original vs. modified), `Tabs` to switch, big `Badge` for the verdict |
| **Evidence-pack export** | `Card` with a manifest list, `Button` (primary, black/white) for export, `Tooltip` explaining what's excluded |
| **Capture coverage dashboard** | `Table` or stat `Card`s for attempted/successful/dropped/retries, `Alert` (destructive variant) if loss > 0 |
| **Gateway config** | `Tabs` per action type, `Switch` for sync-vs-async capture, `Input`/`Select` for field mapping |

### 4.1 Status badge variants (extend shadcn's `Badge`)

```tsx
// components/ui/status-badge.tsx
const statusBadgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide",
  {
    variants: {
      status: {
        verified: "bg-[hsl(var(--verified))] text-[hsl(var(--verified-foreground))]",
        invalid: "bg-[hsl(var(--invalid))] text-[hsl(var(--invalid-foreground))]",
        simulated: "bg-[hsl(var(--simulated))] text-[hsl(var(--simulated-foreground))]",
        neutral: "bg-secondary text-secondary-foreground",
      },
    },
  }
);
```

Usage: `<StatusBadge status="verified"><ShieldCheck weight="fill" size={14}/> Valid</StatusBadge>`

This is the **only** place color other than black/white/grey appears in the product. Every other surface — cards, nav, buttons, tables — stays strictly monochrome per the theme tokens above.

---

## 5. Layout principles

1. **One dominant action per screen.** The verifier screen's job is to answer "valid or not" — that verdict is the largest thing on the page, not a line item in a table.
2. **Hidden fields are shown as hidden, not omitted.** A field masked as `••••••••` with an `EyeSlash` icon communicates privacy-by-design far better than the field simply not appearing — it's proof the system *saw* the data and chose not to expose it.
3. **Hashes, IDs, and amounts are always monospace and always copyable** (`Copy` icon button on hover/focus) — this is an evidence tool; people will paste these into tickets and emails.
4. **No skeleton shimmer/gradient loaders.** Use a simple monochrome pulse or a static "Verifying…" state with a spinner icon (`CircleNotch` from Phosphor, `animate-spin`). Shimmer gradients break the strict black/white palette.
5. **Dark mode is a first-class default**, not an afterthought toggle — this is a security/audit tool likely to live in a SOC or ops environment. Ship the theme switcher (`Sun`/`Moon` Phosphor icons) in the top-right of the nav, respecting `prefers-color-scheme` on first load.

---

## 6. Example: verdict card (put-it-together reference)

```tsx
<Card className="border-border">
  <CardHeader className="flex flex-row items-center justify-between">
    <CardTitle className="text-lg font-semibold">Receipt verdict</CardTitle>
    <StatusBadge status="verified">
      <ShieldCheck weight="fill" size={14} /> Valid
    </StatusBadge>
  </CardHeader>
  <CardContent className="space-y-3">
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">Binding</span>
      <StatusBadge status="verified">Pass</StatusBadge>
    </div>
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">Ed25519</span>
      <StatusBadge status="verified">Pass</StatusBadge>
    </div>
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">Attestation</span>
      <StatusBadge status="simulated">
        <Flask size={14} /> Simulated
      </StatusBadge>
    </div>
    <Separator />
    <div className="flex justify-between font-mono text-sm tabular-nums">
      <span className="text-muted-foreground">Amount</span>
      <span>$48,200.00</span>
    </div>
  </CardContent>
</Card>
```

This one card demonstrates every rule above: black/white surfaces via theme tokens, monospace numerics, Phosphor icons at `size={14}` inheriting color, and color used *only* on the three status badges.

---

## 7. What NOT to do

- No gradients, no glassmorphism, no colored shadows
- No blue links or blue focus rings — use the `--ring` token (black in light, white in dark) for focus states
- No more than the three status colors (verified / invalid / simulated) anywhere in the product
- No Phosphor duotone/fill-color icon sets outside the status vocabulary above
- No decorative illustration — if a screen feels empty, that's the strict palette doing its job; resist the urge to add color to fill space
