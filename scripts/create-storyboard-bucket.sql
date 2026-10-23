-- One-time setup for the Storyboard Visualizer storage bucket.
-- The API routes also auto-create this bucket at runtime, so this script is
-- optional (useful if you prefer provisioning via the SQL editor).
insert into storage.buckets (id, name, public)
values ('storyboard-media', 'storyboard-media', true)
on conflict (id) do nothing;
