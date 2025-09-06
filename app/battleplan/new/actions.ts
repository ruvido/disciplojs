'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createBattleplanAction(formData: FormData) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Validate and sanitize input
  const rawData = {
    title: formData.get('title') as string,
    priority: formData.get('priority') as string,
    priority_description: formData.get('priority_description') as string,
    duration: formData.get('duration') as string,
    interiority_objective: formData.get('interiority_objective') as string,
    relationships_objective: formData.get('relationships_objective') as string,
    resources_objective: formData.get('resources_objective') as string,
    health_objective: formData.get('health_objective') as string,
    interiority_routines: formData.get('interiority_routines') as string,
    relationships_routines: formData.get('relationships_routines') as string,
    resources_routines: formData.get('resources_routines') as string,
    health_routines: formData.get('health_routines') as string,
  }

  const { battleplanSchema } = await import('@/lib/validation/schemas')
  
  try {
    const validatedData = battleplanSchema.parse(rawData)
  } catch (error) {
    console.error('Battleplan validation failed:', error)
    redirect('/battleplan/new?error=invalid_input')
  }

  const { title, priority, priority_description, duration: durationStr, 
          interiority_objective, relationships_objective, resources_objective, health_objective,
          interiority_routines, relationships_routines, resources_routines, health_routines } = validatedData
  
  const duration = parseInt(durationStr)

  // Calculate dates
  const start_date = new Date().toISOString().split('T')[0]
  const end_date = new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Deactivate existing battleplans
  await supabase
    .from('battleplans')
    .update({ is_active: false })
    .eq('user_id', user.id)

  // Create battleplan
  const { data: battleplan, error: battleplanError } = await supabase
    .from('battleplans')
    .insert({
      user_id: user.id,
      title,
      priority,
      priority_description: priority_description || null,
      start_date,
      end_date,
      duration,
      is_active: true
    })
    .select()
    .single()

  if (battleplanError || !battleplan) {
    console.error('Error creating battleplan:', battleplanError)
    redirect('/battleplan/new?error=creation_failed')
  }

  // Create pillars with validated data
  const pillars = [
    {
      type: 'interiority' as const,
      objective: interiority_objective,
      routines: interiority_routines
    },
    {
      type: 'relationships' as const,
      objective: relationships_objective,
      routines: relationships_routines
    },
    {
      type: 'resources' as const,
      objective: resources_objective,
      routines: resources_routines
    },
    {
      type: 'health' as const,
      objective: health_objective,
      routines: health_routines
    }
  ]

  for (const pillar of pillars) {
    // Create pillar
    const { data: createdPillar, error: pillarError } = await supabase
      .from('pillars')
      .insert({
        battleplan_id: battleplan.id,
        type: pillar.type,
        objective: pillar.objective
      })
      .select()
      .single()

    if (pillarError || !createdPillar) {
      console.error('Error creating pillar:', pillarError)
      continue
    }

    // Create routines if provided
    if (pillar.routines) {
      const routineLines = pillar.routines.split('\n').filter(line => line.trim())
      
      for (let i = 0; i < routineLines.length; i++) {
        const routine = routineLines[i].trim()
        if (routine) {
          await supabase
            .from('routines')
            .insert({
              pillar_id: createdPillar.id,
              title: routine,
              order_index: i
            })
        }
      }
    }
  }

  redirect(`/battleplan/${battleplan.id}`)
}