from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.exception_handlers import (
    http_exception_handler,
    request_validation_exception_handler,
)
from sqlalchemy.exc import SQLAlchemyError
from core.config import settings
from apps.api.v1 import api_router
import logging

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Laptop Repair Store Management API",
    version="1.0.0",
    default_response_class=ORJSONResponse
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    import traceback
    error_trace = ''.join(traceback.format_exception(type(exc), exc, exc.__traceback__))
    logger.error(f"SQLAlchemy Error: {type(exc).__name__}: {str(exc)}\n{error_trace}", exc_info=True)
    return ORJSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"Database error: {str(exc)[:200]}"}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unexpected Error: {type(exc).__name__}: {str(exc)}", exc_info=True)
    return ORJSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": str(exc)}
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return await request_validation_exception_handler(request, exc)


@app.get("/")
async def root():
    return {"message": "Laptop Repair Store Management API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}