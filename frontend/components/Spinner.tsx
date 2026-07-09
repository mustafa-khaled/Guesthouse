export default function Spinner() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="flex items-center justify-center py-20"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
