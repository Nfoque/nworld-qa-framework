export interface EngineJobStepRow {
  id: string;
  job_id: string;
  position: number;
  step_type: string;
  status: string;
  input: unknown;
  output: unknown;
  meta: unknown;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface EngineJobRow {
  id: string;
  tenant_id: string;
  status: string;
  selected_sources: unknown;
  created_by: string;
  creator: {
    name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function toStepDto(s: EngineJobStepRow) {
  return {
    id: s.id,
    position: s.position,
    stepType: s.step_type,
    status: s.status,
    input: s.input,
    output: s.output,
    meta: s.meta,
    errorMessage: s.error_message,
    startedAt: s.started_at,
    completedAt: s.completed_at,
  };
}

export function toJobDto(row: EngineJobRow, steps: EngineJobStepRow[]) {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    status: row.status,
    selectedSources: row.selected_sources,
    createdBy: row.created_by,
    createdByName: row.creator?.name ?? row.creator?.email ?? null,
    createdByAvatar: row.creator?.avatar_url ?? null,
    errorMessage: row.error_message,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    steps: steps.map(toStepDto),
  };
}
