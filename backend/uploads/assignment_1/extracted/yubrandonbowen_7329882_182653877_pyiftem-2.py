
#-----------------------------------
    #Name:Brandon Yu
    #E-mail Address:bby5152@psu.edu
    #Class:CMPSC 101
    #Project#3
    #Due Date: 10/3/2025
    #Brief Description:#Write a program that asks the user to enter the cost of an item then displays the shipping cost and the total cost.
#If the user enters a number that’s less than zero,program should display an error message.

#-----------------------------------




print("================================\n")
print("Shipping Calculaator\n")
print("================================\n")
cost1=float(input("Enter the the cost of the item ordered: "))
print("\n")
if cost1>0:
  if cost1 <=29.99:
     print("Shipping cost:\t$5.95")
     print(f"\nTotal cost:\t${cost1+5.95}")
  elif cost1 >=30.00 and cost1 <=49.99:
      print("Shipping cost:\t$7.95")
      print(f"\nTotal cost:\t${cost1+7.95}")
  elif cost1 >=50 and cost1 <=74.99:
      print("Shipping cost:\t$9.95")
      print(f"\nTotal cost:\t${cost1+9.95}")
  elif cost1 >=75:
      print("Shipping cost:\tFREE")
      print(f"\nTotal cost:\t${cost1:.2f}")
else:
    print("You must enter a positive number. Please try again")

