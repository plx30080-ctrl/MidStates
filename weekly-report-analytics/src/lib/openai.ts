import OpenAI from 'openai';

// Initialize OpenAI client
// The API key should be set in environment variables
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Required for client-side usage
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const generateAIInsight = async (
  context: string,
  question: string
): Promise<string> => {
  try {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are an expert business analyst specializing in staffing industry metrics and financial analysis. Provide clear, actionable insights based on the data provided. Focus on trends, comparisons, and recommendations.'
      },
      {
        role: 'user',
        content: `${context}\n\nQuestion: ${question}\n\nPlease provide a clear, concise answer based on this data. Focus on actionable insights.`
      }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Using GPT-4o for best results, can switch to gpt-3.5-turbo for cost savings
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || 'Unable to generate response';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to get AI response. Please check your API key and try again.');
  }
};

export default openai;
