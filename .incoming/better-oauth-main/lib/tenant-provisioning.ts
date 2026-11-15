import crypto from 'node:crypto'

function key() {
  return crypto.createHash('sha256').update(process.env.BETTER_AUTH_SECRET ?? '').digest()
}

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds))

async function fetchWithRetry(url: string, init: RequestInit, attempts = 6) {
  let response: Response | undefined
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    response = await fetch(url, { ...init, cache: 'no-store' })
    if (response.ok || (response.status >= 400 && response.status < 500 && response.status !== 404)) return response
    if (attempt < attempts - 1) await wait(1000 * (attempt + 1))
  }
  return response as Response
}

export function encryptTenantConnection(value: string) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  return [iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), encrypted.toString('base64url')].join('.')
}

export async function provisionNeonProject(name: string, slug: string) {
  const databaseName = slug.slice(0, 63)
  const roleName = `${databaseName}_owner`.slice(0, 63)
  const response = await fetch('https://console.neon.tech/api/v2/projects', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.NEON_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ project: { name, org_id: process.env.NEON_ORG_ID, region_id: 'aws-us-east-2', pg_version: 16 } }),
    cache: 'no-store',
  })
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Neon project provisioning failed: ${response.status} ${detail.slice(0, 300)}`)
  }
  const data = await response.json() as { project: { id: string }; connection_uris?: Array<{ connection_uri: string; connection_parameters?: { database?: string; role?: string } }> }
  const authHeaders = { Authorization: `Bearer ${process.env.NEON_API_KEY}`, 'Content-Type': 'application/json' }
  const branches = await fetchWithRetry(`https://console.neon.tech/api/v2/projects/${data.project.id}/branches`, { headers: authHeaders })
  if (!branches.ok) throw new Error(`Neon branch lookup failed: ${branches.status}`)
  const branchData = await branches.json() as { branches?: Array<{ id: string }> }
  const branchId = branchData.branches?.[0]?.id
  if (!branchId) throw new Error('Neon did not return the tenant branch')
  const roleResponse = await fetchWithRetry(`https://console.neon.tech/api/v2/projects/${data.project.id}/branches/${branchId}/roles`, {
    method: 'POST', headers: authHeaders, body: JSON.stringify({ role: { name: roleName } }),
  })
  if (!roleResponse.ok && roleResponse.status !== 409) {
    const detail = await roleResponse.text()
    throw new Error(`Neon role provisioning failed: ${roleResponse.status} ${detail.slice(0, 300)}`)
  }
  const databaseResponse = await fetchWithRetry(`https://console.neon.tech/api/v2/projects/${data.project.id}/branches/${branchId}/databases`, {
    method: 'POST', headers: authHeaders, body: JSON.stringify({ database: { name: databaseName, owner_name: roleName } }),
  })
  if (!databaseResponse.ok && databaseResponse.status !== 409) {
    const detail = await databaseResponse.text()
    throw new Error(`Neon database provisioning failed: ${databaseResponse.status} ${detail.slice(0, 300)}`)
  }
  let connectionUrl = data.connection_uris?.find((item) => item.connection_parameters?.database === databaseName)?.connection_uri
    ?? data.connection_uris?.[0]?.connection_uri
  if (!connectionUrl) {
    const connection = await fetchWithRetry(`https://console.neon.tech/api/v2/projects/${data.project.id}/connection_uri?database_name=${encodeURIComponent(databaseName)}&role_name=${encodeURIComponent(roleName)}`, {
      headers: { Authorization: `Bearer ${process.env.NEON_API_KEY}` },
    })
    if (connection.ok) {
      const result = await connection.json() as { uri?: string; connection_uri?: string }
      connectionUrl = result.uri ?? result.connection_uri
    } else {
      const detail = await connection.text()
      throw new Error(`Neon connection URI failed: ${connection.status} ${detail.slice(0, 300)}`)
    }
  }
  if (!connectionUrl) throw new Error('Neon did not return a connection URL')
  return { projectId: data.project.id, slug, encryptedConnectionUrl: encryptTenantConnection(connectionUrl) }
}
