import { useState, useRef, useEffect } from 'react'
import { FaMicrophone, FaStop, FaPaperPlane } from 'react-icons/fa'
import { analyzeMessage, getChatResponse, transcribeAudio } from '../services/ai.jsx'
import { saveMessage } from '../services/supabase.jsx'

// Rest of the ChatInterface component remains the same...
