-- Group accent color + one-line role description

alter table leadership_groups
  add column if not exists color text not null default '#C8102E';

alter table leadership_roles
  add column if not exists description text;

update leadership_groups set color = '#C8102E' where name = 'Head Table' and (color is null or color = '#C8102E');
update leadership_groups set color = '#8B5CF6' where name = 'Membership Committee';
update leadership_groups set color = '#0EA5E9' where name = 'Visitors Host Team';
update leadership_groups set color = '#F97316' where name = 'Coordinators';
