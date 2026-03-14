from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import companies, machines, users, work_orders, maintenance_plans, failure_logs, alert_settings, auth

load_dotenv()

app = FastAPI(
    title="OperX API",
    description="API de gestão de manutenção preventiva",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(companies.router)
app.include_router(machines.router)
app.include_router(users.router)
app.include_router(work_orders.router)
app.include_router(maintenance_plans.router)
app.include_router(failure_logs.router)
app.include_router(alert_settings.router)

@app.get("/", tags=["Health Check"])
def root():
    return {"message": "Operx API rodando!"}