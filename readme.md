# 🧮 Simple Calculator Application

A versatile, elegant Calculator supporting basic and advanced arithmetic operations (`+`, `-`, `*`, `/`, `%`, `^`).

Designed with two interactive interface options:
1. **Python Interactive CLI Tool (`calculator.py`)**
2. **Web Application Suite (`index.html`, `styles.css`, `app.js`)**

---

## 🚀 Features

### 1. Arithmetic Operations
- **Addition (`+`)**: Sum of two numbers
- **Subtraction (`-`)**: Difference between numbers
- **Multiplication (`*` / `×`)**: Product of numbers
- **Division (`/` / `÷`)**: Quotient with Zero-Division Safety
- **Modulus (`%`)**: Remainder of integer/float division
- **Exponentiation (`^`)**: Power calculations

### 2. Dual Web Interface Modes
- **Guided Prompt Mode**: Enter two numbers and select an operation choice to view formatted step-by-step breakdowns.
- **Keypad Mode**: Visual button layout with full keyboard shortcuts (Numpad, Enter, Backspace, Escape).
- **Glassmorphism UI**: Dark mode with customizable ambient theme toggles, floating glows, and smooth transitions.
- **Calculation History**: Automatic log of past calculations with instant result copy and memory retrieval.

---

## 💻 Running the Python CLI Calculator

Ensure Python 3 is installed, then run:

```bash
python calculator.py
```

### CLI Options:
- Prompt-based interactive menu (Select `1-6` for operations, `7` to Exit).
- Input validation handles invalid numeric entries and division by zero gracefully.

---

## 🌐 Running the Web Application

You can open `index.html` directly in any web browser, or launch a lightweight HTTP server:

```bash
npx -y http-server . -p 8080
```
Then visit `http://localhost:8080`.
