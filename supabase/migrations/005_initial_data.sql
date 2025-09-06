-- Note: Default main group will be created when:
-- 1. Bot is added as admin to first Telegram group, OR
-- 2. Admin manually sets it from dashboard

-- Create first admin user (update email/password after setup)
-- Note: You'll need to manually set password via Supabase Auth dashboard
INSERT INTO users (email, name, role, approved, approved_at) 
VALUES (
  'admin@disciplo.com',
  'Admin',
  'admin',
  TRUE,
  NOW()
);

-- Admin will be added to main group once it's created

-- Sample battleplan template
INSERT INTO battleplan_templates (name, description, priority_suggestion)
VALUES (
  'Transformazione Personale Base',
  'Template per iniziare il tuo percorso di trasformazione',
  'Costruire una routine quotidiana solida'
);

-- Add template pillars with routine suggestions
INSERT INTO template_pillars (template_id, type, objective_suggestion, routines)
SELECT 
  bt.id,
  'interiority',
  'Sviluppare una pratica spirituale quotidiana',
  '[
    {"title": "Meditazione mattutina", "description": "5 minuti di silenzio"},
    {"title": "Gratitudine serale", "description": "Scrivere 3 cose per cui essere grati"}
  ]'::jsonb
FROM battleplan_templates bt WHERE bt.name = 'Transformazione Personale Base';

INSERT INTO template_pillars (template_id, type, objective_suggestion, routines)
SELECT 
  bt.id,
  'relationships',
  'Migliorare le relazioni significative',
  '[
    {"title": "Chiamata settimanale", "description": "Contattare un amico o familiare"},
    {"title": "Atto di servizio", "description": "Un gesto gentile al giorno"}
  ]'::jsonb
FROM battleplan_templates bt WHERE bt.name = 'Transformazione Personale Base';

INSERT INTO template_pillars (template_id, type, objective_suggestion, routines)
SELECT 
  bt.id,
  'resources',
  'Sviluppare competenze professionali',
  '[
    {"title": "Lettura formativa", "description": "30 minuti di studio"},
    {"title": "Progetto personale", "description": "1 ora di lavoro su un progetto"}
  ]'::jsonb
FROM battleplan_templates bt WHERE bt.name = 'Transformazione Personale Base';

INSERT INTO template_pillars (template_id, type, objective_suggestion, routines)
SELECT 
  bt.id,
  'health',
  'Costruire un corpo sano e forte',
  '[
    {"title": "Esercizio fisico", "description": "30 minuti di movimento"},
    {"title": "Alimentazione consapevole", "description": "Preparare pasti sani"}
  ]'::jsonb
FROM battleplan_templates bt WHERE bt.name = 'Transformazione Personale Base';