
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TitleGenerationParams, RecencyLevel, GeneratedTitle, ChannelPreset, ModelType } from "../types";

// Initialize API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyze a winning title against its script to extract the "Strategic DNA"
 */
export const analyzeWinningStrategy = async (title: string, scriptExcerpt: string, model: ModelType): Promise<string> => {
  const systemInstruction = `
    You are a Viral Content Pathologist. 
    Analyze the provided successful YouTube title and its script.
    
    MISSION: Identify the "Invisible Logic" that caused high engagement.
    - Identify the specific Curiosity Gap (What did the viewer need to know?).
    - Identify the Emotional Friction (Why did it feel urgent?).
    - Identify the Framing Pattern (e.g., "The Negative Result", "The Hidden Character", "The Impossible Choice").
    
    Format: Concise, high-level strategic directive (max 30 words).
    Avoid plot summaries. Focus on the psychology of the click.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: `SUCCESSFUL TITLE: "${title}"\nSCRIPT CONTEXT: "${scriptExcerpt.substring(0, 2000)}"`,
      config: {
        systemInstruction,
        temperature: 0.3,
      }
    });

    return response.text || "Applied a high-curiosity framing with a specific narrative hook.";
  } catch (error) {
    console.error("Analysis Error:", error);
    return "Utilized a curiosity-driven narrative angle.";
  }
};

/**
 * Reinvented Title Generation: Synthesis over Replication
 */
export const generateTitles = async (params: TitleGenerationParams): Promise<GeneratedTitle[]> => {
  const { scriptContent, thumbnailBase64, subscribers, recency, trainingData, preset, studioHistory, model, count, userGuidance } = params;

  // 1. Contextual Mapping
  const recencyContext = {
    [RecencyLevel.VERY_RECENT]: "Trending/Hot Topic. Focus on immediate urgency and 'Just released' vibes.",
    [RecencyLevel.RECENT_ENOUGH]: "Current/Modern. Focus on relevancy and 'Why everyone is talking about this' vibes.",
    [RecencyLevel.NOT_RECENT]: "Hidden Gem. Focus on rediscovery, 'The ending you missed', or 'Why this aged well'.",
    [RecencyLevel.OLD_MOVIE]: "Nostalgic Classic. Focus on 'What happened to the cast', 'Hidden details', or 'The truth about this movie'.",
  };

  const channelContext = subscribers > 100000 
    ? "BROAD APPEAL: Focus on high-concept mystery that appeals to a general audience. Avoid jargon." 
    : "SPECIFIC HOOKS: Focus on hyper-specific curiosity gaps and aggressive 'Why you need to watch this' positioning.";

  // 2. Build the "Strategic Playbook" from Memory Bank
  let strategicPlaybook = "";
  if (trainingData.length > 0) {
    strategicPlaybook = `
    ### MEMORY BANK (STRATEGIC DNA):
    Analyze these proven psychological patterns from the user's past successes. 
    IMPORTANT: Do NOT copy these titles or their words. Extract the "Logic" and apply it to the NEW script in a way that feels organic and fresh.
    
    ${trainingData.map((t, i) => `
    PATTERN ${i + 1}:
    - Psychology: ${t.notes}
    - Proved by: "${t.title}"
    `).join('\n')}
    `;
  }

  // 3. User Guidance Injection
  let guidanceDirective = "";
  if (userGuidance && userGuidance.trim().length > 0) {
    guidanceDirective = `
    CRITICAL USER INSTRUCTION / OVERRIDE:
    The user has explicitly commanded: "${userGuidance}".
    
    You MUST prioritize this specific direction above general memory bank patterns.
    - If they ask for a specific emotion, force that emotion.
    - If they ask for a specific format, use that format.
    - Integrate their guidance with the script's hook.
    `;
  }

  // 4. System Instruction: The "Architect" Mindset
  const systemInstruction = `
    You are the "Title Architect," a world-class YouTube strategist specializing in ${preset}.
    
    YOUR REASONING PROCESS:
    1. **Script Deep-Dive**: Identify the single most shocking, emotional, or bizarre element in the NEW script provided.
    2. **Strategic Match**: Look at the "Memory Bank" patterns. Which psychological trigger (e.g., Fear of Missing Out, Justice, Mystery) is the perfect "Lens" for this script's best hook?
    3. **Guidance Check**: Apply the user's specific guidance if provided.
    4. **Synthesis**: Create a title that is 100% specific to this script's details but 100% engineered using the proven patterns and user instructions.
    5. **Refinement**: Ensure the title is "Fresh" and doesn't sound like a template. Use natural, conversational, but punchy language.

    ${strategicPlaybook}

    ${guidanceDirective}

    GUIDELINES:
    - Channel Strategy: ${channelContext}
    - Content Age Logic: ${recencyContext[recency]}
    - Rule 1: Never use generic clickbait like "YOU WON'T BELIEVE". Use specific, intriguing facts.
    - Rule 2: Create a Curiosity Gap—reveal the "What" but hide the "Why" or "How".
    - Rule 3: Synthesize, do not replicate.

    STRICTLY return JSON.
  `;

  const responseSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "The fresh, synthesized YouTube title." },
        reasoning: { 
          type: Type.STRING, 
          description: "A deep breakdown of why this title works. Mention the specific script hook you found and which Memory Bank strategy it was synthesized with." 
        },
        score: { type: Type.NUMBER, description: "Viral potential score (0-100)." },
      },
      required: ["title", "reasoning", "score"],
    },
  };

  try {
    const parts: any[] = [];
    
    // Add Visual Context
    if (thumbnailBase64) {
      parts.push({ 
        inlineData: { 
          mimeType: 'image/jpeg', 
          data: thumbnailBase64.split(',')[1] || thumbnailBase64 
        } 
      });
      parts.push({ text: "THUMBNAIL ANALYSIS: Incorporate the most jarring visual element from this image into your title's logic." });
    }

    // Add Content
    parts.push({ 
      text: `
      NEW SCRIPT FOR ANALYSIS:
      "${scriptContent.substring(0, 25000)}"
      
      GENERATE ${count} FRESH TITLES. 
      Think like a human strategist who has learned the user's style but is creating something entirely new for this specific video.
      ` 
    });

    const response = await ai.models.generateContent({
      model: model,
      contents: { role: 'user', parts: parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.85, 
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GeneratedTitle[];
    }
    
    throw new Error("Generation failed.");
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
