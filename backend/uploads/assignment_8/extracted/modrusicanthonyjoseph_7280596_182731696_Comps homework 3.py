# Name: Anthony Modrusic
# E-mail Address:
# Class: CMPSC 101
# Project #
# Due Date:
# Brief Project Description
print(f' Please enter the price/cost of an item:')
cost_of_item = float(input())
if cost_of_item < 0:
    print(f'error put in a valid price')
elif cost_of_item < 30.00:
    total_cost = cost_of_item + 5.95
    total_cost = round(total_cost, 2)
    print(f'Your Shipping Cost : {5.95} and your Total Cost: {total_cost}.')
elif cost_of_item < 50:
    total_cost = cost_of_item + 7.95
    total_cost = round(total_cost, 2)
    print(f'Your Shipping Cost : {7.95} and your Total Cost: {total_cost}.')
elif cost_of_item < 75:
    total_cost = cost_of_item + 9.95
    total_cost = round(total_cost, 2)
    print(f'Your Shipping Cost : {9.95} and your Total Cost: {total_cost}.')
else:
    print(f'your shipping is free')
