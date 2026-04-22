ALTER TABLE "listings"
  ADD COLUMN "province"           TEXT,
  ADD COLUMN "share_percentage"   DECIMAL(5,2),
  ADD COLUMN "net_profit"         DECIMAL(15,2),
  ADD COLUMN "employee_count"     INTEGER,
  ADD COLUMN "year_established"   INTEGER,
  ADD COLUMN "operating_hours"    TEXT,
  ADD COLUMN "reason_for_selling" TEXT;
