#----------------------------------------------------------
# Name:Wayne Brown
# E-mail Address:wab5315@psu.edu
# Class: CMPSC 101
# Project #3
# Due Date:10/3/2025
# Brief Project Description
#----------------------------------------------------------

print("===============================================================",
      '\n', "Shipping Calculator",'\n',
      "===============================================================")

cost=float(input("Enter the cost of the item ordered:"))
if cost < 0:
           print("You must enter a positive number. Please try again.")
elif cost <= 29.99:
                Shipping=5.95
                print("Shipping Cost:",'\t', "$5.95",'\n','\n',
                      f"Total cost:\t${cost+Shipping:.2f}")
elif cost <= 49.99:
                Shipping=7.95
                print("Shipping Cost:",'\t', "$7.95",'\n','\n',
                      f"Total cost:\t${cost+Shipping:.2f}")
elif cost <= 74.99:
                Shipping=9.95
                print("Shipping Cost:",'\t', "$9.95",'\n','\n',
                      f"Total cost:\t${cost+Shipping:.2f}")
else: #cost>=75
    Shipping=0
    print("Shipping Cost:",'\t', "$0",'\n','\n',
          f"Total cost:\t${cost+Shipping:.2f}")

