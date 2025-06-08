import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || ""
});

export async function generateSummary(text: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a concise summarizer. Create exactly 80 words or less summaries that capture the key points of social enterprises and opportunities. Focus on impact, market, and unique value proposition."
        },
        {
          role: "user",
          content: `Summarize this social enterprise or opportunity description in exactly 80 words or less:\n\n${text}`
        }
      ],
      max_tokens: 150,
    });

    return response.choices[0].message.content || text.substring(0, 200);
  } catch (error) {
    console.error('Failed to generate summary:', error);
    return text.substring(0, 200);
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Failed to generate embedding:', error);
    // Return a zero vector as fallback
    return new Array(1536).fill(0);
  }
}

export async function analyzeSentiment(text: string): Promise<{
  rating: number;
  confidence: number;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a sentiment analysis expert. Analyze the sentiment of social enterprise descriptions and provide a rating from 1 to 5 (1=very negative, 5=very positive) and a confidence score between 0 and 1. Respond with JSON in this format: { 'rating': number, 'confidence': number }"
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{"rating": 3, "confidence": 0.5}');

    return {
      rating: Math.max(1, Math.min(5, Math.round(result.rating))),
      confidence: Math.max(0, Math.min(1, result.confidence)),
    };
  } catch (error) {
    console.error('Failed to analyze sentiment:', error);
    return { rating: 3, confidence: 0.5 };
  }
}

export async function matchStartupsToOpportunities(startupDescription: string, opportunities: any[]): Promise<{
  matches: Array<{ opportunity: any; score: number; reasoning: string }>;
}> {
  try {
    const opportunitiesText = opportunities.map(opp => 
      `${opp.title}: ${opp.description} (${opp.criteria})`
    ).join('\n\n');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at matching social enterprises with funding opportunities. Analyze the startup description and rank opportunities by compatibility (0-100 score). Provide reasoning for top matches. Respond with JSON: { 'matches': [{ 'opportunityIndex': number, 'score': number, 'reasoning': string }] }"
        },
        {
          role: "user",
          content: `Startup: ${startupDescription}\n\nOpportunities:\n${opportunitiesText}`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{"matches": []}');
    
    return {
      matches: result.matches.map((match: any) => ({
        opportunity: opportunities[match.opportunityIndex] || opportunities[0],
        score: Math.max(0, Math.min(100, match.score)),
        reasoning: match.reasoning || "Compatible based on sector and criteria"
      })).slice(0, 5) // Top 5 matches
    };
  } catch (error) {
    console.error('Failed to match startups to opportunities:', error);
    return { matches: [] };
  }
}
