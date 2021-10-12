import numpy as np 
from PIL import Image
import os
# import matplotlib.pyplot as plt

def get_coords_from_image():
	img_data = Image.open(os.path.join("static", "png", "img.png"))
	img = np.asarray(img_data)
	print(img.shape)
	path = [[int(y) for y in list(x)] for x in np.where(img != 0)]
	# plt.scatter(path[0], path[1])
	# plt.show()
	temp = []
	for item in zip(path[0], path[1]):
		temp.append(item[0])
		temp.append(item[1])
	return temp

def minimize_coords(coords, threshold = 5):
	# quick algo: grab the 
	# average of the next "threshold" points
	raise NotImplementedError

# coords = get_coords_from_image()

