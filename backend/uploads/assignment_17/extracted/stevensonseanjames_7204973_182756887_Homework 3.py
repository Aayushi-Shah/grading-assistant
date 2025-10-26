#-----------------
#Sean Stevenson
#sjs8202@psu.edu
#CMPSC 101
#Homework 3
#10/3/25
#Cost of shipping and total cost
#-----------------

print("===============================================================")
print("Shipping Calculator")
print("===============================================================")
      
cost = float(input("Enter the cost of the item ordered: "))

if cost < 0:
    print("You must enter a positive number. Please try again.")
else:
    if cost <= 29.99:
        shipping = 5.95
    elif cost <= 49.99:
        shipping = 7.95
    elif cost <= 74.99:
        shipping = 9.95
    else:
        shipping = 0.00  
    
    total = cost + shipping
    
    print(f"Shipping cost: ${shipping:.2f}")
    print(f"Total cost: ${total:.2f}")

