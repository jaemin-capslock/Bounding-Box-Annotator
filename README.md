# Draw bounding boxes to your image!

This app uses Node.js and Python to accept image, get coordinates of bounding boxes (where text is likely present) and then draws bounding boxes on the top.

## How to use

The initial screen should look like this:

![Image][1]

[1]: /example_imgs/ex1.png

click ```Choose File```, then upload an image. Then click ```Submit```.

Now you should see:

![Image][2]

[2]: /example_imgs/ex2.png

Click the hyperlink below. (Warning: this process would take quite a bit of time, depending on your image.)

After the wait, you should see:

![Image][3]

[3]: /example_imgs/ex3.png

Now the image is annotated with bounding boxes around the potential texts! *Are they the same picture?*



## To do

- The python script is also capable of generating texts as well. Add code to parse texts and display?
- Optimization
- Deployment - I tried to deploy this on Heroku, but was unsuccessful as Heroku instances are very low-memory and this process requires a lot of memory. Try to optimize?
