import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-sonnet-4-20250514" which was released May 14, 2025. Use this by default unless user has already selected claude-3-7-sonnet-20250219
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateSummary(text: string): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 150,
      messages: [
        {
          role: 'user',
          content: `You are a concise summarizer. Create exactly 80 words or less summaries that capture the key points of social enterprises and opportunities. Focus on impact, market, and unique value proposition.

Summarize this social enterprise or opportunity description in exactly 80 words or less:

${text}`
        }
      ],
    });

    return response.content[0].type === 'text' ? response.content[0].text : text.substring(0, 200);
  } catch (error) {
    console.error('Failed to generate summary:', error);
    return text.substring(0, 200);
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  // Claude doesn't provide embeddings directly, so we'll use a simple text-based similarity approach
  // In a production environment, you might want to use a dedicated embedding service
  try {
    // For now, create a simple hash-based vector representation
    const words = text.toLowerCase().split(/\s+/);
    const vector = new Array(384).fill(0);
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const hash = simpleHash(word);
      vector[hash % 384] += 1;
    }
    
    // Normalize the vector
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? vector.map(val => val / magnitude) : vector;
  } catch (error) {
    console.error('Failed to generate embedding:', error);
    return new Array(384).fill(0);
  }
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function cleanJSONResponse(text: string): string {
  // Remove markdown code blocks and clean up the response
  return text
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .replace(/^\s*[\r\n]+/gm, '')
    .trim();
}

export async function analyzeSentiment(text: string): Promise<{
  rating: number;
  confidence: number;
}> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      system: 'You are a Customer Insights AI. Analyze this feedback and output in JSON format with keys: "sentiment" (positive/negative/neutral), "rating" (1-5 scale), and "confidence" (number, 0 through 1).',
      messages: [
        {
          role: 'user',
          content: text
        }
      ],
    });

    const responseText = response.content[0].type === 'text' ? response.content[0].text : '{"rating": 3, "confidence": 0.5}';
    const cleanedText = cleanJSONResponse(responseText);
    const result = JSON.parse(cleanedText);
    
    return {
      rating: Math.max(1, Math.min(5, Math.round(result.rating || 3))),
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
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
    const opportunitiesText = opportunities.map((opp, index) => 
      `${index}: ${opp.title}: ${opp.description} (${opp.criteria || 'No specific criteria'})`
    ).join('\n\n');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: 'You are an expert at matching social enterprises with funding opportunities. Analyze the startup description and rank opportunities by compatibility (0-100 score). Provide reasoning for top matches. Respond with JSON: { "matches": [{ "opportunityIndex": number, "score": number, "reasoning": string }] }',
      messages: [
        {
          role: 'user',
          content: `Startup: ${startupDescription}

Opportunities:
${opportunitiesText}`
        }
      ],
    });

    const responseText = response.content[0].type === 'text' ? response.content[0].text : '{"matches": []}';
    const cleanedText = cleanJSONResponse(responseText);
    const result = JSON.parse(cleanedText);
    
    return {
      matches: result.matches.map((match: any) => ({
        opportunity: opportunities[match.opportunityIndex] || opportunities[0],
        score: Math.max(0, Math.min(100, match.score || 0)),
        reasoning: match.reasoning || "Compatible based on sector and criteria"
      })).slice(0, 5) // Top 5 matches
    };
  } catch (error) {
    console.error('Failed to match startups to opportunities:', error);
    return { matches: [] };
  }
}