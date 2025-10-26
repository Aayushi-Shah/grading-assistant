#----------------------------------------------------------
# Name: Nicholas Taylor
# E-mail Address: NLT5235@psu.edu
# Class: CMPSC 101
# Project #3
# Due Date: 10/3/25
# Shipping Cost Calculator
#----------------------------------------------------------
print('===============================================================')
print('Shipping Calculator')
print('===============================================================')
item_cost=float(input('Enter the cost of the item ordered: '))
if 0.00 < item_cost < 29.99:
    shipping_cost=5.95
elif 30.00 < item_cost < 49.99:
    shipping_cost=7.95
elif 50.00 < item_cost < 74.99:
    shipping_cost=9.95
elif item_cost > 75.00:
    shipping_cost=0
else:
    print('You must enter a positive number. Please try again.')
if item_cost > 0:
    print(f'Shipping cost:\t ${shipping_cost}')
    print(f'Total cost:\t ${item_cost + shipping_cost}')