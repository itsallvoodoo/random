# Ard_to_py.py
# Interface between Arduino and Python
# <Chad Hobbs>

import serial
from graphics import *

def createwin(): # Build the basic window and greet the user
    win = GraphWin("Arduino Interface",400,400)
    win.setCoords(0,0,100,100)
    win.setBackground("White")
    greet = Text(Point(50,90),"Here is Python and Arduinos together")
    greet.draw(win)
    return win
    
def draw_main(win):
    while True:
        data = get_data()
        print(data)
        draw_button(win,33,60,'red',data[0])
        draw_button(win,66,60,'blue',data[1])
        draw_square(win,33,23,data[2])
        draw_square(win,66,23,data[3])
        

def draw_button(win,X,Y,color,on):
    if on == 0:
        color = 'white'
    shape = Circle(Point(X,Y),10)
    shape.setOutline(color)
    shape.setFill(color)
    shape.draw(win)
    return

def draw_square(win,X,Y,size):
    if size > 1:
        size = size / 2
    shape = Rectangle(Point(X - size,Y - size), Point(X + size,Y + size))
    shape.setOutline("black")
    shape.setFill("black")
    shape.draw(win)
    top = Rectangle(Point(X - 21,Y + size + 1), Point(X + 21,Y + 21))
    bottom = Rectangle(Point(X - 21,Y - 21), Point(X + 21,Y - size - 1))
    left = Rectangle(Point(X - 21,Y - 21), Point(X - size - 1,Y + 21))
    right = Rectangle(Point(X + size + 1,Y - 21), Point(X + 21,Y + 21))
    top.setOutline("white")
    top.setFill("white")
    top.draw(win)
    bottom.setOutline("white")
    bottom.setFill("white")
    bottom.draw(win)
    left.setOutline("white")
    left.setFill("white")
    left.draw(win)
    right.setOutline("white")
    right.setFill("white")
    right.draw(win)
    return



def get_data():
    values = []
    ser = serial.Serial(3,9600)
    data = ser.readline()
    inter = str(data)
    inter = inter.split('-').strip(' ')
    print(inter)
    values.append(int(inter[1]))
    values.append(int(inter[2]))
    values.append(int(inter[3]))
    values.append(int(inter[4]))
    return values

def main():
    win = createwin()
    draw_main(win)

main()
