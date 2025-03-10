import cv2
import logging

logger = logging.getLogger(__name__)

# Load pre-trained face detection model globally
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
)

def blur_faces(input_path, output_path):
    logger.info("Blurring faces in file: %s", input_path)
    image = cv2.imread(input_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)

    logger.info("Detected %d face(s)", len(faces))

    for (x, y, w, h) in faces:
        face_roi = image[y:y+h, x:x+w]
        blurred_face = cv2.GaussianBlur(face_roi, (99, 99), 30)
        image[y:y+h, x:x+w] = blurred_face

    cv2.imwrite(output_path, image)
    logger.info("Output image with blurred faces saved to: %s", output_path)
