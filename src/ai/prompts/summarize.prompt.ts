export const buildSummarizePrompt = (
  content: string,
  maxLength: 'short' | 'medium' | 'detailed',
): string => {
  const instructions = {
    short: 'in 2-3 sentences',
    medium: 'in a short paragraph (5-7 sentences)',
    detailed: 'in a detailed summary (10+ sentences)',
  };

  return `Summarize the following article ${instructions[maxLength]}: ${content}`;
};
