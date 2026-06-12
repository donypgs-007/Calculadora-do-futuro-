/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Safely evaluates a mathematical expression string using standard operator precedence (BODMAS).
 * Replaces '×' with '*' and '÷' with '/' before evaluation.
 */
export function evaluateExpression(expression: string): string {
  try {
    // Sanitize string and replace symbols with JS equivalents
    const sanitized = expression
      .replace(/×/g, '*')
      .replace(/÷/g, '/');

    // Remove any letters or malicious JS code from the calculation string
    // Only allow digits, operators, dots, and spaces
    if (/[^0-9+\-*/.\s]/.test(sanitized)) {
      throw new Error('Invalid characters');
    }

    // A lightweight parser avoiding 'eval' for maximum security and safety.
    // We will parse the expression into numbers and operators, then evaluate.
    const tokens: string[] = [];
    let currentToken = '';

    for (let i = 0; i < sanitized.length; i++) {
      const char = sanitized[i];
      if ('+-*/'.includes(char)) {
        if (currentToken) {
          tokens.push(currentToken.trim());
          currentToken = '';
        }
        tokens.push(char);
      } else {
        currentToken += char;
      }
    }
    
    if (currentToken) {
      tokens.push(currentToken.trim());
    }

    // Filter empty tokens
    const cleanTokens = tokens.filter(t => t.length > 0);
    if (cleanTokens.length === 0) return '0';

    // Verify correct token ordering (no consecutive operators, starts/ends on safe operands)
    // Supports unary operators briefly or handles first operator as sign
    let parsedTokens: (number | string)[] = [];
    for (let i = 0; i < cleanTokens.length; i++) {
      const token = cleanTokens[i];
      if ('+-*/'.includes(token)) {
        // If it is binary operator
        parsedTokens.push(token);
      } else {
        const num = parseFloat(token);
        if (isNaN(num)) {
          throw new Error('Erro de sintaxe');
        }
        parsedTokens.push(num);
      }
    }

    // Evaluate Multiplication and Division first
    let i = 0;
    while (i < parsedTokens.length) {
      if (parsedTokens[i] === '*' || parsedTokens[i] === '/') {
        const op = parsedTokens[i] as string;
        const prev = parsedTokens[i - 1];
        const next = parsedTokens[i + 1];

        if (typeof prev !== 'number' || typeof next !== 'number') {
          throw new Error('Sintaxe incorreta');
        }

        let tempResult = 0;
        if (op === '*') {
          tempResult = prev * next;
        } else {
          if (next === 0) {
            return 'Divisão por zero';
          }
          tempResult = prev / next;
        }

        // Replace the three tokens [prev, op, next] with the tempResult
        parsedTokens.splice(i - 1, 3, tempResult);
        // Do not increment i, stay at current index since length reduced
        i--;
      } else {
        i++;
      }
    }

    // Evaluate Addition and Subtraction next
    i = 0;
    while (i < parsedTokens.length) {
      if (parsedTokens[i] === '+' || parsedTokens[i] === '-') {
        const op = parsedTokens[i] as string;
        const prev = parsedTokens[i - 1];
        const next = parsedTokens[i + 1];

        // If it starts with a plus/minus symbol (unary positive/negative at index 0)
        if (i === 0 && typeof next === 'number') {
          const val = op === '-' ? -next : next;
          parsedTokens.splice(0, 2, val);
          continue;
        }

        if (typeof prev !== 'number' || typeof next !== 'number') {
          throw new Error('Sintaxe incorreta');
        }

        let tempResult = 0;
        if (op === '+') {
          tempResult = prev + next;
        } else {
          tempResult = prev - next;
        }

        parsedTokens.splice(i - 1, 3, tempResult);
        i--;
      } else {
        i++;
      }
    }

    if (parsedTokens.length !== 1 || typeof parsedTokens[0] !== 'number') {
      throw new Error('Não pôde simplificar');
    }

    const finalValue = parsedTokens[0];
    
    // Prevent standard JavaScript floating-point representation bugs like 0.1 + 0.2 = 0.300000004
    // We adjust with safe toPrecision / toFixed trimming of useless decimals
    const numStr = finalValue.toFixed(10);
    const parsedBack = parseFloat(numStr);
    
    // Convert back to localized string but use plain standard characters for numbers
    return parsedBack.toString();
  } catch (err) {
    console.error('Calculation error for expression:', expression, err);
    return 'Erro';
  }
}
