import { getSessionUser } from "@/lib/session";
import { Mail, Shield, Trash2, KeyRound } from "lucide-react";

export default async function SettingsPage() {
  const user = await getSessionUser();

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-10 space-y-10">
      <div>
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-white/35 mb-2">
          — Settings
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          Account
        </h1>
        <p className="text-sm text-white/55 mt-2">
          Profile, security, and preferences. More coming soon.
        </p>
      </div>

      {/* Profile */}
      <section className="rounded-2xl surface-raised p-6 space-y-5">
        <div>
          <div className="font-display text-lg text-white mb-1">Profile</div>
          <div className="text-xs text-white/45">Visible across the app.</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-3 items-center">
          <div className="text-xs font-mono uppercase tracking-wider text-white/55">
            Avatar
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-gradient flex items-center justify-center text-base font-bold text-white">
              {user?.email?.[0]?.toUpperCase() ?? "?"}
            </div>
            <button className="btn-glass text-xs" disabled>
              Upload (soon)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-3 items-center">
          <div className="text-xs font-mono uppercase tracking-wider text-white/55">
            Username
          </div>
          <input
            type="text"
            placeholder="Optional handle"
            defaultValue={user?.username ?? ""}
            className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand/50 focus:bg-white/[0.05] transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-3 items-center">
          <div className="text-xs font-mono uppercase tracking-wider text-white/55">
            Email
          </div>
          <div className="flex items-center gap-2 text-sm text-white/85 font-mono">
            <Mail className="w-3.5 h-3.5 text-white/40" />
            {user?.email ?? "—"}
          </div>
        </div>

        <button className="btn-glass text-xs" disabled>
          Save changes
        </button>
      </section>

      {/* Preferences */}
      <section id="preferences" className="rounded-2xl surface-raised p-6 space-y-4">
        <div>
          <div className="font-display text-lg text-white mb-1">Preferences</div>
          <div className="text-xs text-white/45">How the app behaves.</div>
        </div>

        <PreferenceRow label="Email notifications" hint="Render complete, billing receipts" defaultOn />
        <PreferenceRow label="Auto-save to library" hint="Always on for now" defaultOn locked />
        <PreferenceRow label="Beta features" hint="Get new models early" defaultOn={false} />
      </section>

      {/* Security */}
      <section className="rounded-2xl surface-raised p-6 space-y-5">
        <div>
          <div className="font-display text-lg text-white mb-1 flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-glow" />
            Security
          </div>
          <div className="text-xs text-white/45">Keep your account safe.</div>
        </div>

        <button className="w-full text-left px-4 py-3 rounded-lg surface surface-hover text-sm flex items-center gap-3" disabled>
          <KeyRound className="w-4 h-4 text-white/55" />
          <div className="flex-1">
            <div className="text-white">Change password</div>
            <div className="text-xs text-white/45">Sends a reset code to your email</div>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/35">
            Soon
          </span>
        </button>
      </section>

      {/* Danger zone */}
      <section className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 space-y-3">
        <div>
          <div className="font-display text-lg text-red-300 mb-1 flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Danger zone
          </div>
          <div className="text-xs text-white/55">Permanent and irreversible.</div>
        </div>

        <button
          disabled
          className="w-full text-left px-4 py-3 rounded-lg border border-red-500/20 bg-red-500/5 text-sm hover:bg-red-500/10 transition-colors flex items-center justify-between disabled:cursor-not-allowed"
        >
          <span className="text-red-200">Delete account</span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-red-300/60">
            Soon
          </span>
        </button>
      </section>
    </div>
  );
}

function PreferenceRow({
  label,
  hint,
  defaultOn,
  locked,
}: {
  label: string;
  hint: string;
  defaultOn: boolean;
  locked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-white/[0.04] last:border-0">
      <div className="min-w-0">
        <div className="text-sm text-white">{label}</div>
        <div className="text-xs text-white/45 mt-0.5">{hint}</div>
      </div>
      <div
        className={`relative inline-block w-10 h-5 rounded-full ${
          defaultOn ? "bg-brand" : "bg-white/15"
        } ${locked ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <div
          className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            defaultOn ? "translate-x-5" : ""
          }`}
        />
      </div>
    </div>
  );
}
