/**
 * @file Exports the public API for the Coder Agent.
 *
 * This barrel file provides a single entry point for consuming the Coder Agent's
 * functionalities, including type definitions and the primary generation function.
 */

export * from "./types";
export { generateCode } from "./generator";
export { validateCode, validateTypeScript } from "./validator";
export { formatCode } from "./formatter";
export { estimateTestCoverage } from "./test-generator";
