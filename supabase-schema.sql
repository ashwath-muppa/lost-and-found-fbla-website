-- ============================================================
-- Supabase Schema for School Lost & Found Application
-- Run this SQL in your Supabase SQL Editor to set up the database.
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ─── Items Table ────────────────────────────────────────────
-- Stores all lost and found item reports
create table if not exists items (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  category text not null check (category in ('electronics', 'clothing', 'books', 'accessories', 'sports', 'other')),
  type text not null check (type in ('lost', 'found')),
  location text not null,
  date_occurred date not null,
  time_occurred text not null,
  contact_email text not null,
  image_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'returned')),
  security_answer text not null,
  created_at timestamp with time zone default now()
);

-- ─── Claims Table ───────────────────────────────────────────
-- Tracks claim attempts on items
create table if not exists claims (
  id uuid default uuid_generate_v4() primary key,
  item_id uuid not null references items(id) on delete cascade,
  claimant_name text not null,
  claimant_email text not null,
  security_answer text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'denied')),
  created_at timestamp with time zone default now()
);

-- ─── Row Level Security ─────────────────────────────────────
-- Enable RLS but allow all operations with the anon key for this demo.
-- In production, you'd restrict this to authenticated users only.

alter table items enable row level security;
alter table claims enable row level security;

-- Allow public read access to approved items
create policy "Anyone can view approved items" on items
  for select using (status = 'approved');

-- Allow anyone to insert items (report form)
create policy "Anyone can create items" on items
  for insert with check (true);

-- Allow anyone to read all items (needed for admin)
create policy "Admin can view all items" on items
  for select using (true);

-- Allow updates (admin actions)
create policy "Admin can update items" on items
  for update using (true);

-- Allow deletes (admin actions)
create policy "Admin can delete items" on items
  for delete using (true);

-- Claims policies
create policy "Anyone can create claims" on claims
  for insert with check (true);

create policy "Anyone can view claims" on claims
  for select using (true);

create policy "Admin can update claims" on claims
  for update using (true);

-- ─── Storage Bucket ─────────────────────────────────────────
-- Create a public bucket for item images
-- Note: Run this in the Supabase Dashboard → Storage → New Bucket
-- Bucket name: item-images
-- Public: Yes
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
-- Max file size: 5MB

-- ─── Sample Data (Optional) ─────────────────────────────────
-- Uncomment the lines below to add sample data for testing

insert into items (title, description, category, type, location, date_occurred, time_occurred, contact_email, image_url, status, security_answer) values
  ('Blue Hydroflask Water Bottle', 'A blue 32oz Hydroflask water bottle with stickers on it. Has a dent on the bottom.', 'accessories', 'found', 'Cafeteria', '2026-02-14', '12:30 PM', 'finder@school.edu', null, 'approved', 'stickers of mountains and a sunrise'),
  ('TI-84 Calculator', 'Black TI-84 Plus CE graphing calculator. Name is written on the back in silver sharpie.', 'electronics', 'found', 'Science Lab', '2026-02-13', '3:15 PM', 'mathteacher@school.edu', null, 'approved', 'name written in silver sharpie on back'),
  ('Red Nike Hoodie', 'Lost my red Nike hoodie, size medium. It has a small tear near the left pocket.', 'clothing', 'lost', 'Gym / Locker Room', '2026-02-12', '4:00 PM', 'student1@school.edu', null, 'approved', 'small tear near left pocket'),
  ('AirPods Pro Case', 'White AirPods Pro case with a blue silicone cover. Left in the library study room.', 'electronics', 'lost', 'Library', '2026-02-15', '2:00 PM', 'student2@school.edu', null, 'approved', 'blue silicone cover with initials "JM"'),
  ('AP Biology Textbook', 'Campbell Biology 12th Edition. Has highlighting in chapters 1-5. My name is on the inside cover.', 'books', 'lost', 'Hallway - 2nd Floor', '2026-02-10', '11:00 AM', 'student3@school.edu', null, 'approved', 'yellow highlighting in chapters 1 through 5'),
  ('Soccer Ball', 'Adidas soccer ball, size 5, slightly deflated. Was left near the bleachers after practice.', 'sports', 'found', 'Football Field', '2026-02-11', '5:30 PM', 'coach@school.edu', null, 'approved', 'adidas logo partially worn off'),
  ('Car Keys with Lanyard', 'Set of car keys on a purple school lanyard. Found near the main entrance.', 'accessories', 'found', 'Main Office', '2026-02-16', '8:00 AM', 'security@school.edu', null, 'approved', 'purple lanyard with school logo'),
  ('MacBook Charger', 'White 67W USB-C MacBook charger. Lost in the computer lab during 5th period.', 'electronics', 'lost', 'Computer Lab', '2026-02-15', '1:45 PM', 'student4@school.edu', null, 'pending', 'has a small piece of blue tape on the cable');
