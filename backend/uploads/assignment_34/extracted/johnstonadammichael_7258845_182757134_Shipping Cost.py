#----------------------------------------------------------
# Name:Adam Johnston
# E-mail Address:amj6604@psu.edu
# Class: CMPSC 101
# Project #3
# Due Date:October Third
# Brief Project Description
#Write a program that asks the user to enter the cost of an item then displays
#the shipping cost and the total cost. If the user enters a number that’s less than zero,
#program should display an error message. The output should be rounded to two decimal
#places of precision.
#----------------------------------------------------------

#Display
print ('===============================================')
print ('Shipping Calculator')
print ('===============================================')

#Inputs
cost= float (input ('How much does the item cost?'))

if cost<= 0:
    print ('You must enter a positive number. Please try again.')
else:

#Shipping Costs
    if cost >= 75:
        shipping= 0
    elif cost >= 50:
        shipping= 9.95
    elif cost >= 30:
        shipping= 7.95
    elif cost > 0:
        shipping= 5.95
    #Calculations
    total= cost+shipping

    print (f'Your total before shipping is\t${cost:.2f}')
    if shipping== 0:
        print (f'Shipping Cost:\t\t\tFREE!')
    else:
        print (f'Shipping Cost:\t\t\t${shipping:.2f}')
        print (f'Total Cost:\t\t\t${total:.2f}')
