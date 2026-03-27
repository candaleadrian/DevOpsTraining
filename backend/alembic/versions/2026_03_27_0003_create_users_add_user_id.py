"""create users table and add user_id to zones and events

Revision ID: 0003
Revises: 0002
Create Date: 2026-03-27
"""

from alembic import op
import sqlalchemy as sa

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True, index=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    op.add_column(
        "alarm_zones",
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=True,
        ),
    )
    op.create_index("ix_alarm_zones_user_id", "alarm_zones", ["user_id"])

    op.add_column(
        "alarm_events",
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=True,
        ),
    )
    op.create_index("ix_alarm_events_user_id", "alarm_events", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_alarm_events_user_id", table_name="alarm_events")
    op.drop_column("alarm_events", "user_id")
    op.drop_index("ix_alarm_zones_user_id", table_name="alarm_zones")
    op.drop_column("alarm_zones", "user_id")
    op.drop_table("users")
