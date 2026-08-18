from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ChatMessage(BaseModel):
    role: str = Field(..., description="Role of the speaker: user, assistant, bot, or system")
    content: str = Field(..., description="Text content of the message")

class QueryRequest(BaseModel):
    query: str = Field(..., description="The user query or question")
    chat_history: Optional[List[ChatMessage]] = Field(default_factory=list, description="Previous conversation messages")
    top_k: Optional[int] = Field(default=6, description="Number of context documents to retrieve")
    stream: Optional[bool] = Field(default=False, description="Whether to stream the response")
    user_email: Optional[str] = Field(default="guest", description="Logged in user email or guest")

class SourceDocument(BaseModel):
    content: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    score: Optional[float] = None

class QueryResponse(BaseModel):
    query: str
    answer: str
    sources: List[SourceDocument] = Field(default_factory=list)
    latency_seconds: float = 0.0
    rewritten_query: Optional[str] = None
    intent: Optional[str] = "query"

class HealthResponse(BaseModel):
    status: str
    version: str
    vector_db_connected: bool
    total_documents: int = 0

class IngestTextRequest(BaseModel):
    title: str = Field(..., description="Title of the notice, circular, or handbook section")
    content: str = Field(..., description="Full text content of the document")
    category: Optional[str] = Field(default="University Notice", description="Category e.g. Admissions, Exams, Library, Events")

class IngestResponse(BaseModel):
    status: str
    chunks_added: int
    total_documents: int
    message: str

# Authentication Schemas
class RegisterRequest(BaseModel):
    name: str = Field(..., description="Full name of user")
    email: str = Field(..., description="University or personal email")
    password: str = Field(..., description="Password (min 6 characters)")
    institute: Optional[str] = Field(default="CSPIT", description="Constituent Institute")

class LoginRequest(BaseModel):
    email: str = Field(..., description="User email")
    password: str = Field(..., description="User password")

class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., description="Registered user email")

class SocialLoginRequest(BaseModel):
    email: str = Field(..., description="Social account email")
    name: Optional[str] = Field(default="Student User", description="Social display name")
    provider: str = Field(default="google", description="google or github")
    avatar_url: Optional[str] = None

class UserResponse(BaseModel):
    email: str
    name: str
    institute: str
    provider: str
    avatar_url: Optional[str] = None

class AuthResponse(BaseModel):
    success: bool
    message: str
    user: Optional[UserResponse] = None
    token: Optional[str] = None

# Multimodal Assignment Problem Solver Schemas
class AssignmentSolveRequest(BaseModel):
    image_base64: str = Field(..., description="Base64 encoded problem image (JPEG/PNG/WEBP)")
    prompt: Optional[str] = Field(default=None, description="Optional student question or prompt")
    department: Optional[str] = Field(default=None, description="Department (e.g. AI&ML, CE, IT, ME, Civil, EC, EE, Pharmacy, MCA)")
    subject: Optional[str] = Field(default=None, description="Subject name if known (e.g. DSA, ML, DBMS, OS, Math)")
    mime_type: Optional[str] = Field(default="image/jpeg", description="MIME type of uploaded image")
    user_email: Optional[str] = Field(default="guest", description="Logged in user email")

class AssignmentSolveResponse(BaseModel):
    solution: str
    problem_title: Optional[str] = "Assignment Problem Solution"
    department: Optional[str] = None
    subject: Optional[str] = None
    latency_seconds: float = 0.0
    status: str = "success"

