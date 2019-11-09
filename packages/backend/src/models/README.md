# types and models

This directory holds TS interface definitions for entities used by app that are
reflective of database-persisted information.

Prisma data model definitions - "../../prisma/datamodel.prisma" are considered
the primary _source of truth_ when regarding data object types. Typescript types
for interfaces used in app logic are DERIVED from those definitions.

While this makes the code ultimately tied to Prisma.io data storage system, it
is a trade-off to reduce definitions duplication / misalignment.

Alternatives would be:

1. Have Prisma datamodel definitions AND typescript separate definitions for
   interfaces and classes, but this is (A) duplication, (B) demands extra
   efforts to keep two on the same page.
2. Have TS code to be the origin of truth, and then have DB definitions
   extracted from code, by some annotation parsing or other means, but this
   solution needs extra tooling and not natively supported by Prisma ecosystem.
