#----------------------------------------------------------
# Name: Eleazar Oliva
# E-mail Address:EJO5402@PSU.EDU
# Class: CMPSC 101
# Project # Homework 3
# Due Date: 10/3/2025
# Brief Project Description: program that asks the user to enter the cost of an item then displays the shipping cost and the total cost
#----------------------------------------------------------

print(f'===============================================================\n Shipping Calculator \n\
===============================================================')
Shipping1=5.95
Shipping2=7.95
Shipping3=9.95
Shipping4=0.00

Cost_of_an_item1=29.99
Cost_of_an_item2=49.99
Cost_of_an_item3=74.99

Cost_of_Item=float(input('Enter the cost of the item ordered:'))

Total_Cost_1 = Cost_of_Item + Shipping1
Total_Cost_2 = Cost_of_Item + Shipping2   
Total_Cost_3 = Cost_of_Item + Shipping3
Total_Cost_4 = Cost_of_Item + Shipping4 

if Cost_of_Item<=0:
     print('You must enter a postive number. Please try again.')
elif Cost_of_Item<=Cost_of_an_item1 and Cost_of_Item>= 0:
     print(f'\nShipping cost: \t ${Shipping1:,.2f} \n\nTotal cost:  \t ${Total_Cost_1:,.2f}')
elif Cost_of_Item<=Cost_of_an_item2 and Cost_of_Item>=Cost_of_an_item1:
      print(f'\nShipping cost: \t ${Shipping2:,.2f} \n\nTotal cost: \t ${Total_Cost_2:,.2f}')
elif Cost_of_Item<=Cost_of_an_item3 and Cost_of_Item>=Cost_of_an_item1:
      print(f'\nShipping cost: \t ${Shipping3:,.2f} \n\nTotal cost: \t ${Total_Cost_3:,.2f}')
elif Cost_of_Item>=Cost_of_an_item3:
      print(f'\nShipping cost: \t ${Shipping4:,.2f} \n\nTotal cost: \t ${Total_Cost_4:,.2f}')
