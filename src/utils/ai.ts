/**
 * AI utilities for color palette generation using OpenRouter
 * Uses multiple completely free models with automatic fallback
 */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenRouterResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * List of completely free models on OpenRouter (in order of preference)
 * These models have $0/M for both input and output tokens
 */
export const FREE_MODELS = [
  {
    id: 'meta-llama/llama-3.3-8b-instruct:free',
    name: 'Meta Llama 3.3 8B',
    description: 'Fast and capable for creative tasks'
  },
  {
    id: 'google/gemma-3-4b-it:free',
    name: 'Google Gemma 3 4B',
    description: 'Lightweight Google model'
  },
  {
    id: 'mistralai/mistral-small-3.1-24b-instruct:free',
    name: 'Mistral Small 3.1 24B',
    description: 'Strong reasoning and creative writing'
  },
  {
    id: 'qwen/qwen3-4b:free',
    name: 'Qwen 3 4B',
    description: 'Alibaba multilingual model'
  },
  {
    id: 'deepseek/deepseek-r1-0528:free',
    name: 'DeepSeek R1',
    description: 'Strong reasoning performance'
  },
  {
    id: 'microsoft/phi-4:free',
    name: 'Microsoft Phi-4',
    description: 'Microsoft compact model'
  },
  {
    id: 'nousresearch/hermes-3-llama-3.1-8b:free',
    name: 'Hermes 3 Llama 8B',
    description: 'Fine-tuned for helpful responses'
  },
];

/**
 * Extract colors from AI response text
 * Looks for hex codes, rgb, hsl, and named colors
 */
export function extractColors(text: string): string[] {
  const colors: string[] = [];
  
  // Hex colors (#RRGGBB or #RGB)
  const hexPattern = /#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b/g;
  const hexMatches = text.match(hexPattern);
  if (hexMatches) {
    colors.push(...hexMatches);
  }
  
  // RGB colors (rgb(255, 255, 255) or rgba(255, 255, 255, 1))
  const rgbPattern = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/g;
  const rgbMatches = text.match(rgbPattern);
  if (rgbMatches) {
    colors.push(...rgbMatches);
  }
  
  // HSL colors (hsl(360, 100%, 50%) or hsla(360, 100%, 50%, 1))
  const hslPattern = /hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*[\d.]+)?\)/g;
  const hslMatches = text.match(hslPattern);
  if (hslMatches) {
    colors.push(...hslMatches);
  }
  
  return [...new Set(colors)]; // Remove duplicates
}

/**
 * Try a single model and return the response
 */
async function tryModel(
  model: string,
  messages: ChatMessage[],
  apiKey: string
): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'ProColors - AI Color Generator',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      return { 
        success: false, 
        error: errorData.error?.message || `HTTP ${response.status}` 
      };
    }
    
    const data: OpenRouterResponse = await response.json();
    
    if (data.choices && data.choices.length > 0 && data.choices[0].message.content) {
      return { success: true, content: data.choices[0].message.content };
    }
    
    return { success: false, error: 'Empty response from model' };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error' 
    };
  }
}

/**
 * Call OpenRouter API with automatic fallback to multiple free models
 * Tries each model in sequence until one succeeds
 */
export async function callOpenRouter(
  messages: ChatMessage[],
  apiKey?: string,
  onModelChange?: (modelName: string) => void
): Promise<string> {
  const key = apiKey || '';
  
  if (!key) {
    throw new Error('OpenRouter API key is required. Please set it in settings.');
  }
  
  const errors: string[] = [];
  
  // Try each free model in sequence
  for (const model of FREE_MODELS) {
    onModelChange?.(model.name);
    
    const result = await tryModel(model.id, messages, key);
    
    if (result.success && result.content) {
      console.log(`✓ Success with model: ${model.name}`);
      return result.content;
    }
    
    console.warn(`✗ Failed with ${model.name}: ${result.error}`);
    errors.push(`${model.name}: ${result.error}`);
  }
  
  // All models failed
  throw new Error(
    `All AI models failed to respond. Please try again later.\n\nDetails:\n${errors.join('\n')}`
  );
}

/**
 * Call OpenRouter API with a specific model (no fallback)
 */
export async function callOpenRouterWithModel(
  messages: ChatMessage[],
  modelId: string,
  apiKey: string
): Promise<string> {
  const result = await tryModel(modelId, messages, apiKey);
  
  if (result.success && result.content) {
    return result.content;
  }
  
  throw new Error(result.error || 'Failed to get response from AI model');
}

/**
 * Generate system prompt for color palette generation
 */
export function getColorPaletteSystemPrompt(): string {
  return `You are an expert color designer and brand consultant. Your task is to help users create beautiful, harmonious color palettes for their brands.

When suggesting colors:
1. Always provide colors in hex format (e.g., #3b82f6)
2. Suggest 3-7 colors that work well together
3. Consider color theory, accessibility, and brand personality
4. Explain your color choices briefly
5. Include primary, secondary, and accent colors when appropriate

Format your response with each color on its own line like this:
- Primary: #3b82f6 (explanation)
- Secondary: #10b981 (explanation)
- Accent: #f59e0b (explanation)

Always include hex codes for easy extraction.`;
}
