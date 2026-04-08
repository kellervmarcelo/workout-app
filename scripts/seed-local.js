// seed-local.js - Popula o banco local com dados de teste
// Uso: node seed-local.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('=== Criando usuários via signup API...');

  // Criar Marcos
  const { data: marcosData, error: marcosError } = await supabase.auth.signUp({
    email: 'marcos@email.com',
    password: 'password123',
  });

  if (marcosError && !marcosError.message.includes('already')) {
    console.error('Erro ao criar Marcos:', marcosError);
    return;
  }

  // Criar Ana
  const { data: anaData, error: anaError } = await supabase.auth.signUp({
    email: 'ana@email.com',
    password: 'password123',
  });

  if (anaError && !anaError.message.includes('already')) {
    console.error('Erro ao criar Ana:', anaError);
    return;
  }

  console.log('Usuários criados!');

  // Obter UUIDs
  const { data: users } = await supabase.from('profiles').select('id, email');
  
  const marcosUser = users?.find(u => u.email === 'marcos@email.com');
  const anaUser = users?.find(u => u.email === 'ana@email.com');

  if (!marcosUser || !anaUser) {
    console.error('Não foi possível obter UUIDs dos usuários');
    return;
  }

  console.log(`Marcos ID: ${marcosUser.id}`);
  console.log(`Ana ID: ${anaUser.id}`);

  // Conectar diretamente ao banco para inserir dados
  const { createClient: createDbClient } = require('@supabase/supabase-js');
  const dbUrl = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
  
  // Usar fetch direto para executar SQL via Supabase REST API
  console.log('\n=== Inserindo dados de treinos e templates...');
  
  // Para simplificar, vamos usar a REST API diretamente
  // Primeiro limpar dados existentes
  console.log('Limpando dados existentes...');
  
  // Inserir templates para Marcos
  console.log('Criando templates para Marcos...');
  
  // Template 1: Peito & Tríceps
  const { data: template1 } = await supabase
    .from('workout_templates')
    .insert({
      user_id: marcosUser.id,
      name: 'Peito & Tríceps - Hipertrofia',
      description: 'Foco em hipertrofia com progressão de carga'
    })
    .select()
    .single();

  if (template1) {
    await supabase.from('template_exercises').insert([
      { template_id: template1.id, name: 'Supino Reto com Barra', order: 0, default_reps: 10, default_weight_kg: 60 },
      { template_id: template1.id, name: 'Supino Inclinado com Halteres', order: 1, default_reps: 10, default_weight_kg: 24 },
      { template_id: template1.id, name: 'Crucifixo na Máquina', order: 2, default_reps: 12, default_weight_kg: 40 },
      { template_id: template1.id, name: 'Tríceps Corda', order: 3, default_reps: 12, default_weight_kg: 15 },
      { template_id: template1.id, name: 'Tríceps Testa', order: 4, default_reps: 10, default_weight_kg: 20 },
    ]);
    console.log('  ✓ Peito & Tríceps - Hipertrofia');
  }

  // Template 2: Costas & Bíceps
  const { data: template2 } = await supabase
    .from('workout_templates')
    .insert({
      user_id: marcosUser.id,
      name: 'Costas & Bíceps - Força',
      description: 'Treino pesado para costas e bíceps'
    })
    .select()
    .single();

  if (template2) {
    await supabase.from('template_exercises').insert([
      { template_id: template2.id, name: 'Puxada Frontal', order: 0, default_reps: 10, default_weight_kg: 50 },
      { template_id: template2.id, name: 'Remada Curvada com Barra', order: 1, default_reps: 8, default_weight_kg: 50 },
      { template_id: template2.id, name: 'Remada Unilateral com Haltere', order: 2, default_reps: 10, default_weight_kg: 22 },
      { template_id: template2.id, name: 'Puxada Triângulo', order: 3, default_reps: 10, default_weight_kg: 55 },
      { template_id: template2.id, name: 'Rosca Direta com Barra', order: 4, default_reps: 10, default_weight_kg: 25 },
      { template_id: template2.id, name: 'Rosca Alternada com Halteres', order: 5, default_reps: 10, default_weight_kg: 12 },
    ]);
    console.log('  ✓ Costas & Bíceps - Força');
  }

  // Template 3: Pernas
  const { data: template3 } = await supabase
    .from('workout_templates')
    .insert({
      user_id: marcosUser.id,
      name: 'Pernas - Completo',
      description: 'Treino completo de pernas'
    })
    .select()
    .single();

  if (template3) {
    await supabase.from('template_exercises').insert([
      { template_id: template3.id, name: 'Agachamento Livre', order: 0, default_reps: 8, default_weight_kg: 60 },
      { template_id: template3.id, name: 'Leg Press 45°', order: 1, default_reps: 10, default_weight_kg: 180 },
      { template_id: template3.id, name: 'Cadeira Extensora', order: 2, default_reps: 12, default_weight_kg: 50 },
      { template_id: template3.id, name: 'Mesa Flexora', order: 3, default_reps: 12, default_weight_kg: 35 },
      { template_id: template3.id, name: 'Panturrilha no Smith', order: 4, default_reps: 15, default_weight_kg: 60 },
    ]);
    console.log('  ✓ Pernas - Completo');
  }

  // Template 4: Ombros & Trapézio
  const { data: template4 } = await supabase
    .from('workout_templates')
    .insert({
      user_id: marcosUser.id,
      name: 'Ombros & Trapézio',
      description: null
    })
    .select()
    .single();

  if (template4) {
    await supabase.from('template_exercises').insert([
      { template_id: template4.id, name: 'Desenvolvimento Militar', order: 0, default_reps: 10, default_weight_kg: 40 },
      { template_id: template4.id, name: 'Elevação Lateral', order: 1, default_reps: 12, default_weight_kg: 8 },
      { template_id: template4.id, name: 'Elevação Frontal com Haltere', order: 2, default_reps: 12, default_weight_kg: 10 },
      { template_id: template4.id, name: 'Face Pull na Polia', order: 3, default_reps: 15, default_weight_kg: 15 },
      { template_id: template4.id, name: 'Encolhimento com Halteres', order: 4, default_reps: 15, default_weight_kg: 30 },
    ]);
    console.log('  ✓ Ombros & Trapézio');
  }

  // Templates para Ana
  console.log('\nCriando templates para Ana...');

  const { data: template5 } = await supabase
    .from('workout_templates')
    .insert({
      user_id: anaUser.id,
      name: 'Superior A - Membros Superiores',
      description: 'Foco em membros superiores'
    })
    .select()
    .single();

  if (template5) {
    await supabase.from('template_exercises').insert([
      { template_id: template5.id, name: 'Puxada Frontal', order: 0, default_reps: 12, default_weight_kg: 35 },
      { template_id: template5.id, name: 'Remada Sentada', order: 1, default_reps: 12, default_weight_kg: 35 },
      { template_id: template5.id, name: 'Supino na Máquina', order: 2, default_reps: 10, default_weight_kg: 30 },
      { template_id: template5.id, name: 'Desenvolvimento com Halteres', order: 3, default_reps: 10, default_weight_kg: 8 },
      { template_id: template5.id, name: 'Elevação Lateral', order: 4, default_reps: 12, default_weight_kg: 4 },
    ]);
    console.log('  ✓ Superior A - Membros Superiores');
  }

  const { data: template6 } = await supabase
    .from('workout_templates')
    .insert({
      user_id: anaUser.id,
      name: 'Inferior A - Membros Inferiores',
      description: 'Treino de pernas completo'
    })
    .select()
    .single();

  if (template6) {
    await supabase.from('template_exercises').insert([
      { template_id: template6.id, name: 'Agachamento Goblet', order: 0, default_reps: 12, default_weight_kg: 16 },
      { template_id: template6.id, name: 'Stiff', order: 1, default_reps: 10, default_weight_kg: 30 },
      { template_id: template6.id, name: 'Leg Press 45°', order: 2, default_reps: 12, default_weight_kg: 120 },
      { template_id: template6.id, name: 'Cadeira Adutora', order: 3, default_reps: 15, default_weight_kg: 45 },
      { template_id: template6.id, name: 'Panturrilha Sentada', order: 4, default_reps: 15, default_weight_kg: 25 },
    ]);
    console.log('  ✓ Inferior A - Membros Inferiores');
  }

  console.log('\n=== Seed completo!');
  console.log('\nDados inseridos:');
  const { count: templatesCount } = await supabase.from('workout_templates').select('*', { count: 'exact', head: true });
  const { count: exercisesCount } = await supabase.from('template_exercises').select('*', { count: 'exact', head: true });
  console.log(`  Templates: ${templatesCount || 0}`);
  console.log(`  Template Exercises: ${exercisesCount || 0}`);
}

seed().catch(console.error);
