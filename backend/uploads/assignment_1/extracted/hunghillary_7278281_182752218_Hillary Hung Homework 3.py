#---------------------------------
# Name: Hillary Hung
# E-mail Address: hvh5516@psu.edu
# Class: CMPSC 101
# Project #: Homework03
# Due Date: 2025.10.3
# Brief Project Description:
# To make a program that calculates the shipping cost based on the
# cost of an item and displays both shipping and total cost.
#---------------------------------

# Title of the calculator:
print("=" * 60)
print("\nShipping Calculator\n")
print("=" * 60)

# Ask user for input and determine the shipping cost and total cost:
try:
        cost = float(input('\nEnter the cost of the item ordered: '))
        if cost < 0:
                print('You must enter a positive number. Please try again.')
        elif cost < 30:
                shipping_cost = 5.95
        elif cost < 50:
                shipping_cost = 7.95
        elif cost < 75:
                shipping_cost = 9.95
        else:
                shipping_cost = 0.00

        total_cost = cost + shipping_cost

# Display results with 2 decimal places:
        print(f'\nShipping Cost: \t\t${shipping_cost:.2f}')
        print(f'\nTotal cost: \t\t${total_cost:.2f}')

except ValueError:
    print('Invalid input. Please enter a valid number.')
