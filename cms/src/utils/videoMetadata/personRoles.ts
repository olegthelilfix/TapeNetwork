export type PersonRole = "host" | "guest";

export type PersonRoleRow = {
  personId: number | null;
  role: PersonRole;
};

const isPersonRole = (value: unknown): value is PersonRole => {
  return value === "host" || value === "guest";
};

const toRow = (value: unknown): PersonRoleRow | null => {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const candidate = value as { personId?: unknown; role?: unknown };
  const personId = typeof candidate.personId === "number" ? candidate.personId : null;
  const role = isPersonRole(candidate.role) ? candidate.role : "guest";

  return { personId, role };
};

export const toPersonRoleRows = (value: unknown): PersonRoleRow[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(toRow).filter((row): row is PersonRoleRow => row !== null);
};

export const toPersonRolePayload = (rows: readonly PersonRoleRow[]): { personId: number; role: PersonRole }[] => {
  return rows
    .filter((row): row is { personId: number; role: PersonRole } => typeof row.personId === "number")
    .map((row) => ({ personId: row.personId, role: row.role }));
};

export const toSecurityIds = (value: unknown): number[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((id): id is number => typeof id === "number");
};
