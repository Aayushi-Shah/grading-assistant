#----------------------------------------------------------
# Name: Emily Cutman
# E-mail Address: eac6097@psu.edu
# Class: CMPSC 101
# Homework #3
# Due Date: 10/3/2025
# Brief Project Description
#----------------------------------------------------------

print('================================================================')
print('Shipping Calculator')
print('================================================================')

# Enter the cost of the item. 

cost = float(input("Enter the cost of the item ordered: "))

if cost < 0.00:
    print('You must enter a positive number. Please try again.')
else:
    
    if cost <= 29.99:
        shipping_cost = 5.95
    elif cost <= 49.99:
        shipping_cost = 7.95 
    elif cost <= 74.99:
        shipping_cost = 9.95
    else:
        shipping_cost = 0.00

    total_cost = cost + shipping_cost

    print(f"Shipping cost:\t${shipping_cost:.2f}")
    print(f"Total cost:\t${cost+shipping_cost:.2f}")


