const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');

// Keep track of current expression
let expression = '';

function updateDisplay(value) {
  if (expression === '0' || expression === 'Error') {
    expression = value;
  } else {
    expression += value;
  }
  display.value = expression;
}

function clearDisplay() {
  expression = '';
  display.value = '';
}

function backspace() {
  expression = expression.slice(0, -1);
  display.value = expression || '';
}

function calculate() {
  if (!expression) return;

  try {
    // Convert expression with power symbol ^ to Math.pow
    let exp = expression.replace(/\^/g, '**');

    // Replace functions with JavaScript Math equivalents
    exp = exp
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/log/g, 'Math.log10')
      .replace(/ln/g, 'Math.log')
      .replace(/sqrt/g, 'Math.sqrt');

    // Evaluate in radians for trig - convert degrees to radians inside expression for better UX
    // Let's convert degrees to radians by replacing sin(30) with Math.sin(30 * Math.PI/180)
    // For that, we use a regex to find sin(...), cos(...), tan(...) and replace inner value

    // Function to convert degrees to radians inside trig functions
    exp = exp.replace(/Math\.(sin|cos|tan)\(([^)]+)\)/g, (match, func, val) => {
      return `Math.${func}(${val} * Math.PI / 180)`;
    });

    let result = eval(exp);

    if (result === Infinity || result === -Infinity || isNaN(result)) {
      display.value = 'Error';
      expression = '';
    } else {
      display.value = result;
      expression = result.toString();
    }
  } catch (err) {
    display.value = 'Error';
    expression = '';
  }
}

// Handle button clicks
buttons.forEach(button => {
  button.addEventListener('click', () => {
    const value = button.getAttribute('data-value');
    const action = button.getAttribute('data-action');
    const func = button.getAttribute('data-func');

    if (action === 'clear') {
      clearDisplay();
    } else if (action === 'backspace') {
      backspace();
    } else if (action === 'equal') {
      calculate();
    } else if (func) {
      // Append function with opening parenthesis for user to input number, e.g. sin(
      updateDisplay(func + '(');
    } else if (value) {
      updateDisplay(value);
    }
  });
});

// Keyboard support
document.addEventListener('keydown', (e) => {
  const allowedKeys = '0123456789+-*/().^';

  if (allowedKeys.includes(e.key)) {
    updateDisplay(e.key);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    calculate();
  } else if (e.key === 'Backspace') {
    backspace();
  } else if (e.key === 'Escape') {
    clearDisplay();
  }
});
