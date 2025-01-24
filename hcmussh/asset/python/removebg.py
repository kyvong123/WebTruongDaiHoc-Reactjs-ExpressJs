import sys
import base64
from io import BytesIO
import cv2
from PIL import Image
import numpy as np

input_path = sys.argv[1]

image = cv2.imread(input_path)

import numpy as np
import cv2

# Load image and HSV color threshold
hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
lower = np.array([90, 38, 0])
upper = np.array([145, 255, 255])
mask = cv2.inRange(hsv, lower, upper)
result = cv2.bitwise_and(image, image, mask=mask)
result[mask==0] = (255, 255, 255)
img = result;

img = Image.fromarray(result)

img = img.convert("RGBA")

pixdata = img.load()

width, height = img.size

for y in range(height):
    for x in range(width):
        if pixdata[x, y] == (255, 255, 255, 255):  # transparent
            pixdata[x, y] = (255, 255, 255, 0)
        else:
            pixdata[x, y] = (0, 0, 255, 255)
img.save(input_path)


