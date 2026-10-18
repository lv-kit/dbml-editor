ALTER TABLE "user" DROP CONSTRAINT "user_email_unique";--> statement-breakpoint
CREATE INDEX "project_user_id_idx" ON "project" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_active_unique" ON "user" USING btree (lower("email")) WHERE "user"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "user_organization_id_idx" ON "user" USING btree ("organization_id");