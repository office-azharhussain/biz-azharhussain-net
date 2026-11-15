import DashboardPage from '@/app/dashboard/page'

export default async function OrganizationDashboard({ params }: { params: Promise<{ organizationSlug: string }> }) {
  const { organizationSlug } = await params
  return <DashboardPage searchParams={Promise.resolve({ organizationSlug })} />
}
