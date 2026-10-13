-- Budgets used to be rupees for everyone; now the poster says which currency.
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "budgetCurrency" TEXT;
