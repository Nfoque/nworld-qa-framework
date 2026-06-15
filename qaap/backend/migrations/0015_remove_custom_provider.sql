-- Remove 'custom' from allowed provider_name values
alter table llm_provider_configs drop constraint llm_provider_configs_provider_name_check;
alter table llm_provider_configs add constraint llm_provider_configs_provider_name_check
  check (provider_name in ('anthropic', 'openai', 'google', 'ollama', 'litellm'));
