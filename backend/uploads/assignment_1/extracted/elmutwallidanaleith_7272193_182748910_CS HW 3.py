#----------------------------------------------------------
# Name: Dana El-Mutwalli
# E-mail Address: dle5277
# Class: CMPSC 101
# Project # HW 3
# Due Date: 10/3/25
# Brief Project Description: A program that calculates the shipping and total cost
#----------------------------------------------------------
print('====================================================')
print('Shipping Calculator')
print('====================================================')
itemcost=float(input('Enter the cost of the item ordered:'))
if itemcost>0 and itemcost<29.99:
    shipcost=5.95
elif itemcost<0:
    print('You must enter a positive number. Please try again.')
elif itemcost>30.00 and itemcost<49.99:
    shipcost=7.95
elif itemcost>50.00 and itemcost<74.00:
    shipcost=9.95
else: shipcost=0.00

print('Shipping Cost:',shipcost)
totalcost=itemcost+shipcost
print('Total Cost:',totalcost)
