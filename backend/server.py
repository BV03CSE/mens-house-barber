from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

security = HTTPBearer()

# Create the main app
app = FastAPI(title="MEN'S HOUSE BARBER API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class ServiceCreate(BaseModel):
    name: str
    description: str
    price: float
    duration: int  # in minutes

class Service(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    duration: int
    active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AppointmentCreate(BaseModel):
    service_id: str
    client_name: str
    client_phone: str
    client_email: Optional[str] = None
    date: str  # YYYY-MM-DD
    time: str  # HH:MM

class Appointment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    service_id: str
    service_name: str
    service_price: float
    service_duration: int
    client_name: str
    client_phone: str
    client_email: Optional[str] = None
    date: str
    time: str
    status: str = "confirmed"  # confirmed, completed, cancelled
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class WorkingHours(BaseModel):
    model_config = ConfigDict(extra="ignore")
    day: str  # monday, tuesday, etc.
    open_time: str  # HH:MM
    close_time: str  # HH:MM
    is_closed: bool = False

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminCreate(BaseModel):
    username: str
    password: str

class SalonSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str = "MEN'S HOUSE BARBER"
    phone: str = ""
    email: str = ""
    address: str = ""
    slot_duration: int = 30  # minutes between appointment slots

# ============ AUTH HELPERS ============

def create_token(username: str) -> str:
    payload = {
        "sub": username,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============ SERVICES ENDPOINTS ============

@api_router.get("/services", response_model=List[Service])
async def get_services():
    services = await db.services.find({"active": True}, {"_id": 0}).to_list(100)
    return services

@api_router.get("/services/all", response_model=List[Service])
async def get_all_services(username: str = Depends(verify_token)):
    services = await db.services.find({}, {"_id": 0}).to_list(100)
    return services

@api_router.post("/services", response_model=Service)
async def create_service(service: ServiceCreate, username: str = Depends(verify_token)):
    service_obj = Service(**service.model_dump())
    doc = service_obj.model_dump()
    await db.services.insert_one(doc)
    return service_obj

@api_router.put("/services/{service_id}", response_model=Service)
async def update_service(service_id: str, service: ServiceCreate, username: str = Depends(verify_token)):
    existing = await db.services.find_one({"id": service_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Service not found")
    
    update_data = service.model_dump()
    await db.services.update_one({"id": service_id}, {"$set": update_data})
    
    updated = await db.services.find_one({"id": service_id}, {"_id": 0})
    return updated

@api_router.delete("/services/{service_id}")
async def delete_service(service_id: str, username: str = Depends(verify_token)):
    result = await db.services.update_one({"id": service_id}, {"$set": {"active": False}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"message": "Service deleted"}

# ============ APPOINTMENTS ENDPOINTS ============

@api_router.get("/appointments", response_model=List[Appointment])
async def get_appointments(
    date: Optional[str] = None,
    status: Optional[str] = None,
    username: str = Depends(verify_token)
):
    query = {}
    if date:
        query["date"] = date
    if status:
        query["status"] = status
    
    appointments = await db.appointments.find(query, {"_id": 0}).sort("date", 1).to_list(1000)
    return appointments

@api_router.post("/appointments", response_model=Appointment)
async def create_appointment(appointment: AppointmentCreate):
    # Get service details
    service = await db.services.find_one({"id": appointment.service_id, "active": True}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Check if slot is available
    existing = await db.appointments.find_one({
        "date": appointment.date,
        "time": appointment.time,
        "status": {"$ne": "cancelled"}
    }, {"_id": 0})
    
    if existing:
        raise HTTPException(status_code=400, detail="Time slot not available")
    
    appointment_obj = Appointment(
        **appointment.model_dump(),
        service_name=service["name"],
        service_price=service["price"],
        service_duration=service["duration"]
    )
    
    doc = appointment_obj.model_dump()
    await db.appointments.insert_one(doc)
    return appointment_obj

@api_router.put("/appointments/{appointment_id}/status")
async def update_appointment_status(
    appointment_id: str,
    status: str,
    username: str = Depends(verify_token)
):
    if status not in ["confirmed", "completed", "cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.appointments.update_one(
        {"id": appointment_id},
        {"$set": {"status": status}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    return {"message": f"Appointment {status}"}

@api_router.get("/appointments/available-slots")
async def get_available_slots(date: str):
    # Get working hours for the day
    day_name = datetime.strptime(date, "%Y-%m-%d").strftime("%A").lower()
    working_hours = await db.working_hours.find_one({"day": day_name}, {"_id": 0})
    
    if not working_hours or working_hours.get("is_closed", False):
        return {"slots": []}
    
    # Get settings for slot duration
    settings = await db.settings.find_one({}, {"_id": 0})
    slot_duration = settings.get("slot_duration", 30) if settings else 30
    
    # Generate time slots
    open_time = datetime.strptime(working_hours["open_time"], "%H:%M")
    close_time = datetime.strptime(working_hours["close_time"], "%H:%M")
    
    slots = []
    current = open_time
    while current < close_time:
        slots.append(current.strftime("%H:%M"))
        current += timedelta(minutes=slot_duration)
    
    # Get booked slots for the date
    booked = await db.appointments.find(
        {"date": date, "status": {"$ne": "cancelled"}},
        {"time": 1, "_id": 0}
    ).to_list(100)
    
    booked_times = [b["time"] for b in booked]
    
    available_slots = [s for s in slots if s not in booked_times]
    
    return {"slots": available_slots, "all_slots": slots, "booked": booked_times}

# ============ WORKING HOURS ENDPOINTS ============

@api_router.get("/working-hours", response_model=List[WorkingHours])
async def get_working_hours():
    hours = await db.working_hours.find({}, {"_id": 0}).to_list(7)
    return hours

@api_router.put("/working-hours")
async def update_working_hours(hours: List[WorkingHours], username: str = Depends(verify_token)):
    for h in hours:
        await db.working_hours.update_one(
            {"day": h.day},
            {"$set": h.model_dump()},
            upsert=True
        )
    return {"message": "Working hours updated"}

# ============ SETTINGS ENDPOINTS ============

@api_router.get("/settings", response_model=SalonSettings)
async def get_settings():
    settings = await db.settings.find_one({}, {"_id": 0})
    if not settings:
        return SalonSettings()
    return settings

@api_router.put("/settings", response_model=SalonSettings)
async def update_settings(settings: SalonSettings, username: str = Depends(verify_token)):
    await db.settings.update_one({}, {"$set": settings.model_dump()}, upsert=True)
    return settings

# ============ AUTH ENDPOINTS ============

@api_router.post("/auth/login")
async def login(credentials: AdminLogin):
    admin = await db.admins.find_one({"username": credentials.username}, {"_id": 0})
    
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not bcrypt.checkpw(credentials.password.encode(), admin["password"].encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(credentials.username)
    return {"token": token, "username": credentials.username}

@api_router.get("/auth/me")
async def get_current_user(username: str = Depends(verify_token)):
    return {"username": username}

@api_router.post("/auth/setup")
async def setup_admin(credentials: AdminCreate):
    # Check if admin already exists
    existing = await db.admins.find_one({})
    if existing:
        raise HTTPException(status_code=400, detail="Admin already configured")
    
    hashed = bcrypt.hashpw(credentials.password.encode(), bcrypt.gensalt())
    await db.admins.insert_one({
        "username": credentials.username,
        "password": hashed.decode()
    })
    
    # Initialize default working hours
    default_hours = [
        {"day": "monday", "open_time": "09:00", "close_time": "18:00", "is_closed": False},
        {"day": "tuesday", "open_time": "09:00", "close_time": "18:00", "is_closed": False},
        {"day": "wednesday", "open_time": "09:00", "close_time": "18:00", "is_closed": False},
        {"day": "thursday", "open_time": "09:00", "close_time": "18:00", "is_closed": False},
        {"day": "friday", "open_time": "09:00", "close_time": "18:00", "is_closed": False},
        {"day": "saturday", "open_time": "10:00", "close_time": "16:00", "is_closed": False},
        {"day": "sunday", "open_time": "10:00", "close_time": "14:00", "is_closed": True},
    ]
    
    for h in default_hours:
        await db.working_hours.update_one({"day": h["day"]}, {"$set": h}, upsert=True)
    
    # Initialize default services
    default_services = [
        {"name": "Tuns Clasic", "description": "Tuns clasic pentru bărbați cu finisare perfectă", "price": 50, "duration": 30},
        {"name": "Tuns + Barbă", "description": "Tuns complet împreună cu aranjarea bărbii", "price": 80, "duration": 45},
        {"name": "Aranjat Barbă", "description": "Conturare și aranjare barbă profesională", "price": 40, "duration": 20},
        {"name": "Bărbierit Clasic", "description": "Bărbierit tradițional cu prosop cald și briciul", "price": 60, "duration": 30},
        {"name": "Tuns Copii", "description": "Tuns pentru copii până la 12 ani", "price": 35, "duration": 25},
    ]
    
    for s in default_services:
        service_obj = Service(**s)
        await db.services.insert_one(service_obj.model_dump())
    
    token = create_token(credentials.username)
    return {"message": "Admin created", "token": token}

@api_router.get("/auth/check-setup")
async def check_setup():
    existing = await db.admins.find_one({})
    return {"setup_complete": existing is not None}

# ============ STATS ENDPOINTS ============

@api_router.get("/stats")
async def get_stats(username: str = Depends(verify_token)):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Today's appointments
    today_appointments = await db.appointments.count_documents({
        "date": today,
        "status": {"$ne": "cancelled"}
    })
    
    # Total appointments this month
    month_start = datetime.now(timezone.utc).replace(day=1).strftime("%Y-%m-%d")
    month_appointments = await db.appointments.count_documents({
        "date": {"$gte": month_start},
        "status": {"$ne": "cancelled"}
    })
    
    # Revenue this month
    pipeline = [
        {"$match": {"date": {"$gte": month_start}, "status": "completed"}},
        {"$group": {"_id": None, "total": {"$sum": "$service_price"}}}
    ]
    revenue_result = await db.appointments.aggregate(pipeline).to_list(1)
    month_revenue = revenue_result[0]["total"] if revenue_result else 0
    
    # Active services count
    services_count = await db.services.count_documents({"active": True})
    
    return {
        "today_appointments": today_appointments,
        "month_appointments": month_appointments,
        "month_revenue": month_revenue,
        "services_count": services_count
    }

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "MEN'S HOUSE BARBER API", "version": "1.0"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
