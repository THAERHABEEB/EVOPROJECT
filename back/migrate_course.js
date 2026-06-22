const { runQuery } = require('./config/db.js');

async function migrate() {
    console.log('Starting migration: Adding doctor_id to course table...');
    try {
        // Step 1: Add the column
        // Standard SQL: tables/columns are case-insensitive unless quoted.
        // We will use lowercase "course" and "doctor_id"
        await runQuery('ALTER TABLE "course" ADD COLUMN IF NOT EXISTS "doctor_id" INT;');
        console.log('✅ Column doctor_id added or already exists in course table.');

        // Step 2: Add the foreign key constraint
        const fkQuery = `
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_course_doctor') THEN
                    ALTER TABLE "course" 
                    ADD CONSTRAINT fk_course_doctor 
                    FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id");
                END IF;
            END $$;
        `;
        await runQuery(fkQuery);
        console.log('✅ Foreign key constraint added or already exists.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
