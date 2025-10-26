
# Name: Alan Kidwell
# E-mail Address: mak7331@psu.edu
# Class: CMPSC 101
# Project # hw 3
# Due Date: october 3rd
# Brief Project Description this program will calculate total cost of shipping


# Shipping Calculator Program
print("                     Shipping Calculator                       ")

# Ask the user for input
cost = float(input("Enter the cost of the item ordered: "))

# Check for invalid input
if cost < 0:
    print("You must enter a positive number. Please try again.")
else:
    # Determine shipping cost
    if cost < 30:
        shipping = 5.95
    elif cost < 50:
        shipping = 7.95
    elif cost < 75:
        shipping = 9.95
    else:
        shipping = 0.00

    # Calculate total
    total = cost + shipping

    # Display results rounded to two decimal places
    print(f"Shipping cost: ${shipping:.2f}")
    print(f"Total cost: ${total:.2f}")
