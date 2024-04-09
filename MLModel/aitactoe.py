import tensorflow as tf
from tensorflow.keras.layers import Dense
import numpy as np
import dataloader as dl
from sklearn.model_selection import train_test_split


def get_cost(model, x_data, y_data):
    y_hat_raw = model.predict(x_data)
    m = y_hat_raw.shape[0]
    error = 0
    for i in range(m):
        g = 1 / (1 + np.exp(-y_hat_raw[i]))
        prediction = 0
        if g >= 0.5:
            prediction = 1
        if prediction != y_data[i]:
            error += 1
    return error / m


tf.random.set_seed(1234)
x, y_raw = dl.load_data_set()
norm_l = tf.keras.layers.Normalization(axis=-1)
norm_l.adapt(x)

x_train, x_temp, y_train, y_temp = train_test_split(x, y_raw, test_size=0.4, random_state=1)

x_dev, x_test, y_dev, y_test = train_test_split(x_temp, y_temp, test_size=0.5, random_state=1)
x_train = norm_l(x_train)
x_dev = norm_l(x_dev)
x_test = norm_l(x_test)
model = tf.keras.models.Sequential([
    tf.keras.Input(shape=(3600,)),
    Dense(units=30, activation="relu", kernel_regularizer=tf.keras.regularizers.l2(0.002)),
    Dense(units=20, activation="relu", kernel_regularizer=tf.keras.regularizers.l2(0.002)),
    Dense(units=1, activation="linear"),
])
model.compile(
    loss=tf.keras.losses.BinaryCrossentropy(from_logits=True),
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.003)
)
model.fit(x_train, y_train, epochs=50)

cost_dev = get_cost(model, x_dev, y_dev)
cost_test = get_cost(model, x_test, y_test)

print(f"Cross validation cost: {cost_dev}")
print(f"Test cost: {cost_test}")

model.save("model/tictactoe.json")


