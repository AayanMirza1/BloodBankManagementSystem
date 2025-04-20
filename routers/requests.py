from fastapi import APIRouter

router = APIRouter(
    prefix="/requests",
    tags=["Requests"]
)

# Optional test route
@router.get("/test")
def test_requests():
    return {"message": "requests router is working"}
