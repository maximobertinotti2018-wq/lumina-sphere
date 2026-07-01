'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-slate-950 text-white min-h-screen flex items-center justify-center">
        <div className="p-8 max-w-md text-center bg-white/5 border border-white/10 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">Critical Error</h2>
          <p className="text-white/60 mb-6">{error.message || "Application crashed"}</p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors font-medium"
          >
            Recover
          </button>
        </div>
      </body>
    </html>
  );
}
