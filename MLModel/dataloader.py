import numpy as np
from PIL import Image
import os


_path = "DataSet"
img_width = 60
img_height = 60


def load_data_set():
    x, y, n = _load_data_set(_path)
    return x, y


def _load_data_set(path):
    files = os.listdir(path)
    image_files = [f for f in files if f.endswith('.jpg')]
    m = len(image_files)
    full_size = img_width * img_height
    x = np.zeros((m, full_size))
    y = np.zeros((m, 1))
    n = []

    for i, image_file in enumerate(image_files):
        class_type = get_class_by_name(image_file)
        full_path = os.path.join(path, image_file)
        with Image.open(full_path).convert("L") as img:
            n.append(image_file)
            img = img.resize((img_width, img_height))
            data = np.array(img).flatten()
            x[i, :] = data
            y[i, 0] = class_type
    return x, y, n

def get_class_by_name(name):
    if "0" in name:
        return 0
    if "x" in name:
        return 1
    return 2

