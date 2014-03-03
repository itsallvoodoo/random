#!/usr/bin/env python2.7

# name:     schedule_calculator.py
# author:   Chad Hobbs
# created:  140228
# last edit: 140302
#
# description: Quick utility to test speed of generating a list that minimizes sets with the same numbers.

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


# ----------------------------------------------------------------------------------------
# Function Name: printTeam()
# Parameters:    None
# Returns:       None
# Description:   This function prints out a given team schedule
# ----------------------------------------------------------------------------------------
def printTeam(team):
	for y in range(numOfMatches):
		for x in range(6):
			if schedule[x][y] == team:
				for z in range(6):
					print(schedule[z][y]),
				print ""


# ----------------------------------------------------------------------------------------
# Function Name: assignToSchedule()
# Parameters:    None
# Returns:       None
# Description:   This function puts all the numbers into the prebuilt array of sets
# ----------------------------------------------------------------------------------------
def assignToSchedule():
	position = 0

	for x in range(6):
		for y in range(numOfMatches):
			schedule[x][y] = teams[position]
			if position == (numOfTeams -1):
				position = 0
			else:
				position += 1
			


# ----------------------------------------------------------------------------------------
# Function Name: main()
# Parameters:    None
# Returns:       None
# Description:   This is the main method
# ----------------------------------------------------------------------------------------
if __name__ == '__main__':
		assignToSchedule()
		printTable()
		printTeam(1)