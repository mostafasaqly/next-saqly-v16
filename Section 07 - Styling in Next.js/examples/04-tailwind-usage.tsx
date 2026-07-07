// app/components/Button.tsx
// Tailwind is enabled automatically by the create-next-app prompt —
// utility classes work immediately, no extra setup needed in a route file.

export default function Button({ children }: { children: React.ReactNode }) {
  return (
    <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
      {children}
    </button>
  );
}
