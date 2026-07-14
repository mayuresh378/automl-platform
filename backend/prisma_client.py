import os
import json
from datetime import datetime, timezone
from typing import Optional
from prisma import Prisma
from prisma.models import (
    User as PrismaUser,
    Team as PrismaTeam,
    TeamMember as PrismaTeamMember,
    Project as PrismaProject,
    ApiKey as PrismaApiKey,
    Experiment as PrismaExperiment,
    ModelRegistry as PrismaModelRegistry,
    Deployment as PrismaDeployment,
    Pipeline as PrismaPipeline,
    PipelineRun as PrismaPipelineRun,
    Dataset as PrismaDataset,
    PredictionLog as PrismaPredictionLog,
    Notification as PrismaNotification,
    Webhook as PrismaWebhook,
    UserSession as PrismaUserSession,
    MarketplaceItem as PrismaMarketplaceItem,
    AuditLog as PrismaAuditLog,
    ActivityLog as PrismaActivityLog,
)


_prisma_client: Optional[Prisma] = None


async def get_prisma() -> Prisma:
    global _prisma_client
    if _prisma_client is None or not _prisma_client.is_connected():
        _prisma_client = Prisma(auto_register=True)
        await _prisma_client.connect()
    return _prisma_client


async def close_prisma():
    global _prisma_client
    if _prisma_client and _prisma_client.is_connected():
        await _prisma_client.disconnect()
        _prisma_client = None


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _serialize(obj):
    if obj is None:
        return None
    if isinstance(obj, (dict, list)):
        return json.dumps(obj)
    if isinstance(obj, datetime):
        return obj.isoformat()
    return str(obj)


def _deserialize(val):
    if val is None:
        return None
    try:
        return json.loads(val)
    except (json.JSONDecodeError, TypeError):
        return val


# ── Audit helper ────────────────────────────────────────────────────

def serialize_details(details: dict) -> str:
    return json.dumps(details) if details else "{}"


async def create_audit_log(
    user_id: Optional[str],
    actor: Optional[str],
    action: str,
    target: Optional[str] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    details: Optional[dict] = None,
    ip_address: Optional[str] = None,
    status: str = "success",
    severity: str = "info",
):
    db = await get_prisma()
    return await db.auditlog.create({
        "userId": user_id,
        "actor": actor,
        "action": action,
        "target": target,
        "resourceType": resource_type,
        "resourceId": resource_id,
        "details": serialize_details(details),
        "ipAddress": ip_address,
        "status": status,
        "severity": severity,
    })


async def create_activity_log(
    user_id: Optional[str],
    action: str,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    details: Optional[dict] = None,
):
    db = await get_prisma()
    return await db.activitylog.create({
        "userId": user_id,
        "action": action,
        "resourceType": resource_type,
        "resourceId": resource_id,
        "details": serialize_details(details),
    })
