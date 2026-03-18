import { getAdminSession } from '@/lib/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession()

  if (!session) {
    // No session - just render children (login page handles its own layout)
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-earth-50">
      <AdminSidebar />
      <main className="flex-1 md:ml-64 min-h-screen">
        <div className="p-6 md:p-8 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  )
}
