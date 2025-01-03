import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

const Analytics = () => {
  const [sessions, setSessions] = useState([])
  const [selectedSession, setSelectedSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSessions()
  }, [])

  useEffect(() => {
    if (selectedSession) {
      fetchSessionMessages(selectedSession)
      fetchSessionStats(selectedSession)
    }
  }, [selectedSession])

  const fetchSessions = async () => {
    try {
      const { data } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('started_at', { ascending: false })
      setSessions(data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching sessions:', error)
      setSessions([])
      setLoading(false)
    }
  }

  const fetchSessionMessages = async (sessionId) => {
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp')
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
      setMessages([])
    }
  }

  const fetchSessionStats = async (sessionId) => {
    try {
      const { data } = await supabase
        .from('session_analytics')
        .select('*')
        .eq('session_id', sessionId)
        .single()
      setStats(data || null)
    } catch (error) {
      console.error('Error fetching stats:', error)
      setStats(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-12 gap-4 p-4">
      {/* Sessions List */}
      <div className="col-span-3 bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">Chat Sessions</h2>
        <div className="space-y-2">
          {sessions.map(session => (
            <div
              key={session.id}
              onClick={() => setSelectedSession(session.id)}
              className={`p-2 rounded cursor-pointer ${
                selectedSession === session.id ? 'bg-blue-100' : 'hover:bg-gray-100'
              }`}
            >
              <div className="text-sm font-semibold">
                {new Date(session.started_at).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">
                Status: {session.status}
              </div>
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="text-gray-500 text-center py-4">
              No sessions found
            </div>
          )}
        </div>
      </div>

      {/* Session Details */}
      <div className="col-span-9 space-y-4">
        {selectedSession && stats && (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">Session Analytics</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <div className="text-sm text-gray-600">Messages</div>
                <div className="text-2xl font-bold">{stats.message_count || 0}</div>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <div className="text-sm text-gray-600">Sentiments</div>
                <div className="flex flex-wrap gap-1">
                  {(stats.sentiments || []).map((sentiment, i) => (
                    <span key={i} className="px-2 py-1 bg-white rounded text-sm">
                      {sentiment}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded">
                <div className="text-sm text-gray-600">Topics</div>
                <div className="flex flex-wrap gap-1">
                  {(stats.topics || []).map((topic, i) => (
                    <span key={i} className="px-2 py-1 bg-white rounded text-sm">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages Timeline */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4">Conversation</h2>
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  msg.role === 'user' ? 'bg-blue-50' : 'bg-gray-50'
                }`}
              >
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">
                    {msg.role === 'user' ? 'User' : 'Assistant'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="mb-2">{msg.content}</div>
                <div className="flex gap-2 text-sm">
                  <span className="px-2 py-1 bg-white rounded">
                    Sentiment: {msg.sentiment || 'N/A'}
                  </span>
                  {(msg.topics || []).map((topic, i) => (
                    <span key={i} className="px-2 py-1 bg-white rounded">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-gray-500 text-center py-4">
                {selectedSession ? 'No messages in this session' : 'Select a session to view messages'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
