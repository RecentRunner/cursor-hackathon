-- Layered avatar customization: hex colors per layer and sprite variant ids.

alter table public.avatar_state
  drop constraint if exists avatar_state_skin_tone_check,
  drop constraint if exists avatar_state_head_style_check,
  drop constraint if exists avatar_state_torso_style_check,
  drop constraint if exists avatar_state_shoe_style_check,
  drop constraint if exists avatar_state_eye_type_check;

alter table public.avatar_state
  rename column skin_tone to skin_color;

alter table public.avatar_state
  alter column skin_color type text using
    case skin_color
      when 'peach' then '#FFDFC4'
      when 'tan' then '#A87149'
      when 'brown' then '#8D5524'
      when 'olive' then '#C68642'
      when 'deep' then '#3B2212'
      else coalesce(nullif(skin_color, ''), '#808080')
    end;

alter table public.avatar_state
  alter column skin_color set default '#808080';

alter table public.avatar_state
  add column if not exists pants_style text not null default 'none',
  add column if not exists pants_color text not null default '#808080',
  add column if not exists head_color text not null default '#808080',
  add column if not exists torso_color text not null default '#808080',
  add column if not exists shoe_color text not null default '#808080',
  add column if not exists avatar_customized boolean not null default false;

alter table public.avatar_state
  alter column head_style set default 'none',
  alter column torso_style set default 'none',
  alter column shoe_style set default 'none',
  alter column eye_type set default 'none',
  alter column eye_color set default '#808080';

update public.avatar_state
set
  head_style = 'none',
  torso_style = 'none',
  shoe_style = 'none',
  eye_type = 'none',
  skin_color = coalesce(nullif(skin_color, ''), '#808080'),
  pants_color = '#808080',
  head_color = '#808080',
  torso_color = '#808080',
  shoe_color = '#808080',
  eye_color = coalesce(nullif(eye_color, ''), '#808080')
where avatar_customized = false;

comment on column public.avatar_state.skin_color is 'Skin layer tint hex color.';
comment on column public.avatar_state.pants_style is 'Pants sprite variant id or none.';
comment on column public.avatar_state.pants_color is 'Pants layer tint hex color.';
comment on column public.avatar_state.shoe_style is 'Shoes sprite variant id or none.';
comment on column public.avatar_state.shoe_color is 'Shoes layer tint hex color.';
comment on column public.avatar_state.torso_style is 'Torso sprite variant id or none.';
comment on column public.avatar_state.torso_color is 'Torso layer tint hex color.';
comment on column public.avatar_state.eye_type is 'Eyes sprite variant id or none.';
comment on column public.avatar_state.eye_color is 'Eyes layer tint hex color.';
comment on column public.avatar_state.head_style is 'Head sprite variant id or none.';
comment on column public.avatar_state.head_color is 'Head layer tint hex color.';
comment on column public.avatar_state.avatar_customized is 'True after the user confirms avatar setup during onboarding.';
