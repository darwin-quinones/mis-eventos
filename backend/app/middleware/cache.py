from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable


class CacheControlMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add Cache-Control headers to responses.
    
    For GET requests:
    - Public endpoints: Cache for 5 minutes
    - Private endpoints: No cache
    
    For other methods: No cache
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)

        # Only cache GET requests
        if request.method == "GET":
            path = request.url.path

            # Public endpoints that can be cached
            if path.startswith("/events") and not path.startswith("/events/") or path == "/":
                # Cache event listings for 5 minutes
                response.headers["Cache-Control"] = "public, max-age=300"
                response.headers["Vary"] = "Accept-Encoding"
            elif path.startswith("/events/") and "/sessions" in path:
                # Cache sessions for 5 minutes
                response.headers["Cache-Control"] = "public, max-age=300"
                response.headers["Vary"] = "Accept-Encoding"
            elif path.startswith("/events/"):
                # Cache individual events for 5 minutes
                response.headers["Cache-Control"] = "public, max-age=300"
                response.headers["Vary"] = "Accept-Encoding"
            elif "Authorization" in request.headers:
                # Private endpoints (authenticated) - no cache
                response.headers["Cache-Control"] = "private, no-cache, no-store, must-revalidate"
                response.headers["Pragma"] = "no-cache"
                response.headers["Expires"] = "0"
            else:
                # Default for other GET requests
                response.headers["Cache-Control"] = "public, max-age=60"
        else:
            # No cache for POST, PUT, DELETE, etc.
            response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"

        return response
