#!/usr/bin/env python3
"""
Simple Calculator - Interactive CLI Tool
Supports addition, subtraction, multiplication, division, modulus, and exponentiation.
"""

import sys
import io

# Force UTF-8 encoding for standard output on Windows consoles
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def add(a: float, b: float) -> float:
    return a + b

def subtract(a: float, b: float) -> float:
    return a - b

def multiply(a: float, b: float) -> float:
    return a * b

def divide(a: float, b: float) -> float:
    if b == 0:
        raise ValueError("Error: Division by zero is undefined.")
    return a / b

def modulus(a: float, b: float) -> float:
    if b == 0:
        raise ValueError("Error: Modulus by zero is undefined.")
    return a % b

def power(a: float, b: float) -> float:
    return a ** b

OPERATIONS = {
    '1': ('Addition (+)', add, '+'),
    '2': ('Subtraction (-)', subtract, '-'),
    '3': ('Multiplication (*)', multiply, '*'),
    '4': ('Division (/)', divide, '/'),
    '5': ('Modulus (%)', modulus, '%'),
    '6': ('Exponentiation (^)', power, '^')
}

def get_number_input(prompt: str) -> float:
    """Prompt the user for a numeric input until a valid number is provided."""
    while True:
        try:
            val_str = input(prompt).strip()
            return float(val_str)
        except ValueError:
            print("  [!] Invalid input! Please enter a valid number (e.g. 42, 3.14, -5).")

def format_number(val: float) -> str:
    """Format float cleanly: display as integer if no decimal part."""
    if val.is_integer():
        return str(int(val))
    return f"{val:.6g}"

def print_banner():
    print("==========================================")
    print("          SIMPLE CALCULATOR               ")
    print("==========================================")

def display_menu():
    print("\nSelect an operation:")
    print("  [1] Addition (+)")
    print("  [2] Subtraction (-)")
    print("  [3] Multiplication (*)")
    print("  [4] Division (/)")
    print("  [5] Modulus (%)")
    print("  [6] Exponentiation (^)")
    print("  [7] Exit")

def run_calculator():
    print_banner()
    
    while True:
        display_menu()
        choice = input("\nEnter your choice (1-7): ").strip()
        
        if choice == '7':
            print("\nThank you for using Simple Calculator! Goodbye!\n")
            break
        
        if choice not in OPERATIONS:
            print("  [!] Invalid choice! Please select a number between 1 and 7.")
            continue
        
        op_name, op_func, op_symbol = OPERATIONS[choice]
        print(f"\n--- {op_name} ---")
        
        num1 = get_number_input("Enter first number:  ")
        num2 = get_number_input("Enter second number: ")
        
        try:
            result = op_func(num1, num2)
            num1_str = format_number(num1)
            num2_str = format_number(num2)
            result_str = format_number(result)
            
            print("\n------------------------------------------")
            print(f"  RESULT:  {num1_str} {op_symbol} {num2_str} = {result_str}")
            print("------------------------------------------")
        except ValueError as e:
            print(f"\n  [!] {e}")
        
        cont = input("\nDo you want to perform another calculation? (y/n): ").strip().lower()
        if cont != 'y' and cont != 'yes':
            print("\nThank you for using Simple Calculator! Goodbye!\n")
            break

if __name__ == "__main__":
    run_calculator()
