-- Migration to rename rewards_balance to credits in employees table
ALTER TABLE public.employees RENAME COLUMN rewards_balance TO credits;
