import { SkinType } from "@prisma/client";

export const SUPPORTED_SKIN_TYPES: { name: string; value: SkinType }[] = [
  { name: "Normal", value: "NORMAL" },
  { name: "Oily", value: "OILY" },
  { name: "Dry", value: "DRY" },
  { name: "Combination", value: "COMBINATION" },
  { name: "Sensitive", value: "SENSITIVE" },
];

export const SUPPORTED_CONCERNS: { name: string; value: string }[] = [
  { name: "Acne", value: "Acne" },
  { name: "Fine Lines & Wrinkles", value: "Fine Lines & Wrinkles" },
  { name: "Hyperpigmentation", value: "Hyperpigmentation" },
  { name: "Redness", value: "Redness" },
  { name: "Dryness", value: "Dryness" },
];