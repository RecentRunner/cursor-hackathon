-- Avatar appearance customization, progression (level/xp), and in-world currency.
-- Extends avatar_state from the initial schema; coins column already exists there.

alter table public.avatar_state
  add column if not exists head_style text not null default 'round',
  add column if not exists torso_style text not null default 'tee',
  add column if not exists shoe_style text not null default 'sneakers',
  add column if not exists skin_tone text not null default 'peach',
  add column if not exists eye_type text not null default 'dot',
  add column if not exists eye_color text not null default '#1e293b',
  add column if not exists level int not null default 1,
  add column if not exists xp int not null default 0;

alter table public.avatar_state
  drop constraint if exists avatar_state_head_style_check,
  drop constraint if exists avatar_state_torso_style_check,
  drop constraint if exists avatar_state_shoe_style_check,
  drop constraint if exists avatar_state_skin_tone_check,
  drop constraint if exists avatar_state_eye_type_check,
  drop constraint if exists avatar_state_level_check,
  drop constraint if exists avatar_state_xp_check,
  drop constraint if exists avatar_state_coins_check;

alter table public.avatar_state
  add constraint avatar_state_head_style_check
    check (head_style in ('round', 'square', 'spiky')),
  add constraint avatar_state_torso_style_check
    check (torso_style in ('tee', 'hoodie', 'vest')),
  add constraint avatar_state_shoe_style_check
    check (shoe_style in ('sneakers', 'boots', 'sandals', 'loafers')),
  add constraint avatar_state_skin_tone_check
    check (skin_tone in ('peach', 'tan', 'brown', 'olive', 'deep')),
  add constraint avatar_state_eye_type_check
    check (eye_type in ('dot', 'round', 'sleepy')),
  add constraint avatar_state_level_check
    check (level >= 1),
  add constraint avatar_state_xp_check
    check (xp >= 0),
  add constraint avatar_state_coins_check
    check (coins >= 0);

comment on column public.avatar_state.head_style is 'Avatar head shape preset.';
comment on column public.avatar_state.torso_style is 'Avatar torso outfit preset.';
comment on column public.avatar_state.shoe_style is 'Avatar footwear preset.';
comment on column public.avatar_state.skin_tone is 'Avatar skin tone preset.';
comment on column public.avatar_state.eye_type is 'Avatar eye shape preset.';
comment on column public.avatar_state.eye_color is 'Avatar eye color hex value.';
comment on column public.avatar_state.level is 'Player level earned from habits, quizzes, and streaks.';
comment on column public.avatar_state.xp is 'Experience points toward the next level.';
comment on column public.avatar_state.coins is 'In-world currency spent in the shop.';
