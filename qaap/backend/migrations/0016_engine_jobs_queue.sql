-- Engine Jobs Queue — pgmq message queue the standalone worker polls.
--
-- Job intake flow: create-engine-job inserts the engine_job (status=queued) and
-- enqueues exactly one message { job_id, tenant_id }. The worker reads with a
-- visibility timeout (the job "lease"), so if a worker crashes mid-job the
-- message reappears and another worker picks it up (at-least-once delivery).
--
-- Visibility timeout (VT): 300s. NOTE: pgmq sets VT at READ time, not at queue
-- creation — the worker calls pgmq.read('engine_jobs_queue', 300, 1). The real
-- per-job lock is the queued -> running status claim (see task 24q287zy); the
-- pgmq VT is only the secondary safety net. The worker must complete the job (or
-- extend the VT for long-running steps) before the 300s lease expires, otherwise
-- the message becomes visible again and the job's idempotent resume kicks in.

create extension if not exists pgmq;

-- Create the queue (idempotent — migrations run once, but stay re-run safe).
do $$
begin
  if not exists (select 1 from pgmq.list_queues() where queue_name = 'engine_jobs_queue') then
    perform pgmq.create('engine_jobs_queue');
  end if;
end $$;

-- Enqueue wrapper: lets edge functions (service_role) push a job message without
-- granting them direct access to the pgmq schema. SECURITY DEFINER so it runs
-- with the owner's rights. Returns the pgmq message id.
create or replace function public.enqueue_engine_job(p_job_id uuid, p_tenant_id uuid)
returns bigint
language plpgsql
security definer
set search_path = pgmq, public
as $$
declare
  v_msg_id bigint;
begin
  if p_job_id is null or p_tenant_id is null then
    raise exception 'enqueue_engine_job: job_id and tenant_id are required';
  end if;

  select pgmq.send(
    'engine_jobs_queue',
    jsonb_build_object('job_id', p_job_id, 'tenant_id', p_tenant_id)
  ) into v_msg_id;

  return v_msg_id;
end;
$$;

-- Only service_role (edge functions) may enqueue. Never anon/authenticated.
revoke all on function public.enqueue_engine_job(uuid, uuid) from public;
grant execute on function public.enqueue_engine_job(uuid, uuid) to service_role;
