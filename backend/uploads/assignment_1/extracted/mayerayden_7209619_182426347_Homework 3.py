#---------------------------------
# Name: Ayden Mayer
# Email Address: ajm9442@psu.edu
# Class: CMPSC 101
# Project: Homework #3
# Due Date: 10/03/2025
# Brief Project Description: Write a program that asks the user to enter the cost of an item then displays
# the shipping cost and the total cost. If the user enters a number that’s less than zero,
# program should display an error message. The output should be rounded to two decimal
# places of precision
#---------------------------------

# Defines the main function that runs the program
def main():

    # Prompt the user to enter the cost of the item and convert input to float
    cost = float(input("Enter the cost of the item ordered: "))

    # Calculate the shipping cost by calling the shipping_cost_calculation function
    shipping_cost = shipping_cost_calculation(cost)

    # Display the shipping cost (not rounded in this print statement)
    print(f"Shipping cost:\t {shipping_cost}")

    # Display the total cost (item cost + shipping), rounded to two decimal places
    print(f"Total cost:\t {(shipping_cost + cost):.2f}")

# Function to determine shipping cost based on the item cost
def shipping_cost_calculation(cost):
    
    # If the cost is negative, print an error message
    if cost < 0:
        print("You must enter a positive value. Please try again.")
    
    # If the cost is between $0 and $29.99, shipping is $5.95
    elif 0 <= cost <= 29.99:
        return 5.95
    
    # If the cost is between $30.00 and $49.99, shipping is $7.95
    elif 30.00 <= cost <= 49.99:
        return 7.95
    
    # If the cost is between $50.00 and $74.99, shipping is $9.95
    elif 50.00 <= cost <= 74.99:
        return 9.95
    
    # If the cost is $75.00 or more, shipping is free
    else:
        return 0

# Calls the main function to start the program
main()