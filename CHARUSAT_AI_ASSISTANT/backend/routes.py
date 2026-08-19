import time
import os
import sys

# Ensure root and backend dirs are on sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(CURRENT_DIR)
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from fastapi import APIRouter, HTTPException, Depends

try:
    from backend.config import settings
    from backend.models import (
        QueryRequest, QueryResponse, HealthResponse, SourceDocument,
        IngestTextRequest, IngestResponse,
        LoginRequest, RegisterRequest, ForgotPasswordRequest, SocialLoginRequest, AuthResponse, UserResponse,
        AssignmentSolveRequest, AssignmentSolveResponse
    )
except ImportError:
    from config import settings
    from models import (
        QueryRequest, QueryResponse, HealthResponse, SourceDocument,
        IngestTextRequest, IngestResponse,
        LoginRequest, RegisterRequest, ForgotPasswordRequest, SocialLoginRequest, AuthResponse, UserResponse,
        AssignmentSolveRequest, AssignmentSolveResponse
    )

from rag.pipeline import RAGPipeline
from database.db_client import DBClient

router = APIRouter()

# Singletons for memory efficiency and persistent connections
_rag_pipeline: RAGPipeline = None
_db_client: DBClient = None

def get_rag_pipeline() -> RAGPipeline:
    global _rag_pipeline
    if _rag_pipeline is None:
        _rag_pipeline = RAGPipeline()
    return _rag_pipeline

def get_db_client() -> DBClient:
    global _db_client
    if _db_client is None:
        _db_client = DBClient(db_path=settings.SQLITE_DB_PATH)
    return _db_client

@router.get("/health", response_model=HealthResponse)
async def health_check(
    rag_pipeline: RAGPipeline = Depends(get_rag_pipeline)
):
    """Health check endpoint to verify backend service and vector database status."""
    is_connected = rag_pipeline.vector_store.is_connected()
    doc_count = rag_pipeline.vector_store.count()
    return HealthResponse(
        status="healthy",
        version=settings.VERSION,
        vector_db_connected=is_connected,
        total_documents=doc_count
    )

@router.post("/chat", response_model=QueryResponse)
async def chat_endpoint(
    request: QueryRequest,
    rag_pipeline: RAGPipeline = Depends(get_rag_pipeline),
    db_client: DBClient = Depends(get_db_client)
):
    """
    Process incoming user questions through the CHARUSAT RAG Pipeline.
    Supports multi-turn follow-up queries, retrieves context, and generates answers.
    """
    if not request.query or not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    start_time = time.time()
    try:
        result = rag_pipeline.answer_query(
            query=request.query.strip(),
            history=request.chat_history,
            top_k=request.top_k or 6
        )
        
        latency = round(time.time() - start_time, 3)
        answer = result.get("answer", "No answer could be generated.")
        intent = result.get("intent", "query")
        
        # Log interaction to SQLite database with user email
        db_client.log_interaction(
            query=request.query.strip(),
            answer=answer,
            latency=latency,
            intent=intent,
            user_email=request.user_email or "guest"
        )

        return QueryResponse(
            query=request.query,
            answer=answer,
            sources=[
                SourceDocument(
                    content=doc.get("content", ""),
                    metadata=doc.get("metadata", {}),
                    score=doc.get("score")
                )
                for doc in result.get("sources", [])
            ],
            latency_seconds=latency,
            rewritten_query=result.get("rewritten_query"),
            intent=intent
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@router.post("/assignment/solve", response_model=AssignmentSolveResponse)
async def solve_assignment_endpoint(
    request: AssignmentSolveRequest,
    rag_pipeline: RAGPipeline = Depends(get_rag_pipeline),
    db_client: DBClient = Depends(get_db_client)
):
    """
    Multimodal Instant Assignment Problem Solver for CHARUSAT Students.
    Receives an image of an assignment/exam problem and generates a step-by-step verified solution.
    """
    if not request.image_base64:
        raise HTTPException(status_code=400, detail="Image data is required.")

    start_time = time.time()
    try:
        result = rag_pipeline.solve_assignment_image(
            image_base64=request.image_base64,
            prompt=request.prompt,
            department=request.department,
            subject=request.subject,
            mime_type=request.mime_type or "image/jpeg"
        )
        latency = round(time.time() - start_time, 3)
        
        # Log solving interaction
        db_client.log_interaction(
            query=f"[Assignment Image Problem]: {request.prompt or 'Step-by-step problem solution'}",
            answer=result["solution"],
            latency=latency,
            intent="assignment_solver",
            user_email=request.user_email or "guest"
        )

        return AssignmentSolveResponse(
            solution=result["solution"],
            problem_title="Assignment Problem Solution",
            department=request.department,
            subject=request.subject,
            latency_seconds=latency,
            status=result.get("status", "success")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error solving assignment problem: {str(e)}")

# ==============================================================================
# Authentication Endpoints
# ==============================================================================

@router.post("/auth/register", response_model=AuthResponse)
async def register(
    request: RegisterRequest,
    db_client: DBClient = Depends(get_db_client)
):
    """Register a new student or faculty account."""
    if len(request.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")
    
    res = db_client.register_user(
        email=request.email,
        name=request.name,
        password=request.password,
        institute=request.institute or "CHARUSAT"
    )
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["error"])

    user = res["user"]
    return AuthResponse(
        success=True,
        message="Registration successful! Welcome to CHARUSAT AI Assistant.",
        user=UserResponse(
            email=user["email"],
            name=user["name"],
            institute=user["institute"],
            provider=user["provider"]
        ),
        token=f"jwt_mock_{user['email']}"
    )

@router.post("/auth/login", response_model=AuthResponse)
async def login(
    request: LoginRequest,
    db_client: DBClient = Depends(get_db_client)
):
    """Authenticate user with email and password."""
    res = db_client.authenticate_user(email=request.email, password=request.password)
    if not res["success"]:
        raise HTTPException(status_code=401, detail=res["error"])

    user = res["user"]
    return AuthResponse(
        success=True,
        message="Login successful!",
        user=UserResponse(
            email=user["email"],
            name=user["name"],
            institute=user["institute"],
            provider=user["provider"]
        ),
        token=f"jwt_mock_{user['email']}"
    )

@router.get("/auth/config")
async def get_auth_config():
    """Returns public OAuth configuration for Google and GitHub integration."""
    return {
        "google_client_id": settings.GOOGLE_CLIENT_ID,
        "github_client_id": settings.GITHUB_CLIENT_ID
    }

@router.post("/auth/social-login", response_model=AuthResponse)
async def social_login(
    request: SocialLoginRequest,
    db_client: DBClient = Depends(get_db_client)
):
    """Sign in or auto-create account via Google or GitHub."""
    res = db_client.social_login_user(
        email=request.email,
        name=request.name,
        provider=request.provider,
        avatar_url=request.avatar_url
    )
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["error"])

    user = res["user"]
    return AuthResponse(
        success=True,
        message=f"Signed in successfully with {request.provider.capitalize()}!",
        user=UserResponse(
            email=user["email"],
            name=user["name"],
            institute=user.get("institute", "CHARUSAT"),
            provider=user["provider"],
            avatar_url=user.get("avatar_url")
        ),
        token=f"jwt_mock_{user['email']}"
    )

@router.post("/auth/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest,
    db_client: DBClient = Depends(get_db_client)
):
    """Request password reset link."""
    res = db_client.reset_password(email=request.email)
    if not res["success"]:
        raise HTTPException(status_code=404, detail=res["error"])
    return res

# ==============================================================================
# Ingestion and Admin Endpoints
# ==============================================================================

@router.post("/ingest/text", response_model=IngestResponse)
async def ingest_notice_text(
    request: IngestTextRequest,
    rag_pipeline: RAGPipeline = Depends(get_rag_pipeline)
):
    """
    Dynamically ingest a new notice, circular, or handbook section into the live vector store.
    No server reboot required.
    """
    if not request.content.strip():
        raise HTTPException(status_code=400, detail="Content cannot be empty.")

    try:
        chunks_added = rag_pipeline.ingest_text(
            title=request.title.strip(),
            content=request.content.strip(),
            category=request.category or "University Notice"
        )
        total_docs = rag_pipeline.vector_store.count()
        return IngestResponse(
            status="success",
            chunks_added=chunks_added,
            total_documents=total_docs,
            message=f"Successfully indexed '{request.title}' into {chunks_added} searchable chunks."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to ingest document: {str(e)}")

@router.get("/admin/unresolved")
async def get_admin_notifications(
    limit: int = 20,
    db_client: DBClient = Depends(get_db_client)
):
    """Retrieve unresolved queries flagged by the Flowchart 'Notify Admin' block."""
    return {"unresolved_queries": db_client.get_admin_notifications(limit=min(limit, 50))}

@router.get("/logs")
async def get_logs(
    limit: int = 10,
    db_client: DBClient = Depends(get_db_client)
):
    """Retrieve recent conversation logs for analytics."""
    return {"logs": db_client.get_recent_logs(limit=min(limit, 50))}
