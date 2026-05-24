-- Onboarding flags on profiles, equipped shop items, variant id validation.

alter table public.profiles
  add column if not exists onboarding_quiz_complete boolean not null default false;

comment on column public.profiles.onboarding_quiz_complete is
  'True after the user completes the focus-topic onboarding quiz.';
comment on column public.profiles.onboarding_complete is
  'True after the user confirms avatar customization and enters the app.';

alter table public.avatar_state
  add column if not exists equipped_items text[] not null default '{}';

comment on column public.avatar_state.equipped_items is
  'Shop item ids currently equipped on the avatar (accessories and backgrounds).';

alter table public.avatar_state
  drop constraint if exists avatar_state_pants_style_check,
  drop constraint if exists avatar_state_shoe_style_check,
  drop constraint if exists avatar_state_torso_style_check,
  drop constraint if exists avatar_state_eye_type_check,
  drop constraint if exists avatar_state_head_style_check;

alter table public.avatar_state
  add constraint avatar_state_pants_style_check
    check (pants_style in ('none', 'pants-1', 'pants-2', 'pants-3')),
  add constraint avatar_state_shoe_style_check
    check (shoe_style in ('none', 'shoes-1', 'shoes-2', 'shoes-3')),
  add constraint avatar_state_torso_style_check
    check (torso_style in ('none', 'torso-1', 'torso-2', 'torso-3', 'torso-4')),
  add constraint avatar_state_eye_type_check
    check (eye_type in ('none', 'eyes-1', 'eyes-2')),
  add constraint avatar_state_head_style_check
    check (head_style in ('none', 'head-1', 'head-2', 'head-3', 'head-4', 'head-5', 'head-6', 'head-7'));

alter table public.avatar_state
  drop constraint if exists avatar_state_skin_color_check,
  drop constraint if exists avatar_state_pants_color_check,
  drop constraint if exists avatar_state_shoe_color_check,
  drop constraint if exists avatar_state_torso_color_check,
  drop constraint if exists avatar_state_eye_color_check,
  drop constraint if exists avatar_state_head_color_check;

alter table public.avatar_state
  add constraint avatar_state_skin_color_check
    check (skin_color ~ '^#[0-9A-Fa-f]{6}$'),
  add constraint avatar_state_pants_color_check
    check (pants_color ~ '^#[0-9A-Fa-f]{6}$'),
  add constraint avatar_state_shoe_color_check
    check (shoe_color ~ '^#[0-9A-Fa-f]{6}$'),
  add constraint avatar_state_torso_color_check
    check (torso_color ~ '^#[0-9A-Fa-f]{6}$'),
  add constraint avatar_state_eye_color_check
    check (eye_color ~ '^#[0-9A-Fa-f]{6}$'),
  add constraint avatar_state_head_color_check
    check (head_color ~ '^#[0-9A-Fa-f]{6}$');

-- Backfill quiz completion for users who already finished onboarding.
update public.profiles
set onboarding_quiz_complete = true
where onboarding_complete = true
  and onboarding_quiz_complete = false;
