export const buildTranslatePrompt = (
  content: string,
  targetLanguage: string,
  sourceLanguage?: string,
): string => {
  const from = sourceLanguage ? ` from ${sourceLanguage}` : '';

  return `Translate the following article${from} to ${targetLanguage}. Return only the translated text without any explanations or comments:\n\n${content}`;
};
