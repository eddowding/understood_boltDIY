import { createClient } from '@supabase/supabase-js'

// Demo mode check
const isDemo = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY

// Mock Supabase client for demo mode
class MockSupabaseClient {
  async from() {
    return {
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: [{ id: `demo-${Date.now()}` }], error: null }),
      update: () => ({ data: null, error: null }),
      eq: () => ({ data: null, error: null }),
      single: () => ({ data: null, error: null })
    }
  }
}

// Create either real or mock client
export const supabase = isDemo 
  ? new MockSupabaseClient()
  : createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    )

export async function saveMessage(message, sessionId) {
  try {
    if (isDemo) {
      console.log('Demo mode: Message saved', { message, sessionId })
      return null
    }

    const { error } = await supabase
      .from('messages')
      .insert([{
        session_id: sessionId,
        role: message.role,
        content: message.content,
        timestamp: message.timestamp,
        sentiment: message.analysis?.sentiment,
        topics: message.analysis?.topics,
        metadata: message.analysis
      }])

    if (error) throw error
  } catch (error) {
    console.error('Error saving message:', error)
  }
}

export async function createSession() {
  try {
    if (isDemo) {
      return { id: `demo-${Date.now()}` }
    }

    const { data, error } = await supabase
      .from('chat_sessions')
      .insert([{
        started_at: new Date().toISOString(),
        status: 'active'
      }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating session:', error)
    return { id: `demo-${Date.now()}` }
  }
}

export async function endSession(sessionId) {
  try {
    if (isDemo) {
      console.log('Demo mode: Session ended', { sessionId })
      return
    }

    const { error } = await supabase
      .from('chat_sessions')
      .update({ 
        status: 'completed',
        ended_at: new Date().toISOString()
      })
      .eq('id', sessionId)

    if (error) throw error
  } catch (error) {
    console.error('Error ending session:', error)
  }
}

export async function createUser(userData) {
  try {
    if (isDemo) {
      return { id: `demo-user-${Date.now()}`, ...userData }
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', userData.email)
      .single()

    if (existingUser) {
      return existingUser
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{
        first_name: userData.firstName,
        email: userData.email,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating user:', error)
    return null
  }
}
