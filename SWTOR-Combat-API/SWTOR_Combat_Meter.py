# SWTOR_Combat_Data.py
# This program has been written to parse data from SWTOR combat logs
# and report it in a readable manner

##Development notes --------------------------------------------------------------------------------
##
## Putting notes for progress in here.
## 
## Written 04FEB12
##
## -------------------------------------------------------------------------------------------------

from graphics import *
from datetime import datetime

def create_window(win_name):
    win = GraphWin(win_name,500,500)
    win.setCoords(0,0,100,100)
    win.setBackground("white")
    return win

def get_date():
    current  = datetime.now()
    broken = current.strftime("%y-%m-%d-%H-%M-%S")
    arrayed = broken.split('-')

    for i in range(len(arrayed)):
        arrayed[i] = int(arrayed[i])
    
    whole = (arrayed[0] * 10000 + arrayed[1] * 100 + arrayed[2]) + ((arrayed[3] * 3600 + arrayed[4] * 60 + arrayed[5]) / 100000)
    return whole
    
def format_stamp(stamp):
    # '03/17/2012 12:59:57'
    arrayed = []
    arrayed.append(int(stamp[8:10]))
    arrayed.append(int(stamp[0:2]))
    arrayed.append(int(stamp[3:5]))
    arrayed.append(int(stamp[11:13]))
    arrayed.append(int(stamp[14:16]))
    arrayed.append(int(stamp[17:19]))
    whole = (arrayed[0] * 10000 + arrayed[1] * 100 + arrayed[2]) + ((arrayed[3] * 3600 + arrayed[4] * 60 + arrayed[5]) / 100000)
    return whole


def get_data(filename):
    stamps = []
    attackers = []
    defenders = []
    attacks = []
    actions = []
    results = []
    infile = open(filename,"r")
    for line in infile:
        if line != '':
            whole_line = line.strip().split(']')
            if len(whole_line) == 6:
                # timestamp = format_stamp(whole_line[0][1:])
                stamps.append(format_stamp(whole_line[0][1:]))
                if whole_line[1][-1] == '}':
                    attackers.append(whole_line[1][2:-18].strip('@'))
                else:
                    attackers.append(whole_line[1][2:].strip('@'))
                if whole_line[2][-1] == '}':
                    defenders.append(whole_line[2][2:-18].strip('@'))
                else:
                    defenders.append(whole_line[2][2:].strip('@'))
                attacks.append(whole_line[3][2:-18])
                if whole_line[4][2:7] == 'Event':
                    actions.append(whole_line[4][27:-18].strip())
                elif whole_line[4][2:7] == 'Apply':
                    actions.append(whole_line[4][33:-18].strip())
                elif whole_line[4][2:7] == 'Abili':
                    actions.append('Ability')
                else:
                    actions.append('Generic')
                    # actions.append(whole_line[4][2:-18])
                damage = "0"
                for i in range(len(whole_line[5])):
                    if whole_line[5][i] == '<':
                        i = i + 1
                        while whole_line[5][i] != '>':
                            damage = damage + whole_line[5][i]
                            i = i + 1
                results.append(int(damage))
                
    return stamps,attackers,defenders,attacks,actions,results

def get_userdata(win): # Get Character name and file path
    banner = Text(Point(50,80),"Welcome to Voodoo's Combat Data Meter")
    nametext = Text(Point(20,60),"Character name: ")
    filename_text = Text(Point(20,40),"File name/path: ")
    filename_exam = Text(Point(50,30),"hmm") # Ex: C:\Users\Voodoo\Documents\Star Wars - The Old Republic\CombatLogs\logname.txt
    user_entry = Entry(Point(68,60),30)
    filename_entry = Entry(Point(68,40),30)
    banner.draw(win)
    nametext.draw(win)
    filename_text.draw(win)
    filename_exam.draw(win)
    user_entry.draw(win)
    filename_entry.draw(win)

    # Send to left_right to see if they put in data or leave program
    path = left_right(win,"Submit","Back")
    banner.undraw()
    nametext.undraw()
    filename_text.undraw()
    filename_exam.undraw()
    user_entry.undraw()
    filename_entry.undraw()
    if path:
        toon = user_entry.getText()
        filename = filename_entry.getText()
        return toon,filename,True
    else:
        return "","",False
        

def left_right(win,left,right): # Looks at result of clicking on either left or right button
    submit = Rectangle(Point(15,10),Point(35,20))
    submit.draw(win)
    submit_text = Text(Point(25,15),left)
    submit_text.draw(win)
    back = Rectangle(Point(65,10),Point(85,20))
    back.draw(win)
    back_text = Text(Point(75,15),right)
    back_text.draw(win)

    clicked = False
    while not clicked:
        p = win.getMouse()
        if button_clicked(Point(15,10),Point(35,20),p):
            button = True
            clicked = True
        if button_clicked(Point(65,10),Point(85,20),p):
            button = False
            clicked = True

    submit.undraw()
    submit_text.undraw()
    back.undraw()
    back_text.undraw()
    return button

def button_clicked(p1,p2,p):
    big_x = max([p1.getX(),p2.getX()])
    small_x = min([p1.getX(),p2.getX()])
    big_y = max([p1.getY(),p2.getY()])
    small_y = min([p1.getY(),p2.getY()])
    x = p.getX()
    y = p.getY()
    if y <= big_y and y >= small_y and x <= big_x and x >= small_x:
        return True
    return False   

def get_damage(start,stop,name):
    damage = 0
    stamps,attackers,defenders,attacks,actions,results = get_data(filename)
    
    

def main_menu(win): # Select from different options, currently none !!!!!!!!!!!!!!
    but1 = Rectangle(Point(35,75),Point(65,85))
    but1.draw(win)
    buttext1 = Text(Point(50,80),"Damage Done")
    buttext1.draw(win)
    but2 = Rectangle(Point(35,55),Point(65,65))
    but2.draw(win)
    buttext2 = Text(Point(50,60),"Healing Done")
    buttext2.draw(win)
    but3 = Rectangle(Point(35,35),Point(65,45))
    but3.draw(win)
    buttext3 = Text(Point(50,40),"DPS Meter")
    buttext3.draw(win)
    but4 = Rectangle(Point(35,15),Point(65,25))
    but4.draw(win)
    buttext4 = Text(Point(50,20),"Exit")
    buttext4.draw(win)
    choice = 0
    while choice == 0:
        p = win.getMouse()
        if button_clicked(Point(40,75),Point(60,85),p):
            choice = 1
        if button_clicked(Point(40,55),Point(60,65),p):
            choice = 2
        if button_clicked(Point(40,35),Point(60,45),p):
            choice = 3
        if button_clicked(Point(40,15),Point(60,25),p):
            choice = 4

    but1.undraw()
    buttext1.undraw()
    but2.undraw()
    buttext2.undraw()
    but3.undraw()
    buttext3.undraw()
    but4.undraw()
    buttext4.undraw()
    return choice

def damage(win,name,filename):
    instruct1 = Text(Point(50,70),"Press 'Start' to begin tracking")
    instruct2 = Text(Point(50,60),"Press 'Stop' to end tracking")
    instruct3 = Text(Point(50,50),"Then results will be displayed")
    instruct4 = Text(Point(50,40),"Note: ONLY TRACKS LAST COMBAT PERIOD")
    instruct1.draw(win)
    instruct2.draw(win)
    instruct3.draw(win)
    instruct4.draw(win)
    exiting = False
    while not exiting:
        button = left_right(win,"Start","Stop")

        if button:
            # start_time = get_date() TEMP TO TEST FUNCTIONALITY
            start_time = 120317.46675
            instruct5 = Text(Point(50,30),"-----Tracking has begun-----")
            instruct5.draw(win)
        if not button:
            # stop_time = get_date()
            stop_time = 120317.468
            exiting = True

    instruct1.undraw()
    instruct2.undraw()
    instruct3.undraw()
    instruct4.undraw()
    instruct5.undraw()
    
    display_damage(start_time,stop_time,name,filename)
    
    return
    
def display_damage(start_time,stop_time,name,filename):
    win = create_window("Damage Done")
    stamps,attackers,defenders,attacks,actions,results = get_data(filename)
    for i in range(len(stamps)):
        if actions[i] == "EnterCombat" and stamps[i] > start_time and stamps[i] < stop_time:
            start_time = stamps[i]
        if actions[i] == "ExitCombat" and stamps[i] > start_time and stamps[i] < stop_time:
            stop_time = stamps[i]

    total = 0
    enemies = enemy_list(filename,name)
    for j in range(len(stamps)):
        if start_time <= stamps[j] and stop_time >= stamps[j]:
            if attackers[j] == name and actions[j] == "Damage":
                for k in range(len(enemies)):
                    if enemies[k][0] == defenders[j]:
                        enemies[k][1] = enemies[k][1] + results[j]

    win.getMouse()
    y = 90
    for l in range(1,len(enemies)):
        Text(Point(40,y),enemies[l][0]).draw(win)
        Text(Point(80,y),enemies[l][1]).draw(win)
        y = y - 10
        if y == 10:
            break


    Text(Point(50,10),"Click anywhere to close").draw(win)
    win.getMouse()
    win.close()
    return


def enemy_list(filename,name):
    stamps,attackers,defenders,attacks,actions,results = get_data(filename)
    enemies = [["Enemy",0]]
    for i in range(len(defenders)):
        flagged = True
        for j in range(len(enemies)):
            if defenders[i] == enemies[j][0] or defenders[i] == name:
                flagged = False
        if flagged:
            enemies.append([defenders[i],0])
    return enemies
        


def main():
    win = create_window("SWTOR Combat Data")
    name,filename,running = get_userdata(win)
    while running: #Execute the main choice loop
        choice = main_menu(win)
        if choice == 1: # Damage
            damage(win,name,filename)
        if choice == 2: # Healing
            print("")
        if choice == 3: # Meter
            print("")
        if choice == 4: # Exit
            running = False
        
    
    #stamps,attackers,defenders,attacks,actions,results = get_data(filename)
    #for i in range(len(stamps)):
        #print("{0:<15}{1:30}{2:30}{3:25}{4:25}{5:5}".format(stamps[i],attackers[i],defenders[i],attacks[i],actions[i],results[i]))

    win.close()

main()

