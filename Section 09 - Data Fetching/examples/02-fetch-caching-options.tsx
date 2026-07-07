// Three common fetch() caching modes:

// 1. Cache indefinitely (default-ish behavior for static data)
await fetch("https://api.example.com/posts", { cache: "force-cache" });

// 2. Never cache — always fetch fresh (opts the route into dynamic rendering)
await fetch("https://api.example.com/live-price", { cache: "no-store" });

// 3. Cache, but revalidate after N seconds (time-based revalidation)
await fetch("https://api.example.com/posts", { next: { revalidate: 60 } });

// 4. Cache, tagged for on-demand invalidation via revalidateTag()
await fetch("https://api.example.com/posts", { next: { tags: ["posts"] } });
