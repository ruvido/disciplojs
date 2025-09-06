#!/usr/bin/env node

/**
 * Migration Order Validator and Applier
 * 
 * This script validates that all Supabase migrations follow the correct order
 * and dependency chain for the Disciplo project.
 */

const fs = require('fs');
const path = require('path');

const MIGRATION_ORDER = [
  '001_initial_schema.sql',      // Base tables and types
  '002_battleplans.sql',         // Battleplan-related tables
  '003_logbooks_polls.sql',      // Logbooks and polls tables
  '004_rls_policies.sql',        // Row Level Security policies
  '005_initial_data.sql',        // Initial data insertion
  '006_bot_functions.sql',       // Bot-specific functions
  '007_performance_indexes.sql'  // Performance indexes
];

const DEPENDENCIES = {
  '002_battleplans.sql': ['001_initial_schema.sql'],
  '003_logbooks_polls.sql': ['001_initial_schema.sql'],
  '004_rls_policies.sql': ['001_initial_schema.sql', '002_battleplans.sql', '003_logbooks_polls.sql'],
  '005_initial_data.sql': ['001_initial_schema.sql', '002_battleplans.sql'],
  '006_bot_functions.sql': ['001_initial_schema.sql'],
  '007_performance_indexes.sql': ['001_initial_schema.sql', '002_battleplans.sql', '003_logbooks_polls.sql']
};

function validateMigrationOrder() {
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.error('❌ Migrations directory not found at:', migrationsDir);
    process.exit(1);
  }

  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
  
  console.log('🔍 Found migration files:', files);
  console.log('📋 Expected order:', MIGRATION_ORDER);

  // Check for missing migrations
  const missing = MIGRATION_ORDER.filter(expected => !files.includes(expected));
  if (missing.length > 0) {
    console.error('❌ Missing migrations:', missing);
    process.exit(1);
  }

  // Check for unexpected migrations
  const unexpected = files.filter(file => !MIGRATION_ORDER.includes(file));
  if (unexpected.length > 0) {
    console.warn('⚠️ Unexpected migration files (not in order list):', unexpected);
  }

  // Validate dependencies
  for (const [migration, deps] of Object.entries(DEPENDENCIES)) {
    for (const dep of deps) {
      if (!files.includes(dep)) {
        console.error(`❌ Migration ${migration} requires ${dep} but it's missing`);
        process.exit(1);
      }
    }
  }

  console.log('✅ Migration order validation passed');
  return true;
}

function checkMigrationContent() {
  console.log('🔍 Checking migration content...');
  
  const issues = [];
  
  // Check each migration for common issues
  for (const migration of MIGRATION_ORDER) {
    const filePath = path.join(process.cwd(), 'supabase', 'migrations', migration);
    
    if (!fs.existsSync(filePath)) continue;
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for common SQL issues
    if (content.includes('groups.group_id')) {
      issues.push(`${migration}: Contains invalid column reference 'groups.group_id'`);
    }
    
    if (migration.includes('_rls_') && !content.includes('ROW LEVEL SECURITY')) {
      issues.push(`${migration}: RLS file should contain 'ROW LEVEL SECURITY'`);
    }
    
    // Check for CASCADE consistency
    if (content.includes('REFERENCES') && migration === '002_battleplans.sql') {
      const routineLogsMatch = content.match(/user_id UUID REFERENCES users\(id\)([^,\n]*)/);
      if (routineLogsMatch && !routineLogsMatch[1].includes('ON DELETE CASCADE')) {
        issues.push(`${migration}: user_id in routine_logs should have ON DELETE CASCADE`);
      }
    }
  }
  
  if (issues.length > 0) {
    console.error('❌ Content validation issues found:');
    issues.forEach(issue => console.error(`   - ${issue}`));
    return false;
  }
  
  console.log('✅ Migration content validation passed');
  return true;
}

function main() {
  console.log('🚀 Starting migration validation...\n');
  
  const orderValid = validateMigrationOrder();
  const contentValid = checkMigrationContent();
  
  if (orderValid && contentValid) {
    console.log('\n✅ All migrations are valid and ready to apply!');
    console.log('📝 Recommended application order:');
    MIGRATION_ORDER.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file}`);
    });
  } else {
    console.log('\n❌ Migration validation failed. Please fix issues before applying.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  validateMigrationOrder,
  checkMigrationContent,
  MIGRATION_ORDER,
  DEPENDENCIES
};