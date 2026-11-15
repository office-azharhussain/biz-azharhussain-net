import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { provisionNeonProject } from '@/lib/tenant-provisioning'
import { audit } from '@/lib/logger'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json() as { organizationId?: string }
  if (!body.organizationId) return NextResponse.json({ error: 'Organization is required' }, { status: 400 })
  const membership = await prisma.member.findFirst({ where: { organizationId: body.organizationId, userId: session.user.id } })
  if (!membership || membership.role !== 'owner') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const existing = await prisma.tenantDatabase.findUnique({ where: { organizationId: body.organizationId } })
  if (existing?.status === 'active') return NextResponse.json({ status: 'active' })
  const organization = await prisma.organization.findUnique({ where: { id: body.organizationId } })
  if (!organization) return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
  await audit({ action: 'tenant.provision.started', message: `Tenant provisioning started for ${organization.name}`, userId: session.user.id, organizationId: organization.id, metadata: { slug: organization.slug } })
  try {
    const tenant = await provisionNeonProject(organization.name, organization.slug)
    await prisma.tenantDatabase.upsert({ where: { organizationId: organization.id }, create: { organizationId: organization.id, providerProjectId: tenant.projectId, slug: tenant.slug, encryptedConnectionUrl: tenant.encryptedConnectionUrl, status: 'active' }, update: { providerProjectId: tenant.projectId, slug: tenant.slug, encryptedConnectionUrl: tenant.encryptedConnectionUrl, status: 'active' } })
    await audit({ action: 'tenant.provision.completed', message: `Tenant database provisioned for ${organization.name}`, userId: session.user.id, organizationId: organization.id, metadata: { projectId: tenant.projectId, slug: tenant.slug } })
    return NextResponse.json({ status: 'active' })
  } catch (error) {
    await audit({ action: 'tenant.provision.failed', message: `Tenant provisioning failed for ${organization.name}`, level: 'error', userId: session.user.id, organizationId: organization.id, metadata: { error: error instanceof Error ? error.message : 'Unknown error' } })
    return NextResponse.json({ status: 'failed', error: 'Tenant database provisioning failed' }, { status: 500 })
  }
}
