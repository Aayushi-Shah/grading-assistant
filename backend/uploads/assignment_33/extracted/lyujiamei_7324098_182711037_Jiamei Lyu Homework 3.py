#----------------------------------------------------------
#Name:Jiamei.Lyu
#E-mail Address:jzl7123@psu.edu
#Class:CMPSC 101
#project# Homework3
#Due Date:Friday,October3,2025
#Brief Project Description:Program calculates shipping cost
#and total cost
#----------------------------------------------------------
print('==============================================================='
      '\nShipping Calculator'
      '\n===============================================================')
cost=float(input('Enter the cost of the item ordered:'))
if cost<0:
 print('You must enter a positive number. Please try again.')
if 0<=cost<=29.99:
    shipping=5.95
elif 30.00<=cost<=49.99:
    shipping=7.95
elif 50.00<=cost<=74.99:
    shipping=9.95
else:
    shipping=0.00
total_cost= cost+shipping
if 0<=cost:
    print(f'shipping cost:\t${shipping:.2f}'
      f'\nTotal cost:\t${total_cost:.2f}')
