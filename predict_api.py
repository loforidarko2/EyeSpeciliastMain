# predict_api.py
import os
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.imagenet_utils import preprocess_input
import uvicorn

# ---------------- CONFIG ----------------
BASE_DIR = r"C:\Users\lesli\Desktop\Final_Year_Project\DataSet\NData2_Balanced"
MODEL_PATH = os.path.join(BASE_DIR, "classification_model.keras")
IMG_SIZE = (224, 224)

# ---------------- FASTAPI ----------------
app = FastAPI(title="Prediction API", description="Upload an eye image for classification", version="1.0")

# Allow mobile app access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # in production, replace with your RN app domain/ip
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model once on startup
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model not found at {MODEL_PATH}")

model = load_model(MODEL_PATH)

# Get class labels from training folders
CLASSES = sorted(os.listdir(os.path.join(BASE_DIR, "train")))

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # Check file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")

        # Read and preprocess image
        contents = await file.read()
        img_path = "temp_upload.jpg"
        with open(img_path, "wb") as f:
            f.write(contents)

        img = image.load_img(img_path, target_size=IMG_SIZE)
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = preprocess_input(img_array) / 255.0  # same scaling as training

        # Prediction
        preds = model.predict(img_array)
        pred_idx = np.argmax(preds[0])
        prediction = CLASSES[pred_idx]
        confidence = float(np.max(preds[0]))

        # Clean temp file
        os.remove(img_path)

        return {"prediction": prediction, "confidence": confidence}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Prediction API is running. Use POST /predict to upload an image."}

if __name__ == "__main__":
    uvicorn.run("predict_api:app", host="0.0.0.0", port=8000, reload=True)
