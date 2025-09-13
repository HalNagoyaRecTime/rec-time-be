-- CreateTable
CREATE TABLE "students" (
    "student_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "class_code" TEXT NOT NULL,
    "attendance_number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "recreations" (
    "recreation_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT NOT NULL,
    "start_time" INTEGER NOT NULL,
    "end_time" INTEGER NOT NULL,
    "max_participants" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "participations" (
    "participation_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "student_id" INTEGER NOT NULL,
    "recreation_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'registered',
    "registered_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "participations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students" ("student_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "participations_recreation_id_fkey" FOREIGN KEY ("recreation_id") REFERENCES "recreations" ("recreation_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "participations_student_id_recreation_id_key" ON "participations"("student_id", "recreation_id");
