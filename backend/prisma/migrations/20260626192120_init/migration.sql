-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('admin', 'gestor', 'engenheiro', 'usuario', 'cliente');

-- CreateEnum
CREATE TYPE "public"."ProjectStatus" AS ENUM ('ativo', 'revisao', 'encerrado');

-- CreateEnum
CREATE TYPE "public"."DocumentType" AS ENUM ('lista_materiais', 'lista_estimativa', 'lista_cabos');

-- CreateTable
CREATE TABLE "public"."companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'usuario',
    "company_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" TEXT NOT NULL,
    "name_pt" TEXT NOT NULL,
    "name_en" TEXT,
    "name_es" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."materials" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "code_warning" TEXT,
    "code_validated" BOOLEAN NOT NULL DEFAULT false,
    "name_pt" TEXT NOT NULL,
    "name_en" TEXT,
    "name_es" TEXT,
    "description_pt" TEXT,
    "description_en" TEXT,
    "description_es" TEXT,
    "category_id" TEXT NOT NULL,
    "created_by_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."material_variants" (
    "id" TEXT NOT NULL,
    "material_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "code_warning" TEXT,
    "code_validated" BOOLEAN NOT NULL DEFAULT false,
    "name_pt" TEXT NOT NULL,
    "name_en" TEXT,
    "name_es" TEXT,
    "unit" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "material_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."projects" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."ProjectStatus" NOT NULL DEFAULT 'ativo',
    "company_id" TEXT,
    "created_by_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."documents" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "public"."DocumentType" NOT NULL,
    "revision" TEXT NOT NULL DEFAULT '00',
    "created_by_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_items" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "line_number" INTEGER NOT NULL,
    "quantity" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "unit_price" DECIMAL(12,4),
    "total_price" DECIMAL(12,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "action" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "status_code" INTEGER NOT NULL,
    "old_data" JSONB,
    "new_data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_cnpj_key" ON "public"."companies"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "materials_code_key" ON "public"."materials"("code");

-- CreateIndex
CREATE INDEX "materials_deletedAt_idx" ON "public"."materials"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "material_variants_code_key" ON "public"."material_variants"("code");

-- CreateIndex
CREATE INDEX "material_variants_material_id_idx" ON "public"."material_variants"("material_id");

-- CreateIndex
CREATE INDEX "material_variants_deletedAt_idx" ON "public"."material_variants"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "projects_code_key" ON "public"."projects"("code");

-- CreateIndex
CREATE INDEX "projects_company_id_idx" ON "public"."projects"("company_id");

-- CreateIndex
CREATE INDEX "projects_deletedAt_idx" ON "public"."projects"("deletedAt");

-- CreateIndex
CREATE INDEX "documents_project_id_idx" ON "public"."documents"("project_id");

-- CreateIndex
CREATE INDEX "documents_deletedAt_idx" ON "public"."documents"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "documents_project_id_code_key" ON "public"."documents"("project_id", "code");

-- CreateIndex
CREATE INDEX "document_items_variant_id_idx" ON "public"."document_items"("variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "document_items_document_id_line_number_key" ON "public"."document_items"("document_id", "line_number");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "public"."audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "public"."audit_logs"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."materials" ADD CONSTRAINT "materials_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."materials" ADD CONSTRAINT "materials_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."material_variants" ADD CONSTRAINT "material_variants_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "projects_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "projects_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_items" ADD CONSTRAINT "document_items_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_items" ADD CONSTRAINT "document_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "public"."material_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
