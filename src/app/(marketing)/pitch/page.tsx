import type { Metadata } from "next";
import { PitchDeck } from "./deck";

export const metadata: Metadata = {
  title: "ProofLane — Pitch deck",
  description: "The evidence does not have to come from a system you trust.",
};

export default function PitchPage() {
  return <PitchDeck />;
}
