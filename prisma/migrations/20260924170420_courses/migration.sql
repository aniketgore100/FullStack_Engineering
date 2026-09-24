-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "steps" JSONB NOT NULL,
    "stepCount" INTEGER NOT NULL,
    "completed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Course_userId_updatedAt_idx" ON "Course"("userId", "updatedAt");

-- AlterTable
ALTER TABLE "Generation" ADD COLUMN "courseId" TEXT;

-- Keep courses that were stored inside Generation.course before this table existed
INSERT INTO "Course" ("id", "userId", "prompt", "title", "summary", "level", "duration", "steps", "stepCount", "createdAt", "updatedAt")
SELECT g."course"->>'id', g."userId", g."prompt", g."course"->>'title', g."course"->>'summary',
       g."course"->>'level', g."course"->>'duration', g."course"->'steps',
       jsonb_array_length(g."course"->'steps'), g."createdAt", g."createdAt"
FROM "Generation" g
WHERE g."course" IS NOT NULL AND g."course"->>'id' IS NOT NULL
ON CONFLICT ("id") DO NOTHING;

UPDATE "Generation" SET "courseId" = "course"->>'id'
WHERE "course" IS NOT NULL AND "course"->>'id' IS NOT NULL;

-- AlterTable
ALTER TABLE "Generation" DROP COLUMN "course";

-- AddForeignKey
ALTER TABLE "Generation" ADD CONSTRAINT "Generation_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
