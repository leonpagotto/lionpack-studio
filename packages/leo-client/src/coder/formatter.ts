/**
 * @file Code formatter module for the Coder Agent.
 *
 * This module formats generated code using Prettier.
 */

import * as prettier from 'prettier';

/**
 * Formats code using Prettier.
 *
 * @param code - The code to format.
 * @param language - The programming language.
 * @returns The formatted code.
 */
export async function formatCode(code: string, language: string = 'typescript'): Promise<string> {
  try {
    const parser = getParser(language);

    const formatted = await prettier.format(code, {
      parser,
      semi: true,
      singleQuote: true,
      trailingComma: 'es5',
      printWidth: 100,
      tabWidth: 2,
    });

    return formatted;
  } catch (error) {
    // If formatting fails, return the original code
    console.error('Formatting error:', error);
    return code;
  }
}

/**
 * Gets the appropriate Prettier parser for a given language.
 *
 * @param language - The programming language.
 * @returns The Prettier parser name.
 */
function getParser(language: string): string {
  const parserMap: Record<string, string> = {
    typescript: 'typescript',
    javascript: 'babel',
    python: 'python',
    json: 'json',
    html: 'html',
    css: 'css',
    markdown: 'markdown',
  };

  return parserMap[language.toLowerCase()] || 'babel';
}
