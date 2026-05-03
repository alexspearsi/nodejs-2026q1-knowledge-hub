import { AnalyzeTask } from '../dto/analyze-article.dto';

export const buildAnalyzePrompt = (
  content: string,
  task: AnalyzeTask,
): string => {
  const instructions = {
    review: 'Review the following article for quality, clarity, and accuracy.',
    bugs: 'Identify factual errors, inconsistencies, or logical flaws in the following article.',
    optimize:
      'Suggest improvements for structure, readability, and SEO of the following article.',
    explain:
      'Explain the key concepts and ideas in the following article in simple terms.',
  };

  return `${instructions[task]}

Respond ONLY with a valid JSON object in the following format, no markdown, no extra text:
{
  "analysis": "<main analysis as a single string>",
  "suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"],
  "severity": "<info|warning|error>"
}

Severity rules:
- "error" if there are critical issues (factual errors, serious logical flaws)
- "warning" if there are notable issues worth addressing
- "info" if the content is generally good with minor suggestions

Article:
${content}`;
};
