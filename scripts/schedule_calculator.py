# Quick utility to test speed of calculating a list

import time

# Global Variables
teams = []
numOfTeams = 67
numOfMatches = numOfTeams

# Make numOfMatches divisible by 6 one greater than number of teams
while (numOfMatches % 6 != 0):
	numOfMatches += 1

schedule = [[0 for x in xrange(numOfMatches)] for x in xrange(6)] 

# Build array of teams
for x in range(numOfTeams):
	teams.append(x+1)

def printTable():
	for y in range(numOfMatches):
		for x in range(6):
			print(schedule[x][y]),
		print " ---- Match " + str(y+1)



# ----------------------------------------------------------------------------------------
# Function Name: main()
# Parameters:    None
# Returns:       None
# Description:   This is the main method
# ----------------------------------------------------------------------------------------
if __name__ == '__main__':
		printTable()