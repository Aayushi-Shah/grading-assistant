#----------------------------------------------------------
# Name:             jiatang li
# E-mail Address:   jbl6888@psu.edu
# Class:            CMPSC 101
# Project #:        Homework 3
# Due Date:         October 3, 2025
# Brief Project Description:
# This program calculates the shipping and total cost for an item based on its price, as entered by the user.
# It handles different price tiers for shipping and validates user input.
#----------------------------------------------------------

#Display the program's title
print("===============================================================")
print("Shipping Calculator")
print("===============================================================")
# Prompt the user for the item cost and convert it to a float
item_cost = float(input("Enter the cost of the item ordered: "))
# Step 1: check if the input is a positive number。
if item_cost < 0:
    print("You must enter a positive number. Please try again.")
else:
    # STEP 2: If the input is valid, calculate the shipping cost based on the price range
    # Use an if-elif-else structure to match the shipping cost table provided in the assignment
    shipping_cost = 0.0  
    if item_cost <= 29.99:
         # Corresponds to the price range $0.00-$29.99
        shipping_cost = 5.95
    elif item_cost <= 49.99:
        # Corresponds to the price range $30.00-$49.99
        shipping_cost = 7.95
    elif item_cost <= 74.99:
        # Corresponds to the price range $50.00-$74.99
        shipping_cost = 9.95
    else:
        # Corresponds to the price range $75.00 or more，where shipping is FREE
        shipping_cost = 0.00

    # 步骤 3: 计算总成本
    total_cost = item_cost + shipping_cost

    # now show the result
    print(f"Shipping cost:\t\t${shipping_cost:.2f}")
    print(f"Total cost:\t\t${total_cost:.2f}")
#That is the end of the section, thank you for correcting my homework.
#HAVE A GOOD WEEKEND!
