from fastapi import FastAPI, UploadFile, File, Form, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from gradio_client import Client, handle_file
import tempfile
import os

app = FastAPI()

# --------------------
# Static & Templates
# --------------------
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# --------------------
# Hugging Face Space Client
# --------------------
HF_SPACE = "jayn95/Pa-Barya"
hf_client = Client(HF_SPACE)

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
# API Proxy (Gradio-style)
# --------------------
@app.post("/detect")
async def detect(file: UploadFile = File(...), coins: str = Form("")):
    # Save uploaded image temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
        image_bytes = await file.read()
        tmp.write(image_bytes)
        tmp_path = tmp.name

    try:
        result = hf_client.predict(
            image=handle_file(tmp_path),
            coins=coins,
            api_name="/gradio_detect"
        )

        return JSONResponse(content=result)

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

    finally:
        # Clean up temp file
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

@app.get("/health")
def health():
    return {"status": "ok"}
