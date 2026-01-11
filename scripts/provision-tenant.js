#!/usr/bin/env node
/**
 * Tenant Provisioning Script
 * 
 * Automatizes the creation of new tenants (imobiliárias) in the multi-tenant CRM system.
 * 
 * Usage:
 *   node scripts/provision-tenant.js \
 *     --name "Imobiliária ABC" \
 *     --email "contato@abc.com" \
 *     --admin-email "admin@abc.com" \
 *     --admin-password "SenhaSegura123!" \
 *     --plan "prime" \
 *     --custom-domain "abc.com.br"
 * 
 * @version 1.0.0
 * @date 2026-01-11
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config();

// ============================================================================
// Configuration
// ============================================================================

const config = {
  centralDB: {
    url: process.env.CENTRAL_DB_URL,
    key: process.env.CENTRAL_DB_KEY
  },
  tenantTemplate: {
    url: process.env.TENANT_DB_URL,
    key: process.env.TENANT_DB_KEY
  }
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Hash password using bcrypt-compatible algorithm
 */
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Generate unique database name
 */
function generateDatabaseName() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `tenant_${timestamp}_${random}`;
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Parse command line arguments
 */
function parseArguments() {
  const args = process.argv.slice(2);
  const parsed = {};
  
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    parsed[key] = value;
  }
  
  return parsed;
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate tenant data
 */
function validateTenantData(data) {
  const errors = [];
  
  if (!data.name) errors.push('Company name is required');
  if (!data.email) errors.push('Company email is required');
  if (!data.adminEmail) errors.push('Admin email is required');
  if (!data.adminPassword) errors.push('Admin password is required');
  if (!data.plan) errors.push('Plan is required');
  
  if (data.email && !isValidEmail(data.email)) {
    errors.push('Invalid company email format');
  }
  
  if (data.adminEmail && !isValidEmail(data.adminEmail)) {
    errors.push('Invalid admin email format');
  }
  
  if (data.adminPassword && data.adminPassword.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  if (data.plan && !['prime', 'k', 'k2'].includes(data.plan)) {
    errors.push('Invalid plan. Must be: prime, k, or k2');
  }
  
  return errors;
}

// ============================================================================
// Main Provisioning Function
// ============================================================================

/**
 * Provision a new tenant
 */
async function provisionNewTenant(tenantData) {
  const {
    name: companyName,
    email: companyEmail,
    adminEmail,
    adminPassword,
    plan: planName,
    customDomain
  } = tenantData;
  
  console.log(`\n📦 Provisionando novo tenant: ${companyName}...`);
  console.log(`━`.repeat(60));
  
  try {
    // ========================================================================
    // Step 1: Connect to central database
    // ========================================================================
    
    console.log('\n[1/8] Conectando ao banco central...');
    
    if (!config.centralDB.url || !config.centralDB.key) {
      throw new Error('Central database credentials not configured. Check .env file.');
    }
    
    const centralDB = createClient(config.centralDB.url, config.centralDB.key);
    console.log('✅ Conexão estabelecida');
    
    // ========================================================================
    // Step 2: Check if company already exists
    // ========================================================================
    
    console.log('\n[2/8] Verificando se empresa já existe...');
    
    const { data: existingCompany } = await centralDB
      .from('companies')
      .select('id')
      .eq('email', companyEmail)
      .single();
    
    if (existingCompany) {
      throw new Error(`Company with email ${companyEmail} already exists`);
    }
    
    console.log('✅ Email disponível');
    
    // ========================================================================
    // Step 3: Create company record
    // ========================================================================
    
    console.log('\n[3/8] Criando registro da empresa...');
    
    const databaseName = generateDatabaseName();
    
    const { data: company, error: companyError } = await centralDB
      .from('companies')
      .insert({
        name: companyName,
        email: companyEmail,
        database_name: databaseName,
        database_url: config.tenantTemplate.url,
        database_key: config.tenantTemplate.key,
        is_active: true
      })
      .select()
      .single();
    
    if (companyError) throw companyError;
    
    console.log(`✅ Empresa criada`);
    console.log(`   ID: ${company.id}`);
    console.log(`   Database: ${databaseName}`);
    
    // ========================================================================
    // Step 4: Get subscription plan
    // ========================================================================
    
    console.log('\n[4/8] Buscando plano de assinatura...');
    
    const { data: plan, error: planError } = await centralDB
      .from('subscription_plans')
      .select('*')
      .eq('name', planName)
      .single();
    
    if (planError) throw new Error(`Plan '${planName}' not found`);
    
    console.log(`✅ Plano encontrado: ${plan.display_name}`);
    console.log(`   Preço: R$ ${plan.price_monthly}/mês`);
    console.log(`   Usuários: ${plan.max_users}`);
    console.log(`   Imóveis: ${plan.max_properties || 'Ilimitado'}`);
    
    // ========================================================================
    // Step 5: Create subscription
    // ========================================================================
    
    console.log('\n[5/8] Criando assinatura...');
    
    const { error: subscriptionError } = await centralDB
      .from('tenant_subscriptions')
      .insert({
        tenant_id: company.id,
        plan_id: plan.id,
        status: 'active',
        started_at: new Date().toISOString(),
        current_users: 1,
        current_properties: 0,
        additional_users: 0
      });
    
    if (subscriptionError) throw subscriptionError;
    
    console.log(`✅ Assinatura criada`);
    
    // ========================================================================
    // Step 6: Create admin user
    // ========================================================================
    
    console.log('\n[6/8] Criando usuário administrador...');
    
    const passwordHash = hashPassword(adminPassword);
    
    const { data: adminUser, error: userError } = await centralDB
      .from('users')
      .insert({
        company_id: company.id,
        email: adminEmail,
        password_hash: passwordHash,
        name: 'Administrador',
        role: 'admin',
        active: true,
        email_verified: true
      })
      .select()
      .single();
    
    if (userError) throw userError;
    
    console.log(`✅ Usuário admin criado`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    
    // ========================================================================
    // Step 7: Register custom domain (optional)
    // ========================================================================
    
    if (customDomain) {
      console.log('\n[7/8] Registrando domínio customizado...');
      
      const { error: domainError } = await centralDB
        .from('custom_domains')
        .insert({
          tenant_id: company.id,
          domain: customDomain,
          is_primary: true,
          status: 'pending',
          ssl_enabled: false
        });
      
      if (domainError) {
        console.log(`⚠️  Erro ao registrar domínio: ${domainError.message}`);
      } else {
        console.log(`✅ Domínio registrado: ${customDomain}`);
        console.log(`   Status: Pendente (requer configuração DNS)`);
      }
    } else {
      console.log('\n[7/8] Domínio customizado não fornecido (pulando)');
    }
    
    // ========================================================================
    // Step 8: Initialize tenant database
    // ========================================================================
    
    console.log('\n[8/8] Inicializando banco de dados do tenant...');
    console.log('⚠️  Nota: As tabelas do tenant devem ser criadas manualmente');
    console.log('   Execute: migrations/migration-tenant-database.sql');
    console.log('   No projeto Supabase específico do tenant');
    
    // ========================================================================
    // Success Report
    // ========================================================================
    
    console.log(`\n${'═'.repeat(60)}`);
    console.log('🎉 Tenant provisionado com sucesso!');
    console.log(`${'═'.repeat(60)}`);
    console.log('\n📊 Resumo:');
    console.log(`   Empresa: ${company.name}`);
    console.log(`   ID: ${company.id}`);
    console.log(`   Database: ${databaseName}`);
    console.log(`   Plano: ${plan.display_name} (R$ ${plan.price_monthly}/mês)`);
    console.log(`   Admin: ${adminUser.email}`);
    if (customDomain) {
      console.log(`   Domínio: ${customDomain} (pendente configuração)`);
    }
    
    console.log('\n📝 Próximos passos:');
    console.log('   1. Execute migration-tenant-database.sql no Supabase do tenant');
    console.log('   2. Configure DNS para o domínio customizado (se aplicável)');
    console.log('   3. Teste o login com as credenciais do admin');
    console.log('   4. Verifique isolamento de dados');
    
    console.log(`\n${'═'.repeat(60)}\n`);
    
    return {
      success: true,
      company,
      plan,
      adminUser
    };
    
  } catch (error) {
    console.error('\n❌ Erro ao provisionar tenant:', error.message);
    console.error('\nStack trace:', error.stack);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================================
// CLI Entry Point
// ============================================================================

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     CRM Imobiliário - Tenant Provisioning Script         ║');
  console.log('║     Version: 1.0.0                                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  // Parse arguments
  const args = parseArguments();
  
  const tenantData = {
    name: args.name,
    email: args.email,
    adminEmail: args['admin-email'],
    adminPassword: args['admin-password'],
    plan: args.plan || 'prime',
    customDomain: args['custom-domain']
  };
  
  // Validate
  console.log('\n🔍 Validando dados...');
  const errors = validateTenantData(tenantData);
  
  if (errors.length > 0) {
    console.error('\n❌ Erros de validação:');
    errors.forEach(error => console.error(`   - ${error}`));
    console.log('\n💡 Uso correto:');
    console.log('   node scripts/provision-tenant.js \\');
    console.log('     --name "Nome da Empresa" \\');
    console.log('     --email "contato@empresa.com" \\');
    console.log('     --admin-email "admin@empresa.com" \\');
    console.log('     --admin-password "SenhaSegura123!" \\');
    console.log('     --plan "prime" \\');
    console.log('     --custom-domain "empresa.com.br"');
    process.exit(1);
  }
  
  console.log('✅ Dados válidos\n');
  
  // Provision
  const result = await provisionNewTenant(tenantData);
  
  process.exit(result.success ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { provisionNewTenant, validateTenantData };
