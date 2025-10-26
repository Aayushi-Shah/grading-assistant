#-------------------------------------------------------------------------
# Name: Samuel Gallardo-Del Prestamo
# Email: svg6244@psu.edu
# Class: CMPSC 101
# Project #3
# Brief Project description:
# This program calculates the shipping cost based on the price of an item.
# it displays the shipping cost, the total cost or an error message if the
# entered price is invalid
#-------------------------------------------------------------------------


# Display the header
print("==================================================================")
print("Shipping Calculator")
print("==================================================================")

# Get user input
item_cost = float(input("Enter the cost of the item you ordered: "))


# Check for invalid inputs
if item_cost < 0:
    print("You must enter a positive number. Please try again.")
else:
    # Determine shipping cost based on price ranges
    if item_cost <= 29.99:
        shipping_cost = 5.95
    elif item_cost <= 49.99:
        shipping_cost = 7.95
    elif item_cost <= 74.99:
        shipping_cost = 9.95
    else:
        shipping_cost = 0.00

# Caculate the total
total_cost = item_cost + shipping_cost

#Display the results
print(f"Shipping cost:                       ${shipping_cost:.2f}")
print(f"Total cost:                          ${total_cost:.2f}")
