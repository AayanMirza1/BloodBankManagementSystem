from fastapi import APIRouter

router = APIRouter(
    prefix="/donations",
    tags=["Donations"]
)

@router.get("/test")
def test_donations():
    return {"message": "donations router is working ✅"}
