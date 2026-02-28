export function buildAnalysisPrompt({ jobDescription, resumeText, coverLetterText }) {
  const hasCoverLetter = coverLetterText && coverLetterText.trim().length > 0;

  const systemPrompt = `You are an expert career coach and professional resume writer with 15 years of experience helping candidates tailor their applications to specific job descriptions. You have deep knowledge of ATS (Applicant Tracking Systems) and what hiring managers look for.

Your task is to analyze a candidate's resume${hasCoverLetter ? ' and cover letter' : ''} against a job description and produce:
1. A bullet-point list of specific, actionable changes you made and why
2. A fully rewritten resume that is highly tailored to the job description
${hasCoverLetter ? '3. A fully rewritten cover letter tailored to the job description' : ''}

Guidelines for rewriting:
- Mirror the exact language and keywords from the job description where truthful
- Quantify achievements wherever possible (use placeholders like [X%] if numbers are not provided)
- Reorder bullet points to lead with the most relevant experience for this specific role
- Adjust the professional summary/objective to directly address this role
- Keep the same overall structure and factual information - do not invent credentials
- For the cover letter: make it compelling, specific to the company and role, and under 400 words

IMPORTANT: Format your response EXACTLY as follows with these XML tags:

<bullet_points>
- [Change 1]: Brief explanation of why this change improves the application
- [Change 2]: Brief explanation
... (8-12 bullet points total)
</bullet_points>

<revised_resume>
[Full revised resume text here, preserving the original format as much as possible]
</revised_resume>
${hasCoverLetter ? `
<revised_cover_letter>
[Full revised cover letter text here]
</revised_cover_letter>
` : ''}

Do not include any text outside of these XML tags. Do not add preamble or postamble.`;

  const userPrompt = `Here is the job description:

---JOB DESCRIPTION---
${jobDescription.trim()}
---END JOB DESCRIPTION---

Here is the candidate's current resume:

---RESUME---
${resumeText.trim()}
---END RESUME---

${hasCoverLetter ? `Here is the candidate's current cover letter:

---COVER LETTER---
${coverLetterText.trim()}
---END COVER LETTER---

` : ''}Please analyze and rewrite the resume${hasCoverLetter ? ' and cover letter' : ''} to be maximally tailored to this job description.`;

  return { systemPrompt, userPrompt };
}

export function parseAnalysisResponse(responseText) {
  function extractTag(tag) {
    const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const match = responseText.match(regex);
    return match ? match[1].trim() : '';
  }

  const bulletPointsRaw = extractTag('bullet_points');
  const bulletPoints = bulletPointsRaw
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('-'))
    .map(line => line.substring(1).trim());

  return {
    bulletPoints,
    revisedResume: extractTag('revised_resume'),
    revisedCoverLetter: extractTag('revised_cover_letter'),
  };
}
