"""create alarm_events table

Revision ID: 0002
Revises: 0001
Create Date: 2026-03-12
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "alarm_events",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "zone_id",
            sa.Integer(),
            sa.ForeignKey("alarm_zones.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("zone_name", sa.String(255), nullable=False),
        sa.Column("event_type", sa.String(20), nullable=False),
        sa.Column("distance_meters", sa.Float(), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("triggered_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_alarm_events_id", "alarm_events", ["id"])
    op.create_index("ix_alarm_events_zone_id", "alarm_events", ["zone_id"])
    op.create_index("ix_alarm_events_triggered_at", "alarm_events", ["triggered_at"])


def downgrade() -> None:
    op.drop_index("ix_alarm_events_triggered_at", table_name="alarm_events")
    op.drop_index("ix_alarm_events_zone_id", table_name="alarm_events")
    op.drop_index("ix_alarm_events_id", table_name="alarm_events")
    op.drop_table("alarm_events")
