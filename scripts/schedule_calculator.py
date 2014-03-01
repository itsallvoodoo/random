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


# ----------------------------------------------------------------------------------------
# Function Name: printTable()
# Parameters:    None
# Returns:       None
# Description:   Prints the full table of all matches
# ----------------------------------------------------------------------------------------
def printTable():
	for y in range(numOfMatches):
		for x in range(6):
			print(schedule[x][y]),
		print " ---- Match " + str(y+1)


def assignToSchedule():
	position = 0

	for y in range(numOfMatches):
		for x in range(6):
			if position == numOfTeams:
				position = 0
			else:
				position += 1
			print "Pushing"
			schedule[x][y] = teams[position]



# ----------------------------------------------------------------------------------------
# Function Name: main()
# Parameters:    None
# Returns:       None
# Description:   This is the main method
# ----------------------------------------------------------------------------------------
if __name__ == '__main__':
		assignToSchedule()
		printTable()
