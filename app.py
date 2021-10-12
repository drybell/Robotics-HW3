from flask import Flask, render_template, jsonify, request, redirect, url_for
import os
from PIL import Image
import base64
import io
from parse_image import get_coords_from_image
import subprocess 

app = Flask(__name__)

coords = None

# Home Page 
@app.route('/')
def home():
    return render_template('base.html')

# Extra Environment for testing
@app.route('/1')
def page_1():
	return render_template('base2.html')

# whiteboard canvas url route
@app.route('/draw')
def whiteboard():
	return render_template('draw.html')

@app.route('/image')
def get_curr_image():
	global coords
	return jsonify({"coords": coords})

# converts the IK servo angles to a protocol understandable by 
# armMotor.py on the pi. Also sends the full file to the pi for 
# instant post-simulation runtime
@app.route('/get_angles', methods=["POST"])
def get_angles():
	parsed_data = request.get_json(force = True)
	command_str = ""
	for i, item in enumerate(parsed_data.keys()):
		curr = parsed_data[str(i)]
		command_str += "s2 180\nsleep 1\n"
		command_str += f"s0 {curr[0][0]:.2f}\ns1 {max(curr[0][1], 0):.2f}\nsleep 1\ns2 0\nsleep 1\n"
		for data in curr[1:]:
			command_str += f"s0 {data[0]:.2f}\ns1 {max(data[1], 0):.2f}\nsleep .1\n"

		command_str += "s2 180\nsleep .25\n"

	with open("servo_commands", "w") as f:
		f.write(command_str)

	subprocess.run(["scp", "-i", "~/.ssh/new_keys/id_rsa", "servo_commands", "pi@10.245.86.37:~/Desktop"])

	return jsonify({"status": 200})
	
# Used to save the whiteboard image, 
# was used in a previous iteration of code. 
@app.route('/save', methods=["POST"])
def saveimage():
	global coords
	parsed_data = request.get_json(force = True)
	coords      = parsed_data["value"]
	# file = request.values["imgBase64"]
	# offset = str(file).index(',') + 1
	# filename = "img.png"
	# imgdata = base64.b64decode(file[offset:])
	# image = Image.open(io.BytesIO(imgdata))
	# image.save(os.path.join("static", "png", filename))
	# coords = get_coords_from_image()
	return redirect('/', code=303)



if __name__ == '__main__':
	app.run(debug=True)
