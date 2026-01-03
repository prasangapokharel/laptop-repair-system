from fastapi import APIRouter
from .auth import router as auth_router
from .users import router as users_router
from .devices import router as devices_router
from .orders import router as orders_router
from .payments import router as payments_router
from .assigns import router as assigns_router
from .admin import router as admin_router
from .problems import router as problems_router
from .cost_settings import router as cost_settings_router
from .claudinary import router as claudinary_router
from .messages import router as messages_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(devices_router)
api_router.include_router(orders_router)
api_router.include_router(payments_router)
api_router.include_router(assigns_router)
api_router.include_router(admin_router)
api_router.include_router(problems_router)
api_router.include_router(cost_settings_router)
api_router.include_router(claudinary_router)
api_router.include_router(messages_router)

__all__ = ["api_router"]
