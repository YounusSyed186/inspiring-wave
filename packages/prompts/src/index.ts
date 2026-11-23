/**
 * Structured Prompts for Google Gemini AI Engine
 */

export const RESEARCH_PROMPTS = {
  TOPIC_IDEATION: (theme: string, channelCategory: string, exclusions: string[] = []) => `
You are an expert YouTube content strategist for a channel in the "${channelCategory}" niche focused on "${theme}".
Generate 5 original, engaging, and substantively factual video topic proposals.
Excluded topics: ${exclusions.length > 0 ? exclusions.join(', ') : 'None'}.

Respond ONLY with a JSON array conforming to this exact structure:
[
  {
    "topic": "Concise topic title",
    "audience": "Target demographic or viewer interest",
    "content_angle": "Unique perspective or contrarian insight",
    "hook_options": ["Hook 1 (under 8s)", "Hook 2 (question-based)"],
    "factual_claims": ["Key verified fact 1", "Key verified fact 2"],
    "uniqueness_score": 0.88,
    "channel_relevance_score": 0.95,
    "production_complexity": "LOW" | "MEDIUM" | "HIGH"
  }
]
`,
};

export const SCRIPT_PROMPTS = {
  WRITE_SCRIPT: (
    topic: string,
    narrativeStyle: 'chronological' | 'problem-solution' | 'story-driven' | 'analytical',
    targetDurationSeconds: number,
    writingTone: string
  ) => `
You are a master YouTube scriptwriter.
Write an authentic, highly engaging script on the topic: "${topic}".
Narrative Style: "${narrativeStyle}".
Target Duration: ~${targetDurationSeconds} seconds (~${Math.round(targetDurationSeconds * 2.5)} words spoken at standard conversational pace).
Tone: "${writingTone}".

Strict Requirements:
1. Strong, immediate opening hook (NO generic greetings like "Hey guys, welcome back!").
2. Clear narrative continuity without filler or repetitive phrasing.
3. Every factual claim must be realistic and verifiable.
4. Clean conclusion with an educational or thought-provoking takeaway.

Respond ONLY with a JSON object conforming to:
{
  "title": "Selected High-CTR Title",
  "title_options": ["Title 1", "Title 2", "Title 3"],
  "hook": "Opening 5-10 second speech",
  "introduction": "Introduction context",
  "narrative_outline": ["Act 1: ...", "Act 2: ...", "Act 3: ..."],
  "full_narration_script": "The complete, continuous spoken voiceover script text without brackets or stage directions",
  "conclusion": "Final thoughts",
  "call_to_action": "Optional concise CTA"
}
`,
};

export const STORYBOARD_PROMPTS = {
  GENERATE_SCENES: (scriptText: string, defaultStyle: string = 'impasto') => `
You are a film director and visual designer. Break down the following voiceover narration into visual scenes.
Voiceover Script:
"${scriptText}"

Default Visual Style: "${defaultStyle}".
Guidelines:
- Each scene should correspond to 4-8 seconds of narration.
- Specify visual concepts that can be rendered using code (Three.js 3D, Canvas art, kinetic text, procedural motion graphics, or illustrated animation).
- Do not invent impossible visual camera directions; keep instructions actionable.

Respond ONLY with a JSON array:
[
  {
    "sequence_index": 1,
    "duration_seconds": 5.0,
    "narration_segment": "Spoken words during this scene",
    "visual_concept": "Detailed description of what is visible on screen",
    "animation_instructions": "Motion, camera pan/zoom or particle flow",
    "camera_movement": "slow push-in | slow pan-left | static | orbital",
    "transition_in": "fade | cut | wipe",
    "transition_out": "fade | cut",
    "on_screen_text": "Key subtitle keyword or statistic",
    "render_strategy": "LEMO_OPUSCAR",
    "style_slug": "${defaultStyle}"
  }
]
`,
};

export const CLIPPING_PROMPTS = {
  ANALYZE_HIGHLIGHTS: (transcriptSummary: string, targetDurationRange: string = '30-60 seconds') => `
You are an expert short-form video editor for YouTube Shorts and TikTok.
Analyze the following timestamped video transcript to identify the most compelling, self-contained highlight segments.
Desired Clip Length: ${targetDurationRange}.

Transcript Segments:
${transcriptSummary}

Rules:
1. Clips MUST be completely self-contained (the viewer can understand the core insight without watching the full video).
2. Never start or end mid-sentence or mid-thought.
3. Prioritize high-value insights, surprising revelations, actionable lessons, or emotional moments.
4. Provide objective editorial scoring heuristics.

Respond ONLY with a JSON array:
[
  {
    "start_time_seconds": 45.2,
    "end_time_seconds": 88.5,
    "duration_seconds": 43.3,
    "topic": "Core topic of this segment",
    "opening_hook": "First sentence of the clip",
    "summary": "Brief summary",
    "suggested_title": "Catchy YouTube Shorts Title",
    "hook_strength": 0.90,
    "content_value": 0.85,
    "narrative_completeness": 0.95,
    "audience_relevance": 0.80,
    "clarity": 0.90,
    "visual_suitability": 0.85,
    "novelty": 0.75,
    "scoring_rationale": "Why this moment works well as a vertical Short"
  }
]
`,
};
