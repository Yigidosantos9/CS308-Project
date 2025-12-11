-- Fix: Allow NULL values in comment column for rating-only reviews
ALTER TABLE reviews ALTER COLUMN comment DROP NOT NULL;

-- Fix: Allow NULL values in rating column for comment-only reviews
ALTER TABLE reviews ALTER COLUMN rating DROP NOT NULL;

-- Clear existing test reviews for user 42 (for testing purposes)
DELETE FROM reviews WHERE user_id = 42;
