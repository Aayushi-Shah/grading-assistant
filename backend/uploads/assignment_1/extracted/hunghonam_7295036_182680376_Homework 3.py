#----------------------------------------------------------
# Name:Ho Nam, Hung
# E-mail Address: hqh5473@psu.edu
# Class: CMPSC 101
# Project # Homework 3
# Due Date: 03/10/2025
# Shipping Calculator
#----------------------------------------------------------
#Enter the date into Shipping Calculator
print('===============================================================')
print('Shipping Calculator')
print('===============================================================')
Cost=float(input('Enter the cost of the item ordered:'))

#The shippomg cost of the items.
if (Cost < 0):
    ShippingCost=0
    print('You must enter a positive number.Please try again.')
else:
    if (Cost >= 0 and Cost <= 29.99):
        ShippingCost=5.95
        print(f'Shipping cost:\t\t${ShippingCost}')
    else:
        if (Cost >= 30.00 and Cost <= 49.99):
            ShippingCost=7.95
            print(f'Shipping cost:\t\t${ShippingCost}')
        else:
            if (Cost >= 50.00 and Cost <= 74.99):
                ShippingCost=9.95
                print(f'Shipping cost:\t\t${ShippingCost}')
            else:
                if (Cost >= 75):
                    ShippingCost=0
                    print(f'Shipping cost:\t\t${ShippingCost}')
#Calculate
TotalCost=Cost+ShippingCost
if (TotalCost > 0):
    print(f'Total cost:\t\t${TotalCost}')
