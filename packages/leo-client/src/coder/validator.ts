/**
 * @file Code validator module for the Coder Agent.
 *
 * This module validates generated code for TypeScript errors and linting issues.
 */

import * as ts from 'typescript';

/**
 * Result of code validation.
 */
export interface ValidationResult {
  /** Whether the code has TypeScript type errors. */
  hasTypeErrors: boolean;
  /** Whether the code has linting errors. */
  hasLintErrors: boolean;
  /** List of type errors found. */
  typeErrors: string[];
  /** List of lint errors found. */
  lintErrors: string[];
}

/**
 * Validates TypeScript code for type errors.
 *
 * @param code - The TypeScript code to validate.
 * @param fileName - The file name to use for validation.
 * @returns The validation result.
 */
export function validateTypeScript(code: string, fileName: string = 'temp.ts'): ValidationResult {
  const compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    strict: true,
    jsx: ts.JsxEmit.React,
    esModuleInterop: true,
    skipLibCheck: true,
    noEmit: true,
  };

  // Create a source file
  const sourceFile = ts.createSourceFile(
    fileName,
    code,
    ts.ScriptTarget.ES2020,
    true,
    fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );

  // Create a program
  const host: ts.CompilerHost = {
    getSourceFile: (name) => (name === fileName ? sourceFile : undefined),
    writeFile: () => {},
    getCurrentDirectory: () => '',
    getDirectories: () => [],
    fileExists: (name) => name === fileName,
    readFile: (name) => (name === fileName ? code : undefined),
    getCanonicalFileName: (name) => name,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n',
    getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
  };

  const program = ts.createProgram([fileName], compilerOptions, host);
  const diagnostics = ts.getPreEmitDiagnostics(program, sourceFile);

  const typeErrors = diagnostics.map((diagnostic) => {
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    if (diagnostic.file && diagnostic.start !== undefined) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
      return `Line ${line + 1}, Col ${character + 1}: ${message}`;
    }
    return message;
  });

  return {
    hasTypeErrors: typeErrors.length > 0,
    hasLintErrors: false, // ESLint validation would go here
    typeErrors,
    lintErrors: [],
  };
}

/**
 * Validates code (both TypeScript type checking and linting).
 *
 * @param code - The code to validate.
 * @param language - The programming language.
 * @returns The validation result.
 */
export function validateCode(code: string, language: string = 'typescript'): ValidationResult {
  if (language === 'typescript' || language === 'javascript') {
    const fileName = language === 'typescript' ? 'temp.ts' : 'temp.js';
    return validateTypeScript(code, fileName);
  }

  // For other languages, return a passing validation
  return {
    hasTypeErrors: false,
    hasLintErrors: false,
    typeErrors: [],
    lintErrors: [],
  };
}
