// Safe Math Engine for LiquidCalc (no eval)
// Implements Shunting-Yard algorithm & Reverse Polish Notation (RPN) evaluator

export interface EvaluationResult {
  value: number;
  error?: string;
}

// Factorial helper
function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity; // JS Number limit
  let res = 1;
  for (let i = 2; i <= n; i++) {
    res *= i;
  }
  return res;
}

// Token types
type TokenType = 'NUMBER' | 'OP' | 'LPAREN' | 'RPAREN' | 'FUNC' | 'POSTFIX';

interface Token {
  type: TokenType;
  value: string;
}

export function tokenize(rawExpr: string): Token[] {
  // Normalize symbols
  let expr = rawExpr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, 'pi')
    .trim();

  const tokens: Token[] = [];
  let i = 0;

  while (i < expr.length) {
    const char = expr[i];

    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // Numbers & decimals
    if (/[0-9]/.test(char) || (char === '.' && i + 1 < expr.length && /[0-9]/.test(expr[i + 1]))) {
      let numStr = '';
      while (i < expr.length && (/[0-9]/.test(expr[i]) || expr[i] === '.')) {
        numStr += expr[i];
        i++;
      }
      tokens.push({ type: 'NUMBER', value: numStr });
      continue;
    }

    // Identifier / Functions / Constants
    if (/[a-zA-Z]/.test(char)) {
      let name = '';
      while (i < expr.length && /[a-zA-Z0-9_]/.test(expr[i])) {
        name += expr[i];
        i++;
      }
      name = name.toLowerCase();

      if (name === 'pi') {
        tokens.push({ type: 'NUMBER', value: String(Math.PI) });
      } else if (name === 'e') {
        tokens.push({ type: 'NUMBER', value: String(Math.E) });
      } else {
        // Supported functions: sin, cos, tan, asin, acos, atan, log, ln, sqrt, cbrt, abs
        tokens.push({ type: 'FUNC', value: name });
      }
      continue;
    }

    // Postfix factorial: !
    if (char === '!') {
      tokens.push({ type: 'POSTFIX', value: '!' });
      i++;
      continue;
    }

    // Parentheses
    if (char === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
      continue;
    }

    if (char === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
      continue;
    }

    // Operators
    if (['+', '-', '*', '/', '%', '^'].includes(char)) {
      // Check if minus is unary negation
      if (char === '-') {
        const prevToken = tokens[tokens.length - 1];
        if (!prevToken || prevToken.type === 'OP' || prevToken.type === 'LPAREN' || prevToken.type === 'FUNC') {
          // Unary minus: represented as '~'
          tokens.push({ type: 'OP', value: '~' });
          i++;
          continue;
        }
      }
      tokens.push({ type: 'OP', value: char });
      i++;
      continue;
    }

    i++;
  }

  return tokens;
}

const PRECEDENCE: Record<string, number> = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
  '%': 2,
  '^': 3,
  '~': 4, // unary minus
};

const RIGHT_ASSOCIATIVE: Record<string, boolean> = {
  '^': true,
  '~': true,
};

export function evaluateExpression(expr: string, isDegreeMode = false): EvaluationResult {
  if (!expr || !expr.trim()) {
    return { value: 0 };
  }

  try {
    const tokens = tokenize(expr);
    if (tokens.length === 0) return { value: 0 };

    // Shunting-yard to convert infix tokens to RPN
    const outputQueue: Token[] = [];
    const operatorStack: Token[] = [];

    for (const token of tokens) {
      if (token.type === 'NUMBER') {
        outputQueue.push(token);
      } else if (token.type === 'FUNC') {
        operatorStack.push(token);
      } else if (token.type === 'POSTFIX') {
        outputQueue.push(token);
      } else if (token.type === 'OP') {
        const o1 = token.value;
        while (operatorStack.length > 0) {
          const top = operatorStack[operatorStack.length - 1];
          if (top.type === 'FUNC') {
            outputQueue.push(operatorStack.pop()!);
          } else if (top.type === 'OP') {
            const o2 = top.value;
            const p1 = PRECEDENCE[o1] || 0;
            const p2 = PRECEDENCE[o2] || 0;
            if ((!RIGHT_ASSOCIATIVE[o1] && p1 <= p2) || (RIGHT_ASSOCIATIVE[o1] && p1 < p2)) {
              outputQueue.push(operatorStack.pop()!);
            } else {
              break;
            }
          } else {
            break;
          }
        }
        operatorStack.push(token);
      } else if (token.type === 'LPAREN') {
        operatorStack.push(token);
      } else if (token.type === 'RPAREN') {
        let foundLparen = false;
        while (operatorStack.length > 0) {
          const top = operatorStack.pop()!;
          if (top.type === 'LPAREN') {
            foundLparen = true;
            break;
          } else {
            outputQueue.push(top);
          }
        }
        if (!foundLparen) {
          return { value: NaN, error: 'Mismatched parentheses' };
        }
        if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type === 'FUNC') {
          outputQueue.push(operatorStack.pop()!);
        }
      }
    }

    while (operatorStack.length > 0) {
      const top = operatorStack.pop()!;
      if (top.type === 'LPAREN' || top.type === 'RPAREN') {
        return { value: NaN, error: 'Mismatched parentheses' };
      }
      outputQueue.push(top);
    }

    // Evaluate RPN
    const evalStack: number[] = [];

    const toRad = (angle: number) => (isDegreeMode ? (angle * Math.PI) / 180 : angle);
    const toDeg = (rad: number) => (isDegreeMode ? (rad * 180) / Math.PI : rad);

    for (const token of outputQueue) {
      if (token.type === 'NUMBER') {
        evalStack.push(parseFloat(token.value));
      } else if (token.type === 'POSTFIX' && token.value === '!') {
        if (evalStack.length < 1) return { value: NaN, error: 'Invalid syntax' };
        const a = evalStack.pop()!;
        evalStack.push(factorial(a));
      } else if (token.type === 'OP') {
        if (token.value === '~') {
          // Unary minus
          if (evalStack.length < 1) return { value: NaN, error: 'Invalid syntax' };
          const a = evalStack.pop()!;
          evalStack.push(-a);
        } else {
          if (evalStack.length < 2) return { value: NaN, error: 'Invalid syntax' };
          const b = evalStack.pop()!;
          const a = evalStack.pop()!;

          switch (token.value) {
            case '+':
              evalStack.push(a + b);
              break;
            case '-':
              evalStack.push(a - b);
              break;
            case '*':
              evalStack.push(a * b);
              break;
            case '/':
              if (b === 0) return { value: NaN, error: 'Division by zero' };
              evalStack.push(a / b);
              break;
            case '%':
              evalStack.push((a * b) / 100);
              break;
            case '^':
              evalStack.push(Math.pow(a, b));
              break;
          }
        }
      } else if (token.type === 'FUNC') {
        if (evalStack.length < 1) return { value: NaN, error: 'Invalid syntax' };
        const a = evalStack.pop()!;

        switch (token.value) {
          case 'sin':
            evalStack.push(Math.sin(toRad(a)));
            break;
          case 'cos':
            evalStack.push(Math.cos(toRad(a)));
            break;
          case 'tan': {
            const rad = toRad(a);
            // Check for 90, 270 deg
            if (Math.abs(Math.cos(rad)) < 1e-12) {
              return { value: NaN, error: 'Undefined (tan 90°)' };
            }
            evalStack.push(Math.tan(rad));
            break;
          }
          case 'asin':
            if (a < -1 || a > 1) return { value: NaN, error: 'Domain error' };
            evalStack.push(toDeg(Math.asin(a)));
            break;
          case 'acos':
            if (a < -1 || a > 1) return { value: NaN, error: 'Domain error' };
            evalStack.push(toDeg(Math.acos(a)));
            break;
          case 'atan':
            evalStack.push(toDeg(Math.atan(a)));
            break;
          case 'log':
            if (a <= 0) return { value: NaN, error: 'Domain error' };
            evalStack.push(Math.log10(a));
            break;
          case 'ln':
            if (a <= 0) return { value: NaN, error: 'Domain error' };
            evalStack.push(Math.log(a));
            break;
          case 'sqrt':
            if (a < 0) return { value: NaN, error: 'Domain error (√ negative)' };
            evalStack.push(Math.sqrt(a));
            break;
          case 'cbrt':
            evalStack.push(Math.cbrt(a));
            break;
          case 'abs':
            evalStack.push(Math.abs(a));
            break;
          default:
            return { value: NaN, error: `Unknown function ${token.value}` };
        }
      }
    }

    if (evalStack.length !== 1) {
      return { value: NaN, error: 'Invalid expression' };
    }

    const rawValue = evalStack[0];
    if (isNaN(rawValue)) {
      return { value: NaN, error: 'Error' };
    }

    // Clean up precision floating point artifacts: e.g. 0.1 + 0.2 = 0.30000000000000004
    const rounded = Number(Math.round(Number(rawValue + 'e12')) + 'e-12');
    return { value: rounded };
  } catch {
    return { value: NaN, error: 'Syntax Error' };
  }
}

// Format number with precision & locale grouping (Standard or Indian format)
export function formatNumber(
  num: number,
  precision = 6,
  style: 'standard' | 'in' = 'standard'
): string {
  if (isNaN(num)) return 'Error';
  if (!isFinite(num)) return num > 0 ? 'Infinity' : '-Infinity';

  // For very large or very small numbers, use scientific notation
  const abs = Math.abs(num);
  if (abs !== 0 && (abs >= 1e15 || abs <= 1e-9)) {
    return num.toExponential(4);
  }

  // Handle rounding to max precision
  const factor = Math.pow(10, precision);
  const roundedNum = Math.round(num * factor) / factor;

  const parts = roundedNum.toString().split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  const isNeg = integerPart.startsWith('-');
  if (isNeg) {
    integerPart = integerPart.substring(1);
  }

  if (style === 'in') {
    // Indian grouping: 3 digits, then every 2 digits (e.g. 10,00,000)
    if (integerPart.length > 3) {
      const lastThree = integerPart.substring(integerPart.length - 3);
      const otherDigits = integerPart.substring(0, integerPart.length - 3);
      const grouped = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
      integerPart = grouped + ',' + lastThree;
    }
  } else {
    // Standard international grouping: every 3 digits
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  const finalInt = isNeg ? `-${integerPart}` : integerPart;
  return decimalPart ? `${finalInt}.${decimalPart}` : finalInt;
}
