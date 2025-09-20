/**
 * Interactive Calculator - JavaScript Implementation
 * Features: DOM manipulation, event handling, keyboard support, error handling
 */

class Calculator {
    constructor() {
        this.display = document.getElementById('display');
        this.operationDisplay = document.getElementById('operation-display');
        this.toastContainer = document.getElementById('toast-container');
        
        // Calculator state
        this.currentValue = '0';
        this.previousValue = null;
        this.operation = null;
        this.waitingForNewValue = false;
        
        this.init();
    }
    
    init() {
        this.attachEventListeners();
        this.setupKeyboardListeners();
        this.updateDisplay();
    }
    
    // Event Listeners
    attachEventListeners() {
        // Button click events using event delegation
        document.querySelector('.button-grid').addEventListener('click', (e) => {
            if (!e.target.matches('button')) return;
            
            const action = e.target.dataset.action;
            const button = e.target;
            
            // Visual feedback
            this.animateButton(button);
            
            switch (action) {
                case 'number':
                    this.inputNumber(e.target.dataset.number);
                    break;
                case 'operator':
                    this.performOperation(e.target.dataset.operator);
                    break;
                case 'decimal':
                    this.inputDecimal();
                    break;
                case 'equals':
                    this.handleEquals();
                    break;
                case 'clear':
                    this.clear();
                    break;
                case 'backspace':
                    this.backspace();
                    break;
            }
        });
    }
    
    setupKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            // Prevent default behavior for calculator keys
            if (this.isCalculatorKey(e.key)) {
                e.preventDefault();
            }
            
            this.handleKeyPress(e.key);
        });
    }
    
    isCalculatorKey(key) {
        const calculatorKeys = [
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            '+', '-', '*', '/', '=', 'Enter', 'Escape', 'Backspace',
            '.', 'c', 'C'
        ];
        return calculatorKeys.includes(key);
    }
    
    handleKeyPress(key) {
        if (key >= '0' && key <= '9') {
            this.inputNumber(key);
            this.highlightButton(`[data-number="${key}"]`);
        } else if (key === '.') {
            this.inputDecimal();
            this.highlightButton('[data-action="decimal"]');
        } else if (['+', '-', '*', '/'].includes(key)) {
            this.performOperation(key);
            this.highlightButton(`[data-operator="${key}"]`);
        } else if (key === 'Enter' || key === '=') {
            this.handleEquals();
            this.highlightButton('[data-action="equals"]');
        } else if (key === 'Escape' || key === 'c' || key === 'C') {
            this.clear();
            this.highlightButton('[data-action="clear"]');
        } else if (key === 'Backspace') {
            this.backspace();
            this.highlightButton('[data-action="backspace"]');
        }
    }
    
    // Calculator Operations
    inputNumber(num) {
        if (this.waitingForNewValue) {
            this.currentValue = num;
            this.waitingForNewValue = false;
        } else {
            this.currentValue = this.currentValue === '0' ? num : this.currentValue + num;
        }
        this.updateDisplay();
    }
    
    inputDecimal() {
        if (this.waitingForNewValue) {
            this.currentValue = '0.';
            this.waitingForNewValue = false;
        } else if (this.currentValue.indexOf('.') === -1) {
            this.currentValue += '.';
        }
        this.updateDisplay();
    }
    
    clear() {
        this.currentValue = '0';
        this.previousValue = null;
        this.operation = null;
        this.waitingForNewValue = false;
        this.updateDisplay();
        this.updateOperationDisplay();
    }
    
    backspace() {
        if (this.currentValue.length > 1) {
            this.currentValue = this.currentValue.slice(0, -1);
        } else {
            this.currentValue = '0';
        }
        this.updateDisplay();
    }
    
    performOperation(nextOperation) {
        const inputValue = parseFloat(this.currentValue);
        
        if (this.previousValue === null) {
            this.previousValue = inputValue;
        } else if (this.operation) {
            const result = this.calculate(this.previousValue, inputValue, this.operation);
            
            if (result === null) {
                return; // Error already handled
            }
            
            this.currentValue = String(result);
            this.previousValue = result;
            this.updateDisplay();
        }
        
        this.operation = nextOperation;
        this.waitingForNewValue = true;
        this.updateOperationDisplay();
    }
    
    handleEquals() {
        const inputValue = parseFloat(this.currentValue);
        
        if (this.previousValue !== null && this.operation) {
            const result = this.calculate(this.previousValue, inputValue, this.operation);
            
            if (result !== null) {
                this.currentValue = String(result);
                this.previousValue = null;
                this.operation = null;
                this.waitingForNewValue = true;
                this.updateDisplay();
                this.updateOperationDisplay();
            }
        }
    }
    
    calculate(firstValue, secondValue, operation) {
        try {
            let result;
            
            switch (operation) {
                case '+':
                    result = firstValue + secondValue;
                    break;
                case '-':
                    result = firstValue - secondValue;
                    break;
                case '*':
                    result = firstValue * secondValue;
                    break;
                case '/':
                    if (secondValue === 0) {
                        this.showToast('Error', 'Cannot divide by zero');
                        return null;
                    }
                    result = firstValue / secondValue;
                    break;
                default:
                    return secondValue;
            }
            
            // Handle floating point precision
            if (result % 1 !== 0) {
                result = parseFloat(result.toFixed(10));
            }
            
            // Check for valid result
            if (!isFinite(result)) {
                this.showToast('Error', 'Invalid calculation');
                return null;
            }
            
            return result;
            
        } catch (error) {
            this.showToast('Error', 'Invalid calculation');
            return null;
        }
    }
    
    // Display Updates
    updateDisplay() {
        // Format large numbers
        const displayValue = this.formatDisplayValue(this.currentValue);
        this.display.textContent = displayValue;
    }
    
    updateOperationDisplay() {
        if (this.operation && this.previousValue !== null) {
            const operatorSymbol = this.getOperatorSymbol(this.operation);
            this.operationDisplay.textContent = `${this.formatDisplayValue(String(this.previousValue))} ${operatorSymbol}`;
        } else {
            this.operationDisplay.textContent = '';
        }
    }
    
    formatDisplayValue(value) {
        const num = parseFloat(value);
        
        // Handle very large numbers
        if (Math.abs(num) >= 1e15) {
            return num.toExponential(6);
        }
        
        // Handle very small numbers
        if (Math.abs(num) < 1e-6 && num !== 0) {
            return num.toExponential(6);
        }
        
        // Regular formatting
        if (value.length > 12) {
            return parseFloat(value).toPrecision(12);
        }
        
        return value;
    }
    
    getOperatorSymbol(operator) {
        const symbols = {
            '+': '+',
            '-': '-',
            '*': '×',
            '/': '÷'
        };
        return symbols[operator] || operator;
    }
    
    // Visual Effects
    animateButton(button) {
        button.classList.add('pressed');
        setTimeout(() => {
            button.classList.remove('pressed');
        }, 100);
    }
    
    highlightButton(selector) {
        const button = document.querySelector(selector);
        if (button) {
            this.animateButton(button);
        }
    }
    
    // Toast Notifications
    showToast(title, description) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        
        toast.innerHTML = `
            <div class="toast-title">${title}</div>
            <div class="toast-description">${description}</div>
        `;
        
        this.toastContainer.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});

// Add some interactive enhancements
document.addEventListener('DOMContentLoaded', () => {
    // Add focus styles for accessibility
    const buttons = document.querySelectorAll('.calc-btn');
    buttons.forEach(button => {
        button.addEventListener('focus', () => {
            button.style.outline = '2px solid hsl(280 100% 60%)';
            button.style.outlineOffset = '2px';
        });
        
        button.addEventListener('blur', () => {
            button.style.outline = 'none';
        });
    });
    
    // Add loading animation
    const calculator = document.querySelector('.calculator');
    calculator.style.opacity = '0';
    calculator.style.transform = 'translateY(20px)';
    calculator.style.transition = 'all 0.5s ease-out';
    
    setTimeout(() => {
        calculator.style.opacity = '1';
        calculator.style.transform = 'translateY(0)';
    }, 100);
});