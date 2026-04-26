import Link from "next/link";
import { Library as LibraryIcon, Sparkles, Filter, Search } from "lucide-react";
import { getInsforgeServer } from "@/lib/insforge";
import { getSessionUser } from "@/lib/session";
import type { VideoGeneration } from "@/types";

export default async function LibraryPage() {
  const user = await getSessionUser();
  let videos: VideoGeneration[] = [];

  if (user) {
    try {
      const sdk = await getInsforgeServer();
      const { data } = await sdk.database
        .from("video_generations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(60);
      videos = (data ?? []) as VideoGeneration[];
    } catch {
      // Falls through to empty state
    }
  }

  return (
    <div className="max-w-screen-2xl mx-auto p-6 md:p-10">
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-white/35 mb-2">
            — My videos
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
            Library
          </h1>
          <p className="text-sm text-white/55 mt-2">
            Every render, in one place. {videos.length > 0 ? `${videos.length} clips so far.` : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn-glass text-xs">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
          <button className="btn-glass text-xs">
            <Search className="w-3.5 h-3.5" />
            Search
          </button>
        </div>
      </div>

      {videos.length === 0 ? (
        <div className="rounded-2xl surface-raised p-16 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
            <LibraryIcon className="w-7 h-7 text-white/30" />
          </div>
          <div className="font-display text-xl text-white mb-1">No videos yet</div>
          <div className="text-sm text-white/50 mb-6 max-w-sm mx-auto">
            Once you generate something, it lands here automatically. Free generations give you 50 credits a month to experiment with.
          </div>
          <Link href="/dashboard/t2v" className="btn btn-primary text-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Generate your first
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      )}
    </div>
  );
}

function VideoCard({ video }: { video: VideoGeneration }) {
  const date = new Date(video.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  return (
    <div className="group relative aspect-video rounded-xl overflow-hidden border border-white/[0.08] bg-black/40 hover:border-white/20 transition-all">
      {video.video_url ? (
        <video
          src={video.video_url}
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
          onMouseEnter={(e) => e.currentTarget.play()}
          onMouseLeave={(e) => e.currentTarget.pause()}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-mono uppercase tracking-wider text-white/40">
          {video.status}
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-sm font-mono text-[10px] uppercase tracking-wider text-white/85 border border-white/10">
        {video.feature_type.replace(/-/g, " ")}
      </div>
      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-sm font-mono text-[10px] text-white/85 border border-white/10">
        {date}
      </div>

      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs">
        <span className="font-mono text-white/65">
          {video.credits_used ?? "?"} cr
        </span>
        {video.video_url && (
          <a
            href={video.video_url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-0.5 rounded-md bg-white/15 backdrop-blur-sm border border-white/15 text-white/90 hover:bg-white/25 transition-colors"
          >
            Download
          </a>
        )}
      </div>
    </div>
  );
}
