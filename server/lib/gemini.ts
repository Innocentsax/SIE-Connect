import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  async generateText(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Gemini API failed: ${error.message}`);
    }
  }

  async analyzeStartupData(startupDescription: string): Promise<{
    sector: string;
    stage: string;
    strengths: string[];
    recommendations: string[];
  }> {
    const prompt = `Analyze this startup description and provide structured insights:

"${startupDescription}"

Return a JSON response with:
- sector: The primary business sector
- stage: Estimated funding stage (Pre-seed, Seed, Series A, etc.)
- strengths: Array of 3 key strengths
- recommendations: Array of 3 strategic recommendations

Format as valid JSON only.`;

    try {
      const response = await this.generateText(prompt);
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error('Error analyzing startup data:', error);
      throw error;
    }
  }

  async generateMatchingInsights(userProfile: any, opportunities: any[]): Promise<{
    matches: Array<{
      opportunityId: number;
      matchScore: number;
      reasoning: string;
    }>;
    summary: string;
  }> {
    const prompt = `Based on this user profile:
${JSON.stringify(userProfile, null, 2)}

And these opportunities:
${JSON.stringify(opportunities, null, 2)}

Generate matching insights with:
- matches: Array of objects with opportunityId, matchScore (0-100), and reasoning
- summary: Overall matching summary

Return valid JSON only.`;

    try {
      const response = await this.generateText(prompt);
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error('Error generating matching insights:', error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();