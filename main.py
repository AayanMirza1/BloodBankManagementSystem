from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates


app = FastAPI()

# Mount for static files (CSS/JS/images)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Jinja2 HTML templates
templates = Jinja2Templates(directory="templates")

@app.get("/")
def serve_home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/login")
def serve_login(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/signup")
def serve_signup(request: Request):
    return templates.TemplateResponse("signup.html", {"request": request})

@app.get("/user-dashboard")
def donor_dashboard(request: Request):
    return templates.TemplateResponse("user-dashboard.html", {"request": request})


@app.get("/donor-dashboard")
def donor_dashboard(request: Request):
    return templates.TemplateResponse("donor-dashboard.html", {"request": request})


@app.get("/hospital-dashboard")
def hospital_dashboard(request: Request):
    return templates.TemplateResponse("hospital-dashboard.html", {"request": request})
