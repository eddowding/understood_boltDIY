
import OpenAI from 'openai'
import { lookupPostcode, createUser, tools } from './tools'
import { supabase } from './supabase'
import { interviewConfig } from '../config/interview'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

function getCurrentDateTime() {
  return new Date().toLocaleString('en-GB', { 
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Europe/London'
  })
}

const SYSTEM_PROMPT = `You are a user research expert interviewing a user on the topic of "${interviewConfig.topic}"

Important Instructions:
* Ask only one question at a time. Analyse the previous question and ask new question each time.
* If there is an opportunity to dig deeper into a previous answer, do so but limit to 1 follow-on question.
* Keep asking questions until the user requests to stop the interview.
* Use a friendly and polite tone when asking questions.
* If the user answers are irrelevant to the question, ask the question again or move on.
* If the user's answer is beyond scope, ask if they'd like to stop the interview.
* If they mention a local issue, ask for their postcode.
* When a postcode is mentioned, ALWAYS use the lookupPostcode function.
* Use UK English spelling and conventions.
* If they don't have an account, within the first 8 questions, ask for their name and email.
* Use their first name conversationally once you know it.
* Ask ONLY ONE question at a time.

The current date and time is ${getCurrentDateTime()}.

Remember:
1. Always use lookupPostcode when you see a UK postcode
2. Create user record when you have their information
3. Keep responses natural and conversational
4. Focus on the interview topic
5. One question at a time`

async function handleTools(toolCall, sessionId) {
  const { name, arguments: args } = toolCall
  const parsedArgs = JSON.parse(args)

  switch (name) {
    case 'lookupPostcode':
      const postcodeData = await lookupPostcode(parsedArgs.postcode)