/** Presentation surface: no site navigation, the deck owns the viewport. */
export default function DeckLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-muted/40 p-2 sm:p-4">
      {children}
    </main>
  );
}
