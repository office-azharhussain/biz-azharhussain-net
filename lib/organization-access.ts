import { createAccessControl } from 'better-auth/plugins/access'
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from 'better-auth/plugins/organization/access'

const statement = {
  ...defaultStatements,
  member: [
    ...defaultStatements.member,
    'read',
    'invite',
    'changeRole',
    'remove',
  ],
} as const

export const organizationAccessControl = createAccessControl(statement)

const managerMemberPermissions = [
  ...defaultStatements.member,
  'read',
  'invite',
  'changeRole',
  'remove',
] as const

export const ownerRole = organizationAccessControl.newRole({
  ...ownerAc.statements,
  member: managerMemberPermissions,
})

export const adminRole = organizationAccessControl.newRole({
  ...adminAc.statements,
  member: managerMemberPermissions,
})

export const memberRole = organizationAccessControl.newRole({
  ...memberAc.statements,
  member: ['read'],
})

export const guestRole = organizationAccessControl.newRole({
  ...memberAc.statements,
  member: ['read'],
})

export const organizationRoles = {
  owner: ownerRole,
  admin: adminRole,
  member: memberRole,
  guest: guestRole,
}

export const organizationRolePolicies = [
  {
    role: 'owner',
    label: 'Owner',
    summary: 'Full control, including organization-level actions.',
    permissions: ['View directory', 'Invite members', 'Change roles', 'Remove members', 'Owner controls'],
  },
  {
    role: 'admin',
    label: 'Admin',
    summary: 'Manage people and invitations without owner-only controls.',
    permissions: ['View directory', 'Invite members', 'Change roles', 'Remove members'],
  },
  {
    role: 'member',
    label: 'Member',
    summary: 'View the organization directory; no administrative actions.',
    permissions: ['View directory'],
  },
  {
    role: 'guest',
    label: 'Guest',
    summary: 'Read-only directory access for invited collaborators.',
    permissions: ['View directory'],
  },
] as const
