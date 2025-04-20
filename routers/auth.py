from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from supabase_client import supabase

router = APIRouter(prefix="/auth", tags= ["Auth"])

# --- Request Models ---
class SignUpRequest(BaseModel):
    email: EmailStr
    password: str

class SignInRequest(BaseModel):
    email: EmailStr
    password: str


#--- Sign Up ---


@router.post("/signup")
def signup(user: SignUpRequest):
    try:
        result = supabase.auth.sign_up({
            "email": user.email,
            "password": user.password
        })

        if result.user is None:
            raise HTTPException(status_code=400, detail="Signup failed")

        return {
            "message": "Signup successful",
            "user": {
                "id": result.user.id,
                "email": result.user.email
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    
#--- Sign In ---

@router.post("/login")
def login(user: SignInRequest):
    try:
        result = supabase.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password
        })

        if result.user is None:
            raise HTTPException(status_code=400, detail="Login failed")

        return {
            "message": "Login successful",
            "access_token": result.session.access_token,
            "refresh_token": result.session.refresh_token
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))