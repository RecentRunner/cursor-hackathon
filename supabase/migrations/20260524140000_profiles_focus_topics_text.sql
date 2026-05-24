-- Store profile preferences as JSON text instead of text[].
-- Safe when the column is already text (no-op cast).

alter table public.profiles
  alter column focus_topics drop default;

alter table public.profiles
  alter column focus_topics type text using (
    case
      when focus_topics is null then null
      when pg_typeof(focus_topics)::text = 'text[]' then
        case
          when coalesce(array_length(focus_topics::text[], 1), 0) = 0 then null
          else (focus_topics::text[])[1]
        end
      else focus_topics::text
    end
  );

alter table public.profiles
  alter column focus_topics set default null;
