from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Database
    database_url: str
    db_password: str = "changeme"  # we are not using this currently, not even in prod. ingnore. #pydantic need
    
    # Redis (Upstash)
    redis_url: str = "redis://localhost:6379"
    
    # JWT
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15  # 15 minutes
    refresh_token_expire_minutes: int = 60 * 24 * 30  # 30 days
    
    # OpenAI
    openai_api_key: str
    stripe_api_key: str
    stripe_publishable_key: str
    stripe_webhook_secret: str
    
    # Environment
    environment: str = "development"
    
    # Logging control
    debug: bool = True  # Set to False in production to reduce logs
    log_sql_queries: bool = False  # SQLAlchemy query logging
    log_http_requests: bool = True  # Uvicorn access logs
    
    # Error Tracking
    sentry_dsn: str | None = None  # Add to .env for production error tracking
    sentry_traces_sample_rate: float = 0.1  # 10% of requests traced

    # NextAuth (for frontend authentication) backed wont use them, for pydantic only
    auth_secret: str | None = None
    nextauth_url: str | None = None
    auth_google_id: str | None = None
    auth_google_secret: str | None = None
    # cors
    frontend_url: str | None = None


    model_config = SettingsConfigDict(env_file=".env.local", env_file_encoding="utf-8")

settings = Settings()   