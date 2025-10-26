/**
 * @file Few-shot examples for the Coder Agent.
 *
 * These examples demonstrate the expected quality and format of generated code.
 */

/**
 * Example of a well-generated React component.
 */
export const REACT_COMPONENT_EXAMPLE = {
  prompt: 'Create a reusable Button component with variants',
  code: `import React from 'react';

/**
 * Props for the Button component.
 */
interface ButtonProps {
  /** The button label text */
  children: React.ReactNode;
  /** The button style variant */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Click handler */
  onClick?: () => void;
}

/**
 * A reusable button component with multiple variants.
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  disabled = false,
  onClick,
}) => {
  const baseClasses = 'px-4 py-2 rounded font-medium transition-colors';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed';

  const className = \`\${baseClasses} \${variantClasses[variant]} \${
    disabled ? disabledClasses : ''
  }\`;

  return (
    <button
      className={className}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
};`,
};

/**
 * Example of a utility function.
 */
export const UTILITY_FUNCTION_EXAMPLE = {
  prompt: 'Create a function to validate email addresses',
  code: `/**
 * Validates whether a string is a valid email address.
 *
 * @param email - The email address to validate.
 * @returns True if the email is valid, false otherwise.
 *
 * @example
 * \`\`\`typescript
 * validateEmail('user@example.com'); // true
 * validateEmail('invalid-email'); // false
 * \`\`\`
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;

  return emailRegex.test(email.trim());
}`,
};

/**
 * All few-shot examples.
 */
export const FEW_SHOT_EXAMPLES = [
  REACT_COMPONENT_EXAMPLE,
  UTILITY_FUNCTION_EXAMPLE,
];
