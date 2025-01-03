import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Enable browser usage
})

export async function analyzeMessage(content) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "system",
        content: "Analyze the following message and provide sentiment and topics in JSON format."
      }, {
        role: "user",
        content
      }]
    })

    return JSON.parse(response.choices[0].message.content)
  } catch (error) {
    console.error('Error analyzing message:', error)
    return {
      sentiment: 'neutral',
      topics: ['unknown']
    }
  }
}
