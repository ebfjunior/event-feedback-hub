-- Add CHECK constraints for rating and text length
ALTER TABLE "Feedback"
  ADD CONSTRAINT "feedback_rating_check" CHECK (rating BETWEEN 1 AND 5),
  ADD CONSTRAINT "feedback_text_length_check" CHECK (char_length(text) BETWEEN 1 AND 1000);
-- This is an empty migration.