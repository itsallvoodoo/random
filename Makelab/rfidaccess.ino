/* 
Name:	rfidaccess.ino
Desc:	Grant access to building using RFID tags, which trigger a relay that cycles the door lock.
Date:	6/14/2012
Auth:	Originally written by Makelab Charleston member James Armstrong, updated and maintained by Chad Hobbs

Notes:
To use ethernet to tweet or for other services set USE_ETHERNET to 1

Need to do:
  Cache id's in memory from server
  Add the tamper detection code for the outside unit. If the OUTSIDE_LED reads high as an input it is ok.
  
*/
 
#include <Time.h> 
#include <SPI.h>
#include <Ethernet.h>
#include <EthernetUdp.h>

// Enter a MAC address and IP address for your controller below.
// The IP address will be dependent on your local network:
byte mac[] = { 0x90, 0xa2, 0xda, 0x00, 0xcf, 0xc2 };
IPAddress timeServer(192, 43, 244, 18); // time.nist.gov NTP server

#define USE_ETHERNET 0

#define OPEN 0
#define CLOSED 1

// Variables will change:
int ledState = LOW;             // ledState used to set the LED
long previousMillis = 0;        // will store last time LED was updated
long accessMillis = 0;        // will store last time LED was updated
long ptimerMillis = 0;

const int NTP_PACKET_SIZE= 48; // NTP time stamp is in the first 48 bytes of the message

byte packetBuffer[ NTP_PACKET_SIZE]; //buffer to hold incoming and outgoing packets 

// A UDP instance to let us send and receive packets over UDP
EthernetUDP Udp;

time_t prevDisplay = 0; // when the digital clock was displayed
const  long timeZoneOffset = 0L; // set this to the offset in seconds to your local time;

int  val = 0; 
char code[10]; 
int bytesread = 0;
int haveEth = 0;
String msg1;
int doorState;
byte overrideFlag = 0;
byte tamper;

const char rfids[][11] = {REMOVED}; // MUST ADD BACK IN BEFORE UPLOADING SKETCH
// 0 In Envelope (Special access. First card in list will keep door unlocked for 2 hours. Using this card will unlock the door and not lock for 2 hours or until another card is used)
// 1 Jarick
// 2 Chad
// 3 David
// 4 Dbax

#define MAXDOOR_OPEN 15000
#define MAXDOOR_OPEN_OVERRIDE 3600L * 1000L //2 hours for special card to keep too unlocked (card 1)

#define DOORRELAY A0
#define LED_GREEN A1
#define LED_RED   A2
#define LED_YELLOW A3
#define DOOR_SWITCH A4
#define RFID_ENABLE 2
#define OUTSIDE_BUZZER 22
#define OUTSIDE_LED 24


// the follow variables is a long because the time, measured in miliseconds,
// will quickly become a bigger number than can be stored in an int.
long interval = 1000;           // interval at which to blink (milliseconds)

EthernetClient client;


void setup() {
  msg1 = String();

  pinMode(DOORRELAY, OUTPUT);      //A0 = Door Relay
  digitalWrite(OUTSIDE_LED, LOW);  //Lock
  
  Serial.begin(9600); 
  Serial2.begin(2400); // RFID reader SOUT pin connected to Serial RX pin at 2400bps 
  pinMode(RFID_ENABLE, OUTPUT);   // Set digital pin 2 as OUTPUT to connect it to the RFID /ENABLE pin 
  digitalWrite(RFID_ENABLE, LOW);                  // Activate the RFID reader
  Serial.println("Starting Up...");
  
  // set the digital pin as output:

  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_YELLOW, OUTPUT);
//  digitalWrite(DOOR_SWITCH, HIGH);  //Enable Pullup  
  pinMode(DOOR_SWITCH, INPUT);      //Make A4 an Input for Door Switch
  pinMode(OUTSIDE_LED, OUTPUT);
  pinMode(OUTSIDE_BUZZER, OUTPUT); 
  
  digitalWrite(OUTSIDE_LED, LOW);
  digitalWrite(OUTSIDE_BUZZER, LOW);
  delay(1000);
  digitalWrite(OUTSIDE_BUZZER, HIGH);
  delay(1000);
  digitalWrite(OUTSIDE_BUZZER, LOW);
  delay(1000);
  digitalWrite(OUTSIDE_BUZZER, HIGH);
  digitalWrite(OUTSIDE_LED, HIGH);
  
  if (digitalRead(DOOR_SWITCH)) 
    doorState = OPEN;
  else 
    doorState = CLOSED;
    
  Serial.println("Configuring Ethernet...");
  if (USE_ETHERNET == 0) {
    haveEth = 0;
  } else
  if (Ethernet.begin(mac) == 0) {
    Serial.println("Failed to configure Ethernet using DHCP");
    // no point in carrying on, so do nothing forevermore:
  } else {
  haveEth = 1;
  // print your local IP address:
  Serial.print("My IP address: ");
  for (byte thisByte = 0; thisByte < 4; thisByte++) {
    // print the value of each byte of the IP address:
    Serial.print(Ethernet.localIP()[thisByte], DEC);
    Serial.print("."); 
    }
  Serial.println("waiting for sync");
//  setSyncProvider(getNtpTime);
//  while(timeStatus()== timeNotSet)   
//     ; // wait until the time is set by the sync provider
  }
  Serial.println();   
}

// send an NTP request to the time server at the given address 
unsigned long sendNTPpacket(IPAddress& address)
{
  // set all bytes in the buffer to 0
  memset(packetBuffer, 0, NTP_PACKET_SIZE); 
  // Initialize values needed to form NTP request
  // (see URL above for details on the packets)
  packetBuffer[0] = 0b11100011;   // LI, Version, Mode
  packetBuffer[1] = 0;     // Stratum, or type of clock
  packetBuffer[2] = 6;     // Polling Interval
  packetBuffer[3] = 0xEC;  // Peer Clock Precision
  // 8 bytes of zero for Root Delay & Root Dispersion
  packetBuffer[12]  = 49; 
  packetBuffer[13]  = 0x4E;
  packetBuffer[14]  = 49;
  packetBuffer[15]  = 52;

  // all NTP fields have been given values, now
  // you can send a packet requesting a timestamp: 		   
  Udp.beginPacket(address, 123); //NTP requests are to port 123
  Udp.write(packetBuffer,NTP_PACKET_SIZE);
  Udp.endPacket(); 
}

void digitalClockDisplay(){
  // digital clock display of the time
  Serial.print(hour());
  printDigits(minute());
  printDigits(second());
  Serial.print(" ");
  Serial.print(month());
  Serial.print("/");  
  Serial.print(day());
  Serial.print("/");
  Serial.print(year()); 
  Serial.println(); 
}

void printDigits(int digits){
  // utility function for digital clock display: prints preceding colon and leading 0
  Serial.print(":");
  if(digits < 10)
    Serial.print('0');
  Serial.print(digits);
}

unsigned long getNtpTime()
{
  sendNTPpacket(timeServer); // send an NTP packet to a time server

    // wait to see if a reply is available
  delay(1000);  
  if ( Udp.parsePacket() ) {  
    // We've received a packet, read the data from it
    Udp.read(packetBuffer,NTP_PACKET_SIZE);  // read the packet into the buffer

    //the timestamp starts at byte 40 of the received packet and is four bytes,
    // or two words, long. First, esxtract the two words:

    unsigned long highWord = word(packetBuffer[40], packetBuffer[41]);
    unsigned long lowWord = word(packetBuffer[42], packetBuffer[43]);  
    // combine the four bytes (two words) into a long integer
    // this is NTP time (seconds since Jan 1 1900):
    unsigned long secsSince1900 = highWord << 16 | lowWord;  
    Serial.print("Seconds since Jan 1 1900 = " );
    Serial.println(secsSince1900);               

    // now convert NTP time into everyday time:
    Serial.print("Unix time = ");
    // Unix time starts on Jan 1 1970. In seconds, that's 2208988800:
    const unsigned long seventyYears = 2208988800UL;     
    // subtract seventy years:
    return secsSince1900 - seventyYears; 
  }
  return 0;  
}

byte check_rfid(char *id) {
  int idx;
  
  idx = 0;
  while (rfids[idx][0]) {
    if (strcmp(id, &rfids[idx][0])==0) {
      return(idx+1);  
    }
    idx++;
  }
  return(0);
}

void loop() {
  byte prevLED;
  // here is where you'd put code that needs to be running all the time.

  // check to see if it's time to blink the LED; that is, if the 
  // difference between the current time and last time you blinked 
  // the LED is bigger than the interval at which you want to 
  // blink the LED.
  if(Serial2.available() > 0) {          // if data available from reader 
    if((val = Serial2.read()) == 10) {   // check for header 
      bytesread = 0; 
      while(bytesread<10) {              // read 10 digit code 
        if( Serial2.available() > 0) { 
          val = Serial2.read(); 
          if((val == 10)||(val == 13)) { // if header or stop bytes before the 10 digit reading 
            break;                       // stop reading 
          } 
          code[bytesread] = val;         // add the digit           
          bytesread++;                   // ready to read next digit  
        } 
      } 
      if(bytesread == 10) {              // if 10 digit read is complete 
        Serial.print("TAG code is: ");   // possibly a good TAG 
        Serial.println(code);            // print the TAG code 
      } 
      bytesread = 0; 
      digitalWrite(RFID_ENABLE, HIGH);                  // deactivate the RFID reader for a moment so it will not flood

// Need to probably read multiple rfids until two in a row match here

      if ((val=check_rfid(code)) > 0 ) {
        digitalWrite(LED_GREEN, HIGH);                  // led on      
        digitalWrite(OUTSIDE_LED, LOW);                  // led on    
        digitalWrite(OUTSIDE_BUZZER, LOW);  
        digitalWrite(DOORRELAY, HIGH);                  // unlock door
        if (val == 1) {
          delay(250);
          digitalWrite(OUTSIDE_BUZZER, HIGH);  
          delay(75);
          digitalWrite(OUTSIDE_BUZZER, LOW);  
          delay(250);
          digitalWrite(OUTSIDE_BUZZER, HIGH);  
          accessMillis = MAXDOOR_OPEN_OVERRIDE;  //Set the unlock time to the special unlock time
          overrideFlag = 1;  //Flag to ignore door open / close and keep door unlocked
        } else { 
          overrideFlag = 0;
          delay(50);
          digitalWrite(OUTSIDE_BUZZER, HIGH);  
          delay(100);
          digitalWrite(OUTSIDE_BUZZER, LOW);  
          accessMillis = MAXDOOR_OPEN;
        } 
        doorState = 2; //force invalid door state so it will read it even if open 
        msg1 = month()+"/"+day()+" "+hour()+":"+minute()+String(" Valid TAG Scanned: ")+String(code);    
      } else  {
        msg1 = month()+"/"+day()+" "+hour()+":"+minute()+String(" Invalid TAG Scanned: ")+String(code);        
// Invalid Read
        digitalWrite(OUTSIDE_BUZZER, LOW);
        accessMillis = 2000;  //Buzz for 2secs if invalid  
      }
      Serial.println(msg1);
      delay(1500);                       // wait for a bit 
      digitalWrite(2, LOW);                  // Activate the RFID reader
      digitalWrite(LED_GREEN, LOW);                  // deactivate the RFID reader for a moment so it will not flood            
    }
  } 
  
  unsigned long currentMillis = millis();

  if ((digitalRead(DOOR_SWITCH)) && (doorState!=OPEN)) {
    Serial.println("Door Open");
    digitalWrite(LED_YELLOW, HIGH);
    if (!overrideFlag) { 
      digitalWrite(DOORRELAY, LOW);   
      digitalWrite(OUTSIDE_LED, HIGH);
      digitalWrite(OUTSIDE_BUZZER, HIGH);
    } 
    Serial.println(String("Door Opened")+month()+"/"+day()+" "+hour()+":"+minute());
    doorState = OPEN;  
  } else
  if ((digitalRead(DOOR_SWITCH) == 0) && doorState!=CLOSED) { 
    Serial.println("Door Closed");
    digitalWrite(LED_YELLOW, LOW);
    doorState = CLOSED; 
    Serial.println(String("Door Closed")+month()+"/"+day()+" "+hour()+":"+minute());    
  }
 
  if(currentMillis - ptimerMillis > 10) {  //Check timers every 10ms
    // save the last time
    ptimerMillis = currentMillis;  
    if (accessMillis) {
      accessMillis -= 10;  //Timers stored in ms so dec by 10ms
      if (accessMillis <= 0) {
        accessMillis = 0;
        overrideFlag = 0;  //Clear special override flag
        digitalWrite(DOORRELAY, LOW);  //Lock door
        digitalWrite(OUTSIDE_LED, HIGH);
        digitalWrite(OUTSIDE_BUZZER, HIGH);        
      }
    }
  } 
 
  if(currentMillis - previousMillis > interval) {  //Blink every 1000ms
    // save the last time you blinked the LED 
    previousMillis = currentMillis;   
    
    //Check for tamper outside by setting the OUTSIDE_LED to an input and reading the value.
    //It should return a high if good and low if lid or unit has been removed (may need to add 100k pulldown
    //on the Arduino pin.
    
#if 0 //Untested code   
    prevLED = digitalRead(OUTSIDE_LED);
    pinMode(OUTSIDE_LED, INPUT);  //Set led pin to input
    digitalWrite(OUTSIDE_LED, LOW);  //turn off pullup if the led was set off (high) while output
    
    //do we need a delay here?
    tamper = digitalRead(OUTSIDE_LED);
    digitalWrite(OUTSIDE_LED, prevLED);  //set led output back to previous state
    pinMode(OUTSIDE_LED, OUTPUT); //Set led pin back to an output
    if (tamper == 0) { //If low then tampered with (may need to add 100k pulldown on pin 24)
      //Do something
    }
#endif
    //End of tamper detect

    // if the LED is off turn it on and vice-versa:
    if (ledState == LOW)
      ledState = HIGH;
    else
      ledState = LOW;

    if (overrideFlag) {
      digitalWrite(OUTSIDE_LED, !ledState);  //Blink outside light if door special unlock card used
    }

    // set the LED with the ledState of the variable:
//    digitalWrite(A1, !ledState);
//    digitalWrite(A1, ledState);
    digitalWrite(LED_RED, !ledState);
  }
  
  if( now() != prevDisplay) //update the display only if the time has changed
  {
    prevDisplay = now();
    digitalClockDisplay();  
  }
}

