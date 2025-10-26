#----------------------------------------------------------
# Name: Kyle Kang
# E-mail Address: kfk5724@psu.edu
# Class: CMPSC 101
# Project #3
# Due Date: 10/3
# User must enter the cost of an item and it'll display the shipping cost and calculate the total
#----------------------------------------------------------



print("Cost of item         Shipping Cost")
print("=" * 35)
print(f"{'$0.00-$29.99':<20} $5.95")
print(f"{'$30.00-$49.99':<20} $7.95")
print(f"{'$50.00-$74.99':<20} $9.95")
print(f"{'$75.00 or more':<20} Free")

print("\n" * 2)

print("Shipping Calculator")
print("=" * 20)

# enter the cost of an item
cost = float(input("Enter cost of item ordered: $"))

ship1 = 5.95
ship2 = 7.95
ship3 = 9.95

# display shipping cost and total cost, if negative, display error
if cost <  0:
    print("Error, must enter a positive number")
elif cost <= 29.99:
    print(f"Shipping Cost: $5.95")
    print(f"\nTotal Cost: ${cost + ship1:.2f}")
elif cost <= 49.99:
    print(f"Shipping Cost: $7.95")
    print(f"\nTotal Cost: ${cost + ship2:.2f}")
elif cost <= 74.99:
    print(f"Shipping Cost: $9.95")
    print(f"\nTotal Cost: ${cost + ship3:.2f}")
else:
    print(f"Shipping Cost: Free")
    print(f"\nTotal Cost: ${cost:.2f}")