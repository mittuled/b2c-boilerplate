import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center space-y-4">
        <div className="text-6xl font-bold text-gray-300">403</div>
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
        <div className="flex justify-center gap-4">
          <Link href="/dashboard" className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Go back</Link>
          <Link href="mailto:support@example.com" className="rounded-md border px-4 py-2 hover:bg-gray-50">Contact admin</Link>
        </div>
      </div>
    </main>
  );
}
