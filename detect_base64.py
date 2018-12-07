import sys
import cv2
import os
import numpy as np
from PIL import Image
import base64
from io import StringIO
from io import BytesIO
import io
# import io as cStringIO
# from io import StringIO
import scipy.misc


cascadePath = "haarcascade_frontalface_alt2.xml"
# cascadePath = "cascade.xml"
faceCascade = cv2.CascadeClassifier(cascadePath)


def readb64(base64_string):
    pimg = Image.open(BytesIO(base64.b64decode(base64_string)))
    return pimg

def detect():
    f = open('base64.txt')
    data1 = f.read()  # ファイル終端まで全て読んだデータを返す
    f.close()
    #print(data1)
    # グレースケールでbase64を読み込む
    image_pil = readb64(data1.replace("\\", "\\\\"))

    # image_pil = readb64(sys.argv[1].replace("\\", "\\\\"))
    image_gray = image_pil.convert('L')
    # NumPyの配列に格納
    image = np.array(image_gray, 'uint8')

    dst = np.array(image_pil, 'uint8')

    # # Haar-like特徴分類器で顔を検知 (パラメータは適当)
    faces = faceCascade.detectMultiScale(image, minNeighbors=3)

    # faces = faceCascade.detectMultiScale(image, 1.1, 9, 0)
    height = image.shape[0]
    width = image.shape[1]
    
    # print(height)
    #scipy.misc.imsave('outfile.jpg', image)

    #scipy.misc.imsave('outfile2.png', dst)
    
    # print(dst)


   
    # # 検出した顔画像の座標を表示
    for (x, y, w, h) in faces:
        
        print (x, y, w, h)
        # dst2 = dst[y-50:y+h+100, x-50:x+w+100]
        # dst.convert('RGB')
        # scipy.misc.imsave('dst.png', dst2)
     


    


if sys.argv[1]:
    detect()
else :
    print("Empty!")
