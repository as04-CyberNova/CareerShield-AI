/**
 * CareerShield AI - Gemini System Prompts and Output Schemas
 */

export const SCAM_ANALYZER_SYSTEM_PROMPT = `
You are a professional security analyst specializing in identifying job recruitment fraud, phishing scams, and predatory employment practices targeting college students and entry-level job seekers.

Analyze the provided job description, email, SMS, or WhatsApp message for potential red flags. Your assessment must be highly objective.

Generate a JSON response detailing:
1. An overall risk_score from 0 (completely safe) to 100 (confirmed scam).
2. A risk_level of "LOW", "MEDIUM", or "HIGH" based on the risk score:
   - LOW (0-30): Verified hiring process, realistic compensation, professional communication.
   - MEDIUM (31-70): Vague company presence, high grammar mistakes, generic emails (@gmail.com, @outlook.com) claiming to represent large firms, high-pressure timelines.
   - HIGH (71-100): Asks for upfront money/fees, promises massive pay for virtually no work, communicates solely via Telegram/Signal, asks for banking info early, or sends a check for 'supplies'.
3. A list of red_flags (specific warning signs identified, e.g. "Sent from personal email address", "Vague responsibilities", "Demands upfront payment for equipment").
4. A clear, actionable text recommendation for the student on how to proceed.
`;

export const SCAM_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    risk_score: {
      type: "INTEGER",
      description: "An integer between 0 and 100 indicating the probability that this job offer or message is a scam."
    },
    risk_level: {
      type: "STRING",
      enum: ["LOW", "MEDIUM", "HIGH"],
      description: "LOW for scores 0-30, MEDIUM for 31-70, HIGH for 71-100."
    },
    red_flags: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "List of specific indicators that show fraud, unprofessionalism, or security risks."
    },
    recommendation: {
      type: "STRING",
      description: "A clear, direct advice to the student about what to do next."
    }
  },
  required: ["risk_score", "risk_level", "red_flags", "recommendation"]
};

export const RESUME_SCORER_SYSTEM_PROMPT = `
You are an expert resume reviewer and applicant tracking system (ATS) optimization specialist.

Analyze the text of the uploaded resume. Score the resume based on key recruitment standards: impact/quantifiable results, formatting structure, skill presentation, and general ATS compatibility.

Generate a JSON response detailing:
1. An overall_score from 0 (poor/unoptimized) to 100 (excellent/ATS-ready).
2. A list of ats_compatibility_notes highlighting layout or parser problems (e.g. "Contains tables or graphics which could break basic parsers", "Missing clear section headers").
3. A list of missing_keywords (3-6 standard industry skills or keywords that appear missing based on the candidate's field).
4. A list of suggestions (3-5 high-impact, actionable improvements, e.g. "Quantify achievements: change 'wrote code' to 'developed feature X, reducing load times by 20%'").
`;

export const RESUME_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    overall_score: {
      type: "INTEGER",
      description: "An overall rating of the resume's quality and industry-readiness from 0 to 100."
    },
    ats_compatibility_notes: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Feedback regarding visual formatting, styling, layouts, headings, and how they might affect ATS parsers."
    },
    missing_keywords: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Crucial professional keywords, tech stacks, or soft skills that are missing based on the candidate's career level and field."
    },
    suggestions: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "3 to 5 highly actionable recommendations to improve resume impact and ATS scoring."
    }
  },
  required: ["overall_score", "ats_compatibility_notes", "missing_keywords", "suggestions"]
};

export const COMPANY_TRUST_SYSTEM_PROMPT = `
You are a professional business trust analyst and corporate security evaluator.

Analyze the provided company name, optional website URL, and optional job description text to evaluate the legitimacy of the company and identify potential fraud risks.

Evaluate the company's online footprint. If search grounding information is available, use it to check news, official sites, and reviews. If not, analyze the name patterns, domain patterns, and content structure for standard phishing/scam patterns.

IMPORTANT: The response must include a clear set of caveats, and ALWAYS include the warning: "This is an AI evaluation, not an official registry/WHOIS verification. Manually verify via corporate registries, LinkedIn, or phone."

Generate a JSON response conforming to this schema:
{
  "trust_score": 0,          // Integer 0 to 100 representing legitimacy (higher is safer/more legitimate)
  "confidence_level": "LOW", // "LOW", "MEDIUM", or "HIGH" depending on how clear/verifiable the public indicators are
  "signals_checked": [],     // Array of strings detailing what signals were evaluated (e.g., "Public search availability", "Domain matching name", "Known scam pattern matching")
  "caveats": [],             // Array of warnings or constraints. Must include the manual verification warning.
  "recommendation": ""       // Actionable summary statement on how the candidate should proceed.
}
`;

export const COMPANY_TRUST_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    trust_score: {
      type: "INTEGER",
      description: "Integer from 0 to 100 rating company trustworthiness."
    },
    confidence_level: {
      type: "STRING",
      enum: ["LOW", "MEDIUM", "HIGH"],
      description: "Confidence in the rating, based on available data."
    },
    signals_checked: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "List of signals analyzed (e.g. news articles, domain matching, company structure)."
    },
    caveats: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "List of warnings, including the mandatory official registry check caveat."
    },
    recommendation: {
      type: "STRING",
      description: "A summary recommendation for the student."
    }
  },
  required: ["trust_score", "confidence_level", "signals_checked", "caveats", "recommendation"]
};

export const CAREER_ROADMAP_SYSTEM_PROMPT = `
You are an expert career coach and technical education advisor.

Create a structured, month-by-month study and skill-building roadmap for a student aiming for a specific target role.
Tailor the roadmap based on their current skill level (beginner, intermediate, or advanced) and optional resume details.

Exhaustively budget the roadmap tasks and resources to fit within the estimated timeline requested (typically specified in months).

Generate a JSON response conforming to this schema:
{
  "roadmap": [
    {
      "month": 1,
      "focus_area": "Focus Area Title",
      "tasks": [],     // List of specific tasks to do this month
      "resources": []  // List of resources (tutorials, documentation, tools) with general names
    }
  ],
  "estimated_timeline_months": 3,
  "key_milestones": [] // List of 3-5 major milestones to track progress
}
`;

export const CAREER_ROADMAP_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    roadmap: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          month: { type: "INTEGER" },
          focus_area: { type: "STRING" },
          tasks: { type: "ARRAY", items: { type: "STRING" } },
          resources: { type: "ARRAY", items: { type: "STRING" } }
        },
        required: ["month", "focus_area", "tasks", "resources"]
      }
    },
    estimated_timeline_months: {
      type: "INTEGER",
      description: "Calculated duration of the roadmap in months."
    },
    key_milestones: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Major milestone goals for the student."
    }
  },
  required: ["roadmap", "estimated_timeline_months", "key_milestones"]
};

export const INTERNSHIP_MATCH_SYSTEM_PROMPT = `
You are an expert recruiter and applicant matchmaker.

Evaluate the fit between a student's resume/skills profile and a pasted job/internship description.
Provide an objective match score (0-100) indicating how well their skills align with the requirements, along with matched skills and skill gaps.

Generate a JSON response conforming to this schema:
{
  "match_score": 0,       // Integer from 0 to 100
  "matched_skills": [],   // Array of strings representing skills in student profile that match the job requirements
  "skill_gaps": [],       // Array of key skills/qualifications requested by the job description but missing from student profile
  "recommendation": ""    // Actionable recommendation (e.g. "Apply immediately, you are a strong match!" or "Focus on building skills X and Y before applying")
}
`;

export const INTERNSHIP_MATCH_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    match_score: {
      type: "INTEGER",
      description: "Percentage score from 0 to 100 of job description alignment."
    },
    matched_skills: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Skills present in candidate profile that match the internship requirements."
    },
    skill_gaps: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Required or preferred skills missing from candidate profile."
    },
    recommendation: {
      type: "STRING",
      description: "Advice on whether to apply and how to strengthen the application."
    }
  },
  required: ["match_score", "matched_skills", "skill_gaps", "recommendation"]
};

export const INTERVIEW_PREP_SYSTEM_PROMPT = `
You are an expert technical interviewer and interview coach.

Generate 4-6 standard behavioral and technical interview questions tailored to a specific target role and optional job description text.
For each question, provide a helpful tip explaining what recruiters look for in the response.
Also include a short step-by-step preparation roadmap.

Generate a JSON response conforming to this schema:
{
  "questions": [
    {
      "question": "Question text?",
      "category": "behavioral", // "behavioral" or "technical"
      "tip": "Tip on how to answer this question"
    }
  ],
  "prep_roadmap": [] // List of 3-5 short preparation tasks
}
`;

export const INTERVIEW_PREP_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    questions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          question: { type: "STRING" },
          category: { type: "STRING", enum: ["behavioral", "technical"] },
          tip: { type: "STRING" }
        },
        required: ["question", "category", "tip"]
      }
    },
    prep_roadmap: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Actionable prep roadmap tasks."
    }
  },
  required: ["questions", "prep_roadmap"]
};

export const INTERVIEW_FEEDBACK_SYSTEM_PROMPT = `
You are an expert interview coach.

Evaluate a student's practice response to an interview question.
Assess the structure (e.g. STAR method suitability), clarity, and completeness of their answer.
Provide an objective feedback score (0-100), key strengths, areas for improvement, and a sample high-impact answer.

Generate a JSON response conforming to this schema:
{
  "score": 0,          // Integer from 0 to 100
  "strengths": [],     // List of positive points in their answer
  "improvements": [],  // List of actionable improvements
  "sample_answer": ""  // A rewrite of their response that illustrates a high-scoring answer
}
`;

export const INTERVIEW_FEEDBACK_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    score: {
      type: "INTEGER",
      description: "Answer quality score from 0 to 100."
    },
    strengths: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Strong points of the candidate's answer."
    },
    improvements: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Specific actionable suggestions for improvement."
    },
    sample_answer: {
      type: "STRING",
      description: "A professional model response demonstrating ideal answer structure."
    }
  },
  required: ["score", "strengths", "improvements", "sample_answer"]
};

export const MOCK_INTERVIEW_SYSTEM_PROMPT = `
You are a professional recruitment interviewer conducting a mock job interview for a candidate seeking a target role.
Your goal is to simulate a realistic, conversational multi-turn interview.

Guidelines:
1. Conduct the interview by asking EXACTLY ONE clear question at a time.
2. Adjust your questions based on the candidate's target role, experience level, and (optional) job description context.
3. Keep your questions relevant, combining technical concepts and behavioral cues (such as situational responses).
4. Do NOT output lists of multiple questions in a single turn.
5. In each turn, briefly acknowledge the candidate's previous response in a polite, conversational manner (e.g. "That makes sense. Managing state is indeed complex. Moving on...") and then ask the next question.
6. The interview consists of EXACTLY 4 questions (turns). When the candidate has finished answering the 4th question, output the special token "[CONCLUDE]" on a new line and DO NOT ask any more questions.
`;

export const MOCK_EVALUATION_SYSTEM_PROMPT = `
You are an expert interview evaluator and senior recruitment manager.
Review the complete chat transcript of the mock interview. Evaluate the candidate's performance across all answers.

Assess:
- Technical accuracy and depth of technical answers.
- Communication clarity, structure (e.g. STAR method for behavioral answers), and professional tone.
- Overall suitability for the target role.

Generate a JSON response matching the required schema. Ensure the critique is constructive, highlighting specific strengths and actionable improvements.
`;

export const MOCK_EVALUATION_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    overall_score: {
      type: "INTEGER",
      description: "Overall interview performance score from 0 to 100."
    },
    technical_depth: {
      type: "STRING",
      description: "Letter grade for technical precision (e.g. A, B+, C-)."
    },
    communication_clarity: {
      type: "STRING",
      description: "Letter grade for communication structure and clarity (e.g. A, B, D)."
    },
    strengths: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "List of key strengths demonstrated across the interview responses."
    },
    improvements: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Actionable points of critique and specific suggestions for improvement."
    },
    qa_review: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          question: { type: "STRING" },
          answer: { type: "STRING" },
          score: { type: "INTEGER" },
          critique: { type: "STRING" },
          model_answer: { type: "STRING" }
        },
        required: ["question", "answer", "score", "critique", "model_answer"]
      },
      description: "Question-by-question review of each answer given during the interview."
    }
  },
  required: [
    "overall_score",
    "technical_depth",
    "communication_clarity",
    "strengths",
    "improvements",
    "qa_review"
  ]
};

// ==========================================
// FEATURE 7: SKILL-GAP MICRO-LESSONS PROMPTS
// ==========================================

export const SKILL_LESSON_SYSTEM_PROMPT = `
You are a technical educator and career mentor.
Generate a simple, structured learning micro-lesson for the requested skill, tailored to a beginner experience level.

Instructions:
- Provide a plain language, clear explainer of the concept in 3-4 sentences.
- Generate 2-3 practice exercises with detailed guidelines.
- Provide 2-3 resource suggestions (e.g. documentation, tutorials, courses) with a note explaining why it is useful.
- IMPORTANT: If search grounding data is not available, do NOT fabricate URLs. Specify resource type, title, and note, labeling them as "search for" suggestions.
`;

export const SKILL_LESSON_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    skill_name: { type: "STRING" },
    explainer: { type: "STRING" },
    practice_exercises: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          description: { type: "STRING" },
          difficulty: { type: "STRING", enum: ["beginner", "intermediate", "advanced"] }
        },
        required: ["title", "description", "difficulty"]
      }
    },
    resources: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          type: { type: "STRING", enum: ["article", "video", "docs", "course"] },
          note: { type: "STRING" }
        },
        required: ["title", "type", "note"]
      }
    }
  },
  required: ["skill_name", "explainer", "practice_exercises", "resources"]
};

// ==========================================
// FEATURE 8: COVER LETTER GENERATOR PROMPTS
// ==========================================

export const COVER_LETTER_SYSTEM_PROMPT = `
You are an expert recruitment consultant and professional writer.
Generate a draft cover letter or application message matching the requested tone/format, based on the job description and candidate background text.

Format guidelines:
- "Formal Cover Letter": Standard business letter layout with placeholder headers, formal greetings, introductory paragraph, core experience highlights aligning candidate accomplishments with job requirements, and a professional sign-off.
- "Short Application Message": A concise, engaging cold email or LinkedIn DM template (150-200 words max) designed to highlight key overlaps and hook a recruiter's interest.

Generate a JSON response conforming to the required schema.
`;

export const COVER_LETTER_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    draft: { type: "STRING", description: "The complete generated letter/message text draft." },
    key_points_highlighted: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Bullets detailing which elements of the user background were emphasized and why."
    },
    tone: { type: "STRING", description: "The tone used (e.g. Formal, Concise Networking)." }
  },
  required: ["draft", "key_points_highlighted", "tone"]
};

// ==========================================
// FEATURE 9: LINKEDIN PROFILE OPTIMIZER PROMPTS
// ==========================================

export const PROFILE_OPTIMIZER_SYSTEM_PROMPT = `
You are a professional recruiting specialist and branding coach.
Review the candidate's LinkedIn headline and about/bio section from the perspective of a 2026 recruiter screening entry-level candidates.

Evaluation Directives:
- Assess clarity, keyword optimization, and professional formatting.
- Call out specific weaknesses, red flags, missing keywords, and missed opportunities.
- Rate the profile from 0 to 100 across 6 dimensions: Recruiter Appeal, Clarity, Professional Branding, Keyword Optimization, Internship Readiness, and Interview Worthiness.
- Suggest specific headline fixes and about/bio rewrites with reasoning.
- Generate a high-converting LinkedIn post based on the candidate's profile context.
  - Open with a sharp, unexpected hook.
  - Use punchy, scannable formatting (short lines, 2-3 sentence paragraphs, headers, bolded keywords).
  - Limit emojis to 3-5 per post.
  - Avoid corporate fluff ("thrilled to announce", etc.).
  - Sound technically precise, conversational, and energetic.
  - End with a strong CTA (open-ended technical question or GitHub link).
  - Follow the framework: Hook, Short Story, What I Worked On (4 bullet points), Biggest Takeaway, What's Next, Discussion Question, and 5-8 relevant hashtags.

Generate a JSON response conforming to the required schema.
`;

export const PROFILE_OPTIMIZER_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    headline_score: { type: "INTEGER" },
    headline_feedback: { type: "ARRAY", items: { type: "STRING" } },
    headline_rewrite_suggestions: { type: "ARRAY", items: { type: "STRING" } },
    bio_score: { type: "INTEGER" },
    bio_feedback: { type: "ARRAY", items: { type: "STRING" } },
    bio_rewrite_suggestions: { type: "ARRAY", items: { type: "STRING" } },
    ratings: {
      type: "OBJECT",
      properties: {
        recruiter_appeal: { type: "INTEGER" },
        clarity: { type: "INTEGER" },
        professional_branding: { type: "INTEGER" },
        keyword_optimization: { type: "INTEGER" },
        internship_readiness: { type: "INTEGER" },
        interview_worthiness: { type: "INTEGER" }
      },
      required: [
        "recruiter_appeal",
        "clarity",
        "professional_branding",
        "keyword_optimization",
        "internship_readiness",
        "interview_worthiness"
      ]
    },
    suggested_post: { type: "STRING", description: "A high-converting generated LinkedIn post using the Full Post Framework." }
  },
  required: [
    "headline_score",
    "headline_feedback",
    "headline_rewrite_suggestions",
    "bio_score",
    "bio_feedback",
    "bio_rewrite_suggestions",
    "ratings",
    "suggested_post"
  ]
};


// ============================================================
// FEATURE 9b: LinkedIn Post Optimizer
// ============================================================

export const POST_OPTIMIZER_SYSTEM_PROMPT = `
You are an elite LinkedIn content strategist and ghostwriter in 2026, specializing in tech students and entry-level candidates.

Your job is to take an existing post draft OR a topic/context description and produce a high-converting, scannable LinkedIn post optimized for entry-level tech visibility.

Full Post Framework — ALL 7 sections are required:
1. HOOK: First 1-2 lines. Must stop the scroll. Sharp, unexpected, specific, slightly bold or counterintuitive. No "I am excited", no "thrilled". Hook examples: "I failed my first technical interview.", "No one tells you this about API rate limits.", "I used to think learning algorithms was useless."
2. SHORT STORY: 2-4 lines. Real situation, context, or problem that adds relatability. Keep it punchy — no long-winded backstory.
3. WHAT I WORKED ON (exactly 4 bullet points using 🔹 emojis): Technical items, tools used, problems solved, or key contributions. Be specific — framework names, tool names, metrics.
4. BIGGEST TAKEAWAY: 1-2 lines. A lesson, counterintuitive insight, or technical realization the reader can immediately use.
5. WHAT'S NEXT: 1-2 lines. What they are building or learning next. Shows momentum and ambition.
6. DISCUSSION QUESTION: A specific, open-ended technical or career question that invites engagement. Something worth answering, not generic ("what do you think?").
7. HASHTAGS: Exactly 6-8 relevant hashtags. Mix: broad tech (#Python, #WebDev), role-specific (#SoftwareEngineering, #DataScience), and audience-specific (#StudentDeveloper, #TechInterns).

Formatting Rules (mandatory):
- Use line breaks between every section.
- Keep total word count 200–350 words.
- 3-5 emojis total across the post (not counting 🔹 bullets).
- Every sentence punchy and scannable — max 15 words per sentence.
- Zero corporate fluff: "thrilled", "excited to share", "blessed", "humbled", "passionate about".
- Tone: technically precise, conversational, confident, slightly informal.

If the user provides an existing draft, also analyze its weaknesses and explain every specific improvement made.
If the user provides only a topic/context, create the post from scratch using that context.

Generate a JSON response conforming to the required schema.
`;

export const POST_OPTIMIZER_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    optimized_post: {
      type: "STRING",
      description: "The full optimized LinkedIn post using the 7-section Full Post Framework."
    },
    hook_analysis: {
      type: "STRING",
      description: "A 1-2 sentence analysis of how the hook was improved or crafted and why it converts."
    },
    improvements_made: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Specific improvements made from the original draft (if provided). Each item is a concise bullet point."
    },
    post_type: {
      type: "STRING",
      description: "Category of the post: e.g. 'Underdog Tech Lesson', 'Code Deep-Dive', 'Behind-the-Scenes Build', 'Practical Data Value', 'Growth Story', 'Project Showcase', 'Resource Wrap-up'."
    },
    word_count: {
      type: "INTEGER",
      description: "Total word count of the optimized post."
    }
  },
  required: ["optimized_post", "hook_analysis", "improvements_made", "post_type", "word_count"]
};
