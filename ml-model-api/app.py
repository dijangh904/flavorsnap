import os
import time
import uuid
import psutil
from functools import wraps
from flask import Flask, request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

try:
    from logger_config import logger
except ImportError:
    import logging
    logger = logging.getLogger(__name__)

app = Flask(__name__)

# Rate Limiting Configuration
# Includes rate limit headers in responses
app.config["RATELIMIT_HEADERS_ENABLED"] = True

# Implement rate limiting per IP using get_remote_address
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
)

# Custom handler for rate limit exceeded handling
@app.errorhandler(429)
def ratelimit_handler(e):
    logger.warning(f"Rate limit exceeded: {e.description}", event_type="rate_limit_exceeded")
    return jsonify({
        "error": "ratelimit_exceeded",
        "message": f"Rate limit exceeded: {e.description}"
    }), 429

def api_key_or_jwt_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Implementation of auth goes here. Bypassed for the rate limiting focus.
        return f(*args, **kwargs)
    return decorated_function

# Add different limits for different endpoints
@app.route('/predict', methods=['POST'])
@api_key_or_jwt_required
@limiter.limit("10 per minute")
def predict():
    start_time = time.time()
    
    if 'image' not in request.files:
        return jsonify({"error": "bad_request", "message": "No image in request.files"}), 400
        
    image = request.files['image']
    if image.filename == '':
        return jsonify({"error": "bad_request", "message": "No image selected"}), 400

    # Dummy endpoint logic for predict
    duration_ms = (time.time() - start_time) * 1000
    logger.log_api_response("POST", "/predict", 200, duration_ms=duration_ms)
    
    return jsonify({
        "status": "success",
        "message": "Prediction complete",
        "duration_ms": duration_ms
    })

@app.route('/health', methods=['GET'])
@limiter.exempt  # Health check could be exempt or have its own limit like 60/minute
def health_check():
    """Health check endpoint for monitoring"""
    logger.info("Health check requested")
    return jsonify({
        'status': 'healthy',
        'service': 'flavorsnap-ml-api',
        'timestamp': time.time()
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
