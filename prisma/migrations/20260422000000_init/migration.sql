-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'INVESTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SOLD');

-- CreateTable
CREATE TABLE "users" (
    "id"         TEXT         NOT NULL,
    "auth_id"    TEXT         NOT NULL,
    "email"      TEXT,
    "phone"      TEXT,
    "name"       TEXT,
    "avatar_url" TEXT,
    "provider"   TEXT         NOT NULL,
    "role"       "Role"       NOT NULL DEFAULT 'INVESTOR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_profiles" (
    "id"           TEXT         NOT NULL,
    "user_id"      TEXT         NOT NULL,
    "company_name" TEXT         NOT NULL,
    "description"  TEXT,
    "industry"     TEXT,
    "website"      TEXT,
    "logo_url"     TEXT,
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listings" (
    "id"                   TEXT           NOT NULL,
    "business_profile_id"  TEXT           NOT NULL,
    "title"                TEXT           NOT NULL,
    "description"          TEXT           NOT NULL,
    "asking_price"         DECIMAL(15,2),
    "annual_revenue"       DECIMAL(15,2),
    "industry"             TEXT,
    "location"             TEXT,
    "status"               "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at"           TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"           TIMESTAMP(3)   NOT NULL,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interests" (
    "id"          TEXT         NOT NULL,
    "listing_id"  TEXT         NOT NULL,
    "investor_id" TEXT         NOT NULL,
    "message"     TEXT,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_auth_id_key"  ON "users"("auth_id");
CREATE UNIQUE INDEX "users_email_key"    ON "users"("email");
CREATE UNIQUE INDEX "users_phone_key"    ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "business_profiles_user_id_key" ON "business_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "interests_listing_id_investor_id_key"
    ON "interests"("listing_id", "investor_id");

-- AddForeignKey
ALTER TABLE "business_profiles"
    ADD CONSTRAINT "business_profiles_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings"
    ADD CONSTRAINT "listings_business_profile_id_fkey"
    FOREIGN KEY ("business_profile_id") REFERENCES "business_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interests"
    ADD CONSTRAINT "interests_listing_id_fkey"
    FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interests"
    ADD CONSTRAINT "interests_investor_id_fkey"
    FOREIGN KEY ("investor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
