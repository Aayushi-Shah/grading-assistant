#----------------------------------------------------------
# Name: Evan Gillwood
# E-mail Address: elg5466@psu.edu
# Class: CMPSC 101
# Project # HW 3
# Due Date: 20251003
# Brief Project Description: Shipping Cost Calc
#----------------------------------------------------------
print("======================================================")
print("Shipping Calculator")
print("======================================================")
#-------------------------------------------------------------------
price = float(input("Enter cost of the item ordered: "))
if price < 0:
    print("You must enter a positive number. Please try again.")
else:
    if price <= 29.99:
        shipping = 5.95
    elif price <= 49.99:
        shipping = 7.95
    elif price <= 74.99:
        shipping = 9.95
    else:
        shipping = 0.00
total = price + shipping
#-------------------------------------------------
print("Shipping Cost: $", round(shipping, 2))
print("Total Cost: $", round(total, 2))
        
              
