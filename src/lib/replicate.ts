import Replicate from "replicate";

if (!process.env.REPLICATE_API_TOKEN) {
  throw new Error("REPLICATE_API_TOKEN missing — add it to .env.local");
}

export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export const WAN_MODELS = {
  t2v: "wan-video/wan-2.5-t2v-fast",
  i2v: "wan-video/wan-2.5-i2v-fast",
} as const;

export type WanModel = keyof typeof WAN_MODELS;
