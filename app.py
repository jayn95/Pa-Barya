from fastapi import FastAPI, UploadFile, File, Form, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import requests
import base64

app = FastAPI()

# --------------------
# Static & Templates
# --------------------
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# --------------------
# Hugging Face Space
# --------------------
HF_API_URL = "https://YOUR-USERNAME-YOUR-SPACE.hf.space/run/predict"

# --------------------
# Pages
# --------------------
@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/about", response_class=HTMLResponse)
def about(request: Request):
    return templates.TemplateResponse("about.html", {"request": request})

# --------------------
# API Proxy
# --------------------
@app.post("/detect")
async def detect(file: UploadFile = File(...), coins: str = Form("")):
    image_bytes = await file.read()

    encoded_image = base64.b64encode(image_bytes).decode("utf-8")

    payload = {
        "data": [
            encoded_image,
            coins
        ]
    }

    response = requests.post(HF_API_URL, json=payload, timeout=60)

    return JSONResponse(content=response.json())
