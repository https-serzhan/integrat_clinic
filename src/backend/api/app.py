import os
from pathlib import Path

import aiosqlite
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr

# ================= Config =================
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parents[2]
load_dotenv(PROJECT_ROOT / ".env")

database_setting = Path(os.getenv("INTEGRAT_API_DATABASE", "src/backend/api/integrat_clinic.db"))
DATABASE_PATH = database_setting if database_setting.is_absolute() else PROJECT_ROOT / database_setting
DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
DATABASE_URL = str(DATABASE_PATH)
SCHEMA_PATH = BASE_DIR / "schema.sql"
SECRET_KEY = os.getenv("INTEGRAT_API_SECRET_KEY", "dummy-secret-key-for-now")
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# ================= DB setup =================
async def get_db():
    async with aiosqlite.connect(DATABASE_URL) as db:
        db.row_factory = aiosqlite.Row
        yield db

async def lifespan(_app: FastAPI):
    # Resolve schema relative to this module so startup survives repo reorganizations.
    if SCHEMA_PATH.exists():
        sql = SCHEMA_PATH.read_text(encoding="utf-8")
        async with aiosqlite.connect(DATABASE_URL) as db:
            await db.executescript(sql)
            await db.commit()
    yield

app = FastAPI(title="Integrat Clinic API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= Schemas =================
class UserRegister(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ContactCreate(BaseModel):
    fullname: str
    phone: str
    comment: str

class AppointmentCreate(BaseModel):
    doctor_id: int
    datetime: str

# ================= Auth Utils =================
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return int(user_id)

# ================= Routes =================

@app.post("/auth/register")
async def register(payload: UserRegister, db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT id FROM users WHERE email = ?", (payload.email,))
    existing = await cursor.fetchone()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = pwd_context.hash(payload.password)
    cursor = await db.execute(
        "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
        (payload.email, hashed_password, "patient")
    )
    user_id = cursor.lastrowid
    await db.commit()
    return {"id": user_id, "email": payload.email, "role": "patient"}

@app.post("/auth/login", response_model=TokenResponse)
async def login(payload: UserLogin, db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT id, password_hash FROM users WHERE email = ?", (payload.email,))
    user = await cursor.fetchone()
    if not user or not pwd_context.verify(payload.password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    encoded_jwt = jwt.encode({"sub": str(user["id"])}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": encoded_jwt, "token_type": "bearer"}

@app.post("/contacts")
async def create_contact(payload: ContactCreate, db: aiosqlite.Connection = Depends(get_db)):
    await db.execute(
        "INSERT INTO contacts (fullname, phone, comment) VALUES (?, ?, ?)",
        (payload.fullname, payload.phone, payload.comment)
    )
    await db.commit()
    return {"status": "success"}

@app.get("/contacts")
async def get_contacts(db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT * FROM contacts ORDER BY created_at DESC")
    rows = await cursor.fetchall()
    return [dict(row) for row in rows]

@app.get("/doctors")
async def get_doctors(db: aiosqlite.Connection = Depends(get_db)):
    # Simple query
    cursor = await db.execute("SELECT id, name, specialty FROM doctors")
    rows = await cursor.fetchall()
    return [dict(row) for row in rows]

@app.post("/appointments")
async def create_appointment(
    payload: AppointmentCreate, 
    user_id: int = Depends(get_current_user), 
    db: aiosqlite.Connection = Depends(get_db)
):
    await db.execute(
        "INSERT INTO appointments (patient_id, doctor_id, datetime) VALUES (?, ?, ?)",
        (user_id, payload.doctor_id, payload.datetime)
    )
    await db.commit()
    return {"status": "success"}

@app.get("/appointments")
async def get_appointments(db: aiosqlite.Connection = Depends(get_db)):
    query = """
    SELECT a.id, a.datetime, u.email as patient_email, d.name as doctor_name
    FROM appointments a
    JOIN users u ON a.patient_id = u.id
    JOIN doctors d ON a.doctor_id = d.id
    ORDER BY a.datetime DESC
    """
    cursor = await db.execute(query)
    rows = await cursor.fetchall()
    return [dict(row) for row in rows]
