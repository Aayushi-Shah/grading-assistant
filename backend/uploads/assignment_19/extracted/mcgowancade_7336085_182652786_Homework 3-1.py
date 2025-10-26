##Cade McGowan
##ckm6243@psu.edu
##CMPSC 101
##Project 3
##Due 10-3-25
##Program that takes the cost of an item and outputs the shipping and total cost of that item
print('=========================')
print('Shipping Calculator')
print('=========================')
##Find the cost of the item
cost_of_item=float(input('Cost of item ordered:'))
##If the cost of the item is less than zero than the equation will not work
if cost_of_item <=0:
    print('Please enter a positive number')
##If the cost of the item is between zero and $29.99 than the shipping will be $5.95
elif cost_of_item >0 and cost_of_item <=29.99:
    print('Shipping Cost: $5.95')
    print(f'Total Cost: ${cost_of_item+5.95}')
##If the cost of the item is between $30.00 and $49.00 than the shipping will be $7.95
elif cost_of_item >=30 and cost_of_item <=49.99:
    print('Shipping Cost: $7.95')
    print(f'Total Cost: ${cost_of_item+7.95}')
##If the cost of the item is between $50.00 and $74.99 than the shipping will be $9.95
elif cost_of_item >=50 and cost_of_item <=74.99:
    print('Shipping Cost: $9.95')
    print(f'Total Cost: ${cost_of_item+9.95}')
##If the cost of the item is more than $75.00 than shipping is free
else:
    print('Shipping is Free')
    print(f'Total Cost: ${cost_of_item}')



                  

