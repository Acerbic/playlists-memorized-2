// Code generated by Prisma (prisma@1.34.10). DO NOT EDIT.
  // Please don't change this file manually but run `prisma generate` to update it.
  // For more information, please read the docs: https://www.prisma.io/docs/prisma-client/

export const typeDefs = /* GraphQL */ `type AggregatePlaylist {
  count: Int!
}

type AggregateSnapshot {
  count: Int!
}

type AggregateUser {
  count: Int!
}

type AggregateUserAuth {
  count: Int!
}

enum AuthType {
  GOOGLE
}

type BatchPayload {
  count: Long!
}

scalar DateTime

scalar Json

scalar Long

type Mutation {
  createPlaylist(data: PlaylistCreateInput!): Playlist!
  updatePlaylist(data: PlaylistUpdateInput!, where: PlaylistWhereUniqueInput!): Playlist
  updateManyPlaylists(data: PlaylistUpdateManyMutationInput!, where: PlaylistWhereInput): BatchPayload!
  upsertPlaylist(where: PlaylistWhereUniqueInput!, create: PlaylistCreateInput!, update: PlaylistUpdateInput!): Playlist!
  deletePlaylist(where: PlaylistWhereUniqueInput!): Playlist
  deleteManyPlaylists(where: PlaylistWhereInput): BatchPayload!
  createSnapshot(data: SnapshotCreateInput!): Snapshot!
  updateSnapshot(data: SnapshotUpdateInput!, where: SnapshotWhereUniqueInput!): Snapshot
  updateManySnapshots(data: SnapshotUpdateManyMutationInput!, where: SnapshotWhereInput): BatchPayload!
  upsertSnapshot(where: SnapshotWhereUniqueInput!, create: SnapshotCreateInput!, update: SnapshotUpdateInput!): Snapshot!
  deleteSnapshot(where: SnapshotWhereUniqueInput!): Snapshot
  deleteManySnapshots(where: SnapshotWhereInput): BatchPayload!
  createUser(data: UserCreateInput!): User!
  updateUser(data: UserUpdateInput!, where: UserWhereUniqueInput!): User
  upsertUser(where: UserWhereUniqueInput!, create: UserCreateInput!, update: UserUpdateInput!): User!
  deleteUser(where: UserWhereUniqueInput!): User
  deleteManyUsers(where: UserWhereInput): BatchPayload!
  createUserAuth(data: UserAuthCreateInput!): UserAuth!
  updateUserAuth(data: UserAuthUpdateInput!, where: UserAuthWhereUniqueInput!): UserAuth
  updateManyUserAuths(data: UserAuthUpdateManyMutationInput!, where: UserAuthWhereInput): BatchPayload!
  upsertUserAuth(where: UserAuthWhereUniqueInput!, create: UserAuthCreateInput!, update: UserAuthUpdateInput!): UserAuth!
  deleteUserAuth(where: UserAuthWhereUniqueInput!): UserAuth
  deleteManyUserAuths(where: UserAuthWhereInput): BatchPayload!
}

enum MutationType {
  CREATED
  UPDATED
  DELETED
}

interface Node {
  id: ID!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

type Playlist {
  id: ID!
  created_at: DateTime!
  modified_at: DateTime!
  type: PlaylistType!
  source_id: String!
  snapshots(where: SnapshotWhereInput, orderBy: SnapshotOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Snapshot!]
}

type PlaylistConnection {
  pageInfo: PageInfo!
  edges: [PlaylistEdge]!
  aggregate: AggregatePlaylist!
}

input PlaylistCreateInput {
  id: ID
  created_at: DateTime!
  modified_at: DateTime!
  type: PlaylistType!
  source_id: String!
  snapshots: SnapshotCreateManyInput
}

type PlaylistEdge {
  node: Playlist!
  cursor: String!
}

enum PlaylistOrderByInput {
  id_ASC
  id_DESC
  created_at_ASC
  created_at_DESC
  modified_at_ASC
  modified_at_DESC
  type_ASC
  type_DESC
  source_id_ASC
  source_id_DESC
}

type PlaylistPreviousValues {
  id: ID!
  created_at: DateTime!
  modified_at: DateTime!
  type: PlaylistType!
  source_id: String!
}

type PlaylistSubscriptionPayload {
  mutation: MutationType!
  node: Playlist
  updatedFields: [String!]
  previousValues: PlaylistPreviousValues
}

input PlaylistSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: PlaylistWhereInput
  AND: [PlaylistSubscriptionWhereInput!]
}

enum PlaylistType {
  YOUTUBE
}

input PlaylistUpdateInput {
  created_at: DateTime
  modified_at: DateTime
  type: PlaylistType
  source_id: String
  snapshots: SnapshotUpdateManyInput
}

input PlaylistUpdateManyMutationInput {
  created_at: DateTime
  modified_at: DateTime
  type: PlaylistType
  source_id: String
}

input PlaylistWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  created_at: DateTime
  created_at_not: DateTime
  created_at_in: [DateTime!]
  created_at_not_in: [DateTime!]
  created_at_lt: DateTime
  created_at_lte: DateTime
  created_at_gt: DateTime
  created_at_gte: DateTime
  modified_at: DateTime
  modified_at_not: DateTime
  modified_at_in: [DateTime!]
  modified_at_not_in: [DateTime!]
  modified_at_lt: DateTime
  modified_at_lte: DateTime
  modified_at_gt: DateTime
  modified_at_gte: DateTime
  type: PlaylistType
  type_not: PlaylistType
  type_in: [PlaylistType!]
  type_not_in: [PlaylistType!]
  source_id: String
  source_id_not: String
  source_id_in: [String!]
  source_id_not_in: [String!]
  source_id_lt: String
  source_id_lte: String
  source_id_gt: String
  source_id_gte: String
  source_id_contains: String
  source_id_not_contains: String
  source_id_starts_with: String
  source_id_not_starts_with: String
  source_id_ends_with: String
  source_id_not_ends_with: String
  snapshots_some: SnapshotWhereInput
  AND: [PlaylistWhereInput!]
}

input PlaylistWhereUniqueInput {
  id: ID
}

type Query {
  playlist(where: PlaylistWhereUniqueInput!): Playlist
  playlists(where: PlaylistWhereInput, orderBy: PlaylistOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Playlist]!
  playlistsConnection(where: PlaylistWhereInput, orderBy: PlaylistOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): PlaylistConnection!
  snapshot(where: SnapshotWhereUniqueInput!): Snapshot
  snapshots(where: SnapshotWhereInput, orderBy: SnapshotOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Snapshot]!
  snapshotsConnection(where: SnapshotWhereInput, orderBy: SnapshotOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): SnapshotConnection!
  user(where: UserWhereUniqueInput!): User
  users(where: UserWhereInput, orderBy: UserOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [User]!
  usersConnection(where: UserWhereInput, orderBy: UserOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): UserConnection!
  userAuth(where: UserAuthWhereUniqueInput!): UserAuth
  userAuths(where: UserAuthWhereInput, orderBy: UserAuthOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [UserAuth]!
  userAuthsConnection(where: UserAuthWhereInput, orderBy: UserAuthOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): UserAuthConnection!
  node(id: ID!): Node
}

type Snapshot {
  id: ID!
  created_at: DateTime!
  data: Json
}

type SnapshotConnection {
  pageInfo: PageInfo!
  edges: [SnapshotEdge]!
  aggregate: AggregateSnapshot!
}

input SnapshotCreateInput {
  id: ID
  created_at: DateTime!
  data: Json
}

input SnapshotCreateManyInput {
  create: [SnapshotCreateInput!]
  connect: [SnapshotWhereUniqueInput!]
}

type SnapshotEdge {
  node: Snapshot!
  cursor: String!
}

enum SnapshotOrderByInput {
  id_ASC
  id_DESC
  created_at_ASC
  created_at_DESC
  data_ASC
  data_DESC
}

type SnapshotPreviousValues {
  id: ID!
  created_at: DateTime!
  data: Json
}

input SnapshotScalarWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  created_at: DateTime
  created_at_not: DateTime
  created_at_in: [DateTime!]
  created_at_not_in: [DateTime!]
  created_at_lt: DateTime
  created_at_lte: DateTime
  created_at_gt: DateTime
  created_at_gte: DateTime
  AND: [SnapshotScalarWhereInput!]
  OR: [SnapshotScalarWhereInput!]
  NOT: [SnapshotScalarWhereInput!]
}

type SnapshotSubscriptionPayload {
  mutation: MutationType!
  node: Snapshot
  updatedFields: [String!]
  previousValues: SnapshotPreviousValues
}

input SnapshotSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: SnapshotWhereInput
  AND: [SnapshotSubscriptionWhereInput!]
}

input SnapshotUpdateDataInput {
  created_at: DateTime
  data: Json
}

input SnapshotUpdateInput {
  created_at: DateTime
  data: Json
}

input SnapshotUpdateManyDataInput {
  created_at: DateTime
  data: Json
}

input SnapshotUpdateManyInput {
  create: [SnapshotCreateInput!]
  update: [SnapshotUpdateWithWhereUniqueNestedInput!]
  upsert: [SnapshotUpsertWithWhereUniqueNestedInput!]
  delete: [SnapshotWhereUniqueInput!]
  connect: [SnapshotWhereUniqueInput!]
  set: [SnapshotWhereUniqueInput!]
  disconnect: [SnapshotWhereUniqueInput!]
  deleteMany: [SnapshotScalarWhereInput!]
  updateMany: [SnapshotUpdateManyWithWhereNestedInput!]
}

input SnapshotUpdateManyMutationInput {
  created_at: DateTime
  data: Json
}

input SnapshotUpdateManyWithWhereNestedInput {
  where: SnapshotScalarWhereInput!
  data: SnapshotUpdateManyDataInput!
}

input SnapshotUpdateWithWhereUniqueNestedInput {
  where: SnapshotWhereUniqueInput!
  data: SnapshotUpdateDataInput!
}

input SnapshotUpsertWithWhereUniqueNestedInput {
  where: SnapshotWhereUniqueInput!
  update: SnapshotUpdateDataInput!
  create: SnapshotCreateInput!
}

input SnapshotWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  created_at: DateTime
  created_at_not: DateTime
  created_at_in: [DateTime!]
  created_at_not_in: [DateTime!]
  created_at_lt: DateTime
  created_at_lte: DateTime
  created_at_gt: DateTime
  created_at_gte: DateTime
  AND: [SnapshotWhereInput!]
}

input SnapshotWhereUniqueInput {
  id: ID
}

type Subscription {
  playlist(where: PlaylistSubscriptionWhereInput): PlaylistSubscriptionPayload
  snapshot(where: SnapshotSubscriptionWhereInput): SnapshotSubscriptionPayload
  user(where: UserSubscriptionWhereInput): UserSubscriptionPayload
  userAuth(where: UserAuthSubscriptionWhereInput): UserAuthSubscriptionPayload
}

type User {
  id: ID!
  auths(where: UserAuthWhereInput, orderBy: UserAuthOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [UserAuth!]
}

type UserAuth {
  id: ID!
  type: AuthType!
  user: User!
  authId: String!
  extra: Json
}

type UserAuthConnection {
  pageInfo: PageInfo!
  edges: [UserAuthEdge]!
  aggregate: AggregateUserAuth!
}

input UserAuthCreateInput {
  id: ID
  type: AuthType!
  user: UserCreateOneWithoutAuthsInput!
  authId: String!
  extra: Json
}

input UserAuthCreateManyWithoutUserInput {
  create: [UserAuthCreateWithoutUserInput!]
  connect: [UserAuthWhereUniqueInput!]
}

input UserAuthCreateWithoutUserInput {
  id: ID
  type: AuthType!
  authId: String!
  extra: Json
}

type UserAuthEdge {
  node: UserAuth!
  cursor: String!
}

enum UserAuthOrderByInput {
  id_ASC
  id_DESC
  type_ASC
  type_DESC
  authId_ASC
  authId_DESC
  extra_ASC
  extra_DESC
}

type UserAuthPreviousValues {
  id: ID!
  type: AuthType!
  authId: String!
  extra: Json
}

input UserAuthScalarWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  type: AuthType
  type_not: AuthType
  type_in: [AuthType!]
  type_not_in: [AuthType!]
  authId: String
  authId_not: String
  authId_in: [String!]
  authId_not_in: [String!]
  authId_lt: String
  authId_lte: String
  authId_gt: String
  authId_gte: String
  authId_contains: String
  authId_not_contains: String
  authId_starts_with: String
  authId_not_starts_with: String
  authId_ends_with: String
  authId_not_ends_with: String
  AND: [UserAuthScalarWhereInput!]
  OR: [UserAuthScalarWhereInput!]
  NOT: [UserAuthScalarWhereInput!]
}

type UserAuthSubscriptionPayload {
  mutation: MutationType!
  node: UserAuth
  updatedFields: [String!]
  previousValues: UserAuthPreviousValues
}

input UserAuthSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: UserAuthWhereInput
  AND: [UserAuthSubscriptionWhereInput!]
}

input UserAuthUpdateInput {
  type: AuthType
  user: UserUpdateOneRequiredWithoutAuthsInput
  authId: String
  extra: Json
}

input UserAuthUpdateManyDataInput {
  type: AuthType
  authId: String
  extra: Json
}

input UserAuthUpdateManyMutationInput {
  type: AuthType
  authId: String
  extra: Json
}

input UserAuthUpdateManyWithoutUserInput {
  create: [UserAuthCreateWithoutUserInput!]
  delete: [UserAuthWhereUniqueInput!]
  connect: [UserAuthWhereUniqueInput!]
  set: [UserAuthWhereUniqueInput!]
  disconnect: [UserAuthWhereUniqueInput!]
  update: [UserAuthUpdateWithWhereUniqueWithoutUserInput!]
  upsert: [UserAuthUpsertWithWhereUniqueWithoutUserInput!]
  deleteMany: [UserAuthScalarWhereInput!]
  updateMany: [UserAuthUpdateManyWithWhereNestedInput!]
}

input UserAuthUpdateManyWithWhereNestedInput {
  where: UserAuthScalarWhereInput!
  data: UserAuthUpdateManyDataInput!
}

input UserAuthUpdateWithoutUserDataInput {
  type: AuthType
  authId: String
  extra: Json
}

input UserAuthUpdateWithWhereUniqueWithoutUserInput {
  where: UserAuthWhereUniqueInput!
  data: UserAuthUpdateWithoutUserDataInput!
}

input UserAuthUpsertWithWhereUniqueWithoutUserInput {
  where: UserAuthWhereUniqueInput!
  update: UserAuthUpdateWithoutUserDataInput!
  create: UserAuthCreateWithoutUserInput!
}

input UserAuthWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  type: AuthType
  type_not: AuthType
  type_in: [AuthType!]
  type_not_in: [AuthType!]
  user: UserWhereInput
  authId: String
  authId_not: String
  authId_in: [String!]
  authId_not_in: [String!]
  authId_lt: String
  authId_lte: String
  authId_gt: String
  authId_gte: String
  authId_contains: String
  authId_not_contains: String
  authId_starts_with: String
  authId_not_starts_with: String
  authId_ends_with: String
  authId_not_ends_with: String
  AND: [UserAuthWhereInput!]
}

input UserAuthWhereUniqueInput {
  id: ID
}

type UserConnection {
  pageInfo: PageInfo!
  edges: [UserEdge]!
  aggregate: AggregateUser!
}

input UserCreateInput {
  id: ID
  auths: UserAuthCreateManyWithoutUserInput
}

input UserCreateOneWithoutAuthsInput {
  create: UserCreateWithoutAuthsInput
  connect: UserWhereUniqueInput
}

input UserCreateWithoutAuthsInput {
  id: ID
}

type UserEdge {
  node: User!
  cursor: String!
}

enum UserOrderByInput {
  id_ASC
  id_DESC
}

type UserPreviousValues {
  id: ID!
}

type UserSubscriptionPayload {
  mutation: MutationType!
  node: User
  updatedFields: [String!]
  previousValues: UserPreviousValues
}

input UserSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: UserWhereInput
  AND: [UserSubscriptionWhereInput!]
}

input UserUpdateInput {
  auths: UserAuthUpdateManyWithoutUserInput
}

input UserUpdateOneRequiredWithoutAuthsInput {
  create: UserCreateWithoutAuthsInput
  connect: UserWhereUniqueInput
}

input UserWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  auths_some: UserAuthWhereInput
  AND: [UserWhereInput!]
}

input UserWhereUniqueInput {
  id: ID
}
`