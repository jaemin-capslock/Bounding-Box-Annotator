import sys
import numpy as np
import json
import easyocr

reader = easyocr.Reader(['en'], gpu=False)
# Assume that the address of the image is given as the
# Second arg on file call.

address = sys.argv[1]

result = reader.readtext(address, detail = 1)

# box: Coordinates of the bounding boxes.
def getBoxes(input):
  boxes = []
  for i in range(len(input)):
    # Convert values to int, since cv2 accepts integer values
    input[i][0][0][0], input[i][0][0][1] = int(input[i][0][0][0]), int(input[i][0][0][1])
    input[i][0][2][0], input[i][0][2][1] = int(input[i][0][2][0]), int(input[i][0][2][1])
    toAppend = input[i][0][0], input[i][0][2]
    boxes.append(toAppend)
  return boxes

box = getBoxes(result)
def readTexts(input):
  texts = []
  for i in range(len(input)):
    toAppend = input[i][1]
    texts.append(toAppend)
  return texts
# readText: List of texts
readText = readTexts(result)



print(json.dumps(box))
print(json.dumps(readText))

sys.stdout.flush()