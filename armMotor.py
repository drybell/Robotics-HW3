import pca9685 as p
import time
import argparse 
import os

try: 
	pwm = p.PCA9685(0x40, debug=False)
	pwm.setPWMFreq(50)
except Exception:
	pass

#Read servo_commands file and determine if there is anything written
def wait_for_file():
    try:
        with open("servo_commands", "r") as f:
            lines = f.readlines()
            if len(lines) == 0: 
                return {"status": 1}
            else:
                return {"status": 0, "data": [l.rstrip("\n") for l in lines]}
    except Exception:
        return {"status": 1}

#Get data from file 
def get_data():
	while True: 
		res = wait_for_file()
		if res["status"] == 1:
			time.sleep(1)
		else:
			return res["data"]

#Map data from file (0-180) to 500-2500 range for servo hat
def mapHand(angle):
    if angle == 180: 
        return 1500
    else:
        return 1150

def mapShoulder(angle):
	mappedValue = 2500 + ((angle)*(800-2500))/(180)
	return int(mappedValue)

def mapElbow(angle):
	mappedValue = 500 + ((angle)*(2100-500))/(180)
	return int(mappedValue)

while True:
    data = get_data() #get and save data
    os.remove('servo_commands') #delete data file
    for i in data:
        if i[2] == " ":
            motorPin = int(i[1]) #separate motor pin
            angle = float(i.split(" ")[1]) #separate angle command string
            if motorPin == 0:
                mappedAngle = mapShoulder(angle) #map shoulder angle
            elif motorPin == 1:
                mappedAngle = mapElbow(angle) #map elbow angle
            elif motorPin == 2:
                mappedAngle = mapHand(angle) #map hand angle    
            pwm.setServoPulse(motorPin, mappedAngle) #move motor
        else:
            sleepTime = float(i.split(" ")[1]) 
            time.sleep(sleepTime)