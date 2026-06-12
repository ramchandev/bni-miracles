-- Allow marking completed 1-2-1 meetings as met

alter table one_on_one_requests drop constraint if exists one_on_one_requests_status_check;

alter table one_on_one_requests add constraint one_on_one_requests_status_check
  check (status in ('pending', 'accepted', 'declined', 'cancelled', 'met'));
