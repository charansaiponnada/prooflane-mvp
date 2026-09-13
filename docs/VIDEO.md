# ProofLane — One-Take Pitch + Demo

**One continuous recording. No video editor needed.**
**Runtime:** ~3:20 · **Screens:** pitch deck + guided demo · **Recorder:** Windows built-in (Win + Alt + R)

The deck tells the story, the demo proves it, the deck closes it. You switch between three browser tabs with **Ctrl + Tab** — that is the only "edit".

```
TAB 1  Pitch deck  slides 1–5      0:00 – 1:20   "Why this matters"
TAB 2  Guided demo chapters 1–6    1:20 – 2:50   "Watch it work — and fail"
TAB 3  Pitch deck  slides 13–14    2:50 – 3:20   "Who buys it, last line"
```

---

## 1. Set up (10 minutes, once)

### Recorder — nothing to install
1. Press **Win + G** → Settings (gear) → **Capturing** → turn on **Record audio when I record a game** and set it to **Microphone** (or *All*).
2. Test: open any browser window, press **Win + Alt + R**, say a sentence, press **Win + Alt + R** again. The video lands in `Videos\Captures`. Play it back and check your voice is loud and clear.

> Prefer a nicer look? Recordly can record the same take and export straight to MP4 with its default settings — no timeline editing required. Either works.

### Browser
1. Open a fresh window (guest profile: no bookmarks bar, no extensions).
2. Open **three tabs, in this order**:
   - Tab 1 — `https://prooflane-mvp.vercel.app/pitch.html#1`
   - Tab 2 — `https://prooflane-mvp.vercel.app/demo`
   - Tab 3 — `https://prooflane-mvp.vercel.app/pitch.html#13`
3. Pick the **dark theme** (toggle top-right) so all tabs match.
4. **Warm up the server:** in Tab 2, go to chapter 2 and click *Release* once, then **reload the page** (F5) — this resets the demo to chapter 1 and avoids a slow first request on camera.
5. Go back to Tab 1. Press **F11** for browser full screen.
   Use **F11**, not the deck's own `F` key — F11 stays full screen when you switch tabs; the deck's `F` does not.
6. Windows: turn on **Do not disturb** so no notifications appear.

### Controls you'll use

| Where | Action | Key / click |
|---|---|---|
| Deck | Next / previous slide | **→ / ←** |
| Any tab | Switch to next tab | **Ctrl + Tab** |
| Demo | Next chapter | Click the **Next** button (bottom right) — viewers can follow it |
| Recorder | Start / stop | **Win + Alt + R** |

---

## 2. The script

Say the lines in **bold quotes**. Pauses are part of the pitch — take a breath at every `⏸`.

### TAB 1 — Pitch deck (0:00 – 1:20)

**Slide 1 · Title** · 0:00 – 0:15
Start recording, count two seconds silently, then:
> **"AI agents are starting to move real money. This is ProofLane — the evidence gateway for those agents. Our belief is simple: the evidence doesn't have to come from a system you trust."** ⏸
Press **→**

**Slide 2 · Problem** · 0:15 – 0:35
> **"When an agent's payment is disputed, a company pulls together traces, logs and approval tickets. Two things go wrong. The auditor has to trust the very company they're auditing. And the raw data — account numbers, customer details — is too sensitive to hand over."** ⏸
Press **→**

**Slide 3 · Why now** · 0:35 – 0:55
> **"And this is becoming mandatory. The EU AI Act requires automatic logging for high-risk AI. Yet only 22% of leaders are confident they can produce governance evidence on demand — and 97% of organisations hit by AI breaches lacked proper access controls."** ⏸
Press **→**

**Slide 4 · Solution** · 0:55 – 1:10
> **"ProofLane is one product in three parts. A gateway SDK that wraps any agent tool. A ledger that turns every decision into a signed receipt. And evidence rooms, where auditors check it all themselves."**
Press **→**

**Slide 5 · How it works** · 1:10 – 1:20
> **"Authorize. Seal. Execute. Prove. Let me show you — live."**
Press **Ctrl + Tab**

### TAB 2 — Guided demo (1:20 – 2:50)

**Chapter 1 · The problem** · 1:20 – 1:30
> **"This is what evidence looks like today: the company's own trace — with the account number sitting in plain text."**
Click **Next**

**Chapter 2 · The agent acts** · 1:30 – 1:50
Click **Release $48,200 via ProofLane**, then talk while it seals:
> **"Now the same $48,200 payment goes through ProofLane. Before any money moves, it's checked against policy and sealed into a signed receipt by the CooL SDK. No receipt — no action."**
The demo moves to chapter 3 by itself.

**Chapter 3 · Anyone can verify** · 1:50 – 2:05
Scroll down slowly with the mouse wheel to the green **VALID** card.
> **"An auditor verifies this receipt in their own browser — the signatures, the integrity, the transparency log. They never touch our servers. And the account number? Still hidden."** ⏸
Scroll back up, click **Next**

**Chapter 4 · Auditor asks one question** · 2:05 – 2:20
Click **Disclose approval ID** → **Disclose**.
> **"The auditor asks one question: what was the approval ID? They get exactly that field — proven to match what was sealed — and nothing else."**
Click **Next**

**Chapter 5 · Someone tampers** · 2:20 – 2:40
> **"Now imagine an insider quietly changes $48,200 to $4,820…"**
Click **Change the amount**. Wait one second for the red result.
> **"…and verification fails. Instantly. You cannot rewrite this evidence."** ⏸⏸
Click **Next**

**Chapter 6 · Hand over the evidence** · 2:40 – 2:50
Point the cursor at **Export CooL audit pack** (don't click — a download bar would appear).
> **"The whole evidence pack can be exported and verified on anyone's machine — without trusting our website either."**
Press **Ctrl + Tab**

### TAB 3 — Pitch deck close (2:50 – 3:20)

**Slide 13 · Business** · 2:50 – 3:05
> **"We start with mid-sized fintechs: a paid eight-to-twelve-week pilot on one action — payment release — measured by how much faster evidence is produced, and how much less sensitive data is shared."**
Press **→**

**Slide 14 · Close** · 3:05 – 3:20
> **"ProofLane proves what an AI agent did — to people who don't have to trust us. Let your agents move money… and prove every decision."**
Hold silent for **three seconds**, then press **Win + Alt + R** to stop.

---

## 3. Cue card (print or put on your phone)

```
TAB 1 DECK
 1 Title      AI agents move money · ProofLane · don't need to trust us      →
 2 Problem    trust the company being audited · data too sensitive           →
 3 Why now    EU AI Act · 22% confident · 97% lacked controls                →
 4 Solution   SDK · ledger · evidence rooms                                  →
 5 How        Authorize Seal Execute Prove · "let me show you"      Ctrl+Tab

TAB 2 DEMO
 1 Problem    today's trace, account number in plain text                 Next
 2 Acts       CLICK Release · policy + signed receipt · no receipt no action
 3 Verify     scroll to VALID · own browser · number still hidden         Next
 4 One field  CLICK Disclose → Disclose · exactly one field               Next
 5 Tamper     "insider changes…" CLICK Change amount · "…fails. Instantly." Next
 6 Hand over  hover Export · verify anywhere                          Ctrl+Tab

TAB 3 DECK
13 Business   mid-sized fintechs · paid pilot · faster evidence, less data   →
14 Close      "Let your agents move money… and prove every decision."  hold 3s · STOP
```

---

## 4. Tips for a clean single take

- **Rehearse twice out loud** with the cue card. The third run is usually the keeper.
- **Mistake in the first 30 seconds?** Stop, reload Tab 2, go back to slide 1, start again. Later mistakes: keep going and correct yourself naturally — it sounds human.
- **Slow the mouse down.** Move it only to click; park it at the edge of the screen while you talk.
- **Speak ~10% slower than normal** and smile on the first and last line — it's audible.
- **Before each retake:** reload Tab 2 (F5) so the demo starts at chapter 1 again; press **Home** on Tab 1 to return to slide 1; make sure Tab 3 shows slide 13.

## 5. If something goes wrong on camera

| Problem | What to do without stopping |
|---|---|
| Release takes a few seconds | Keep talking — the line in chapter 2 covers it. |
| Release shows an error | Say "let me run that again" and click once more. |
| Arrow key doesn't change slide | Click once on an empty part of the slide, then press → again. |
| Full screen exits | Press **F11** again and continue. |
| Download bar appears | Ignore it and continue — or don't click Export, only hover. |
