-- CreateEnum: SurveyAudience
CREATE TYPE "SurveyAudience" AS ENUM ('CANDIDATE', 'HIRING_MANAGER', 'WORKPLACE', 'IT_SUPPORT');

-- AlterTable: Add audience to survey_templates
ALTER TABLE "survey_templates" ADD COLUMN "audience" "SurveyAudience" NOT NULL DEFAULT 'CANDIDATE';
CREATE INDEX "survey_templates_audience_idx" ON "survey_templates"("audience");

-- AlterTable: Add audience to surveys  
ALTER TABLE "surveys" ADD COLUMN "audience" "SurveyAudience" NOT NULL DEFAULT 'CANDIDATE';
CREATE INDEX "surveys_audience_idx" ON "surveys"("audience");

-- AlterTable: Add audience to survey_responses
ALTER TABLE "survey_responses" ADD COLUMN "audience" "SurveyAudience" NOT NULL DEFAULT 'CANDIDATE';
CREATE INDEX "survey_responses_audience_idx" ON "survey_responses"("audience");

-- AlterTable: Add audience to geo_metrics
ALTER TABLE "geo_metrics" ADD COLUMN "audience" "SurveyAudience" NOT NULL DEFAULT 'CANDIDATE';
CREATE INDEX "geo_metrics_audience_idx" ON "geo_metrics"("audience");
-- Update unique constraint
ALTER TABLE "geo_metrics" DROP CONSTRAINT IF EXISTS "geo_metrics_country_date_key";
ALTER TABLE "geo_metrics" ADD CONSTRAINT "geo_metrics_country_date_audience_key" UNIQUE("country", "date", "audience");

-- AlterTable: Add audience to daily_metrics
ALTER TABLE "daily_metrics" ADD COLUMN "audience" "SurveyAudience" NOT NULL DEFAULT 'CANDIDATE';
CREATE INDEX "daily_metrics_audience_idx" ON "daily_metrics"("audience");
-- Update unique constraint
ALTER TABLE "daily_metrics" DROP CONSTRAINT IF EXISTS "daily_metrics_date_key";
ALTER TABLE "daily_metrics" ADD CONSTRAINT "daily_metrics_date_audience_key" UNIQUE("date", "audience");

