import { ComingSoonStudio } from "@/components/dashboard/ComingSoonStudio";

export default function EditingPage() {
  return (
    <ComingSoonStudio
      title="Video Editing"
      modelHandle="wan-edit"
      description="Upscale, color-grade, restyle, or extend a clip. Surgical edits that keep motion consistent. Up to 2 minutes input, all common formats."
      cost="12 cr / gen"
      tier="Pro+"
      windowCode="wan://edit · pro"
      fields={[
        { kind: "upload", label: "Source video", hint: "max 2 min" },
        {
          kind: "select",
          label: "Edit type",
          options: ["upscale", "color grade", "restyle", "extend", "denoise"],
          default: "upscale",
        },
        { kind: "slider", label: "Strength", min: 0, max: 100, default: 60, suffix: "%" },
        { kind: "toggle", label: "Keep audio", default: true },
      ]}
    />
  );
}
