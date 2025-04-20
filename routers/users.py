from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from supabase_client import supabase  # make sure this is your configured Supabase client

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

# --- Donor Model ---
class Donor(BaseModel):
    name: str
    email: str
    role: str         # "donor" or "receiver"
    blood_group: str
    city: str
    last_donation: str  # format: YYYY-MM-DD


@router.post("/register")
def register_donor(
    donor: Donor,
    authorization: str = Header(...)
):
    try:
        token = authorization.replace("Bearer ", "")
        user = supabase.auth.get_user(token)

        if user.get("user") is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        user_id = user["user"]["id"]

        supabase.table("users").insert({
            "auth_user_id": user_id,
            "name": donor.name,
            "email": donor.email,
            "role": donor.role,
            "blood_group": donor.blood_group,
            "city": donor.city,
            "last_donation": donor.last_donation
        }).execute()

        return {"message": "Donor registered successfully ✅"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
