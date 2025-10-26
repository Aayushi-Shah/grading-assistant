#----------------------------------------------------------
# Name: Tyler Moreno
# E-mail Address:tjm7421@psu.edu
# Class: CMPSC 101
# Project #: 3
# Due Date: 10/03/2025
# Brief Project Description:
#   This program asks the user to enter the cost of an item,
#   calculates the shipping cost based on the given table,
#   and displays the shipping cost and total cost. If the
#   user enters a negative number, an error message is shown.
#----------------------------------------------------------

print("===============================================================")
print("Shipping Calculator")
print("===============================================================")

cost = float(input("Enter the cost of the item ordered: "))

if cost < 0:
    print("You must enter a positive number. Please try again.")
else:
    if cost <= 29.99:
        shipping = 5.95
    elif cost <= 49.99:
        shipping = 7.95
    elif cost <= 74.99:
        shipping = 9.95
    else:
        shipping = 0.00  

total = cost + shipping

print(f"Shipping cost: ${shipping:.2f}")
print(f"Total cost: ${total:.2f}")
