#---------------
#Chinedu Ojielo
#cao5427@psu.edu
#CMPSC 101
#Homework 3
#October 3rd,2025
#---------------

#Title of the program
print('========================')
print('Shipping Calculator')
print('========================')

#Asking the User for the cost of item
item_cost= float(input("Enter the cost of an item ordered: "))

#Determine the cost of an item and its cost to ship
if item_cost <0:
      print("Error: You must enter a positive number. Please try again.")
else:
    if item_cost<= 29.99:
      shipping= 5.95
    elif item_cost<=49.99:
       shipping= 7.95
    elif item_cost<=74.99:
        shipping= 9.95
    elif item_cost>=75.00:
       shipping= 0.00

#Calculate the total
total= item_cost + shipping
print(f"Shipping Costs: ${shipping:.2f}")
print(f"Total Cost: ${total:.2f}")
