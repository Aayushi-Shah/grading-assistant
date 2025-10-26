#----------------------------------------------------------
# Name: Ryan Yao
# E-mail Address: rqy5184@psu.edu
# Class: CMPSC 101
# Project #3
# Due Date: Oct 3
# Brief Project Description
# Write a program that would display the cost of item and shipping cost
#----------------------------------------------------------

#cost of an item
item=float(input("Enter the cost of item ordered:"))

#shipping
if item < 0:
    print("You must enter a positive number. Please try again.")
else:
    if item >= 0 and item <= 29.99:
        shipping=5.95
    elif item >= 30 and item <= 49.99:
        shipping=7.95
    elif item >= 50 and item <= 74.99:
        shipping=9.95
    elif item >= 75:
        shipping=0
    print(f"Shipping Cost:\t${shipping:.2f}")
    print(f"Total Cost:\t${item+shipping:.2f}")
