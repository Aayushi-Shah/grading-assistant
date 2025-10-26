#----------------------------------------------------------
# Name: Daniel Rodkey
# E-mail Address: dwr5485@psu.edu
# Class: CMPSC 101
# Project # Homework 3
# Due Date: 10/3 at 1:25pm
# Brief Project Description
#-----------------------------------------------------------

#Display program title
print("===============================================================")
print("Shipping Calculator")
print("===============================================================")


#Ask user for the cost of the item

cost = float(input("Enter the cost of the item ordered: "))

#Check for invalid input (negative number)

if cost < 0:
    print("You must enter a positive number. Please try again.")

else:
    #Determining shipping cost based on price range
 if cost <= 29.99:
    shipping_cost = 5.95

 elif cost <= 49.99:
    shipping_cost = 7.95
 elif cost <= 74.99:
    shipping_cost = 9.95
 else:
    shipping_cost = 0.00

#Calculate total cost
total_cost = cost + shipping_cost

#Display results
print(f"Shipping Cost: ${shipping_cost:.2f}")
print(f"Total cost: ${total_cost:.2f}")


