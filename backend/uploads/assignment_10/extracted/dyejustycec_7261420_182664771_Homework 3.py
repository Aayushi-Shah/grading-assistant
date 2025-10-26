#
#Justyce Dye
#jcd5976@psu.edu
#CMPSC 101
#Project#3
#Due (10/03)
#Calculating the cost of an item and shipping costs.
#

print("======================================================")
print("Shipping Calculator")
print("======================================================")

costofitem=float(input("Enter the cost of the item ordered: "))

if costofitem >=0.00 and costofitem <=29.99:
    shippingcost=5.95
elif costofitem >=30.00 and costofitem <=49.99:
    shippingcost=7.95
elif costofitem >=50.00 and costofitem <=74.99:
    shippingcost=9.95
else:
    shippingcost=0.00

total=shippingcost+costofitem

if costofitem < 0.00:
    print("You must enter a positive number. Please try again.")
else:
    print(f"Shipping cost:\t ${shippingcost:.2f}")
    print(f"Total cost:\t ${total:.2f}")
