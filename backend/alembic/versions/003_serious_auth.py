"""Serious auth upgrade (dual tokens + Google auth)

Revision ID: 003
Revises: 002
Create Date: 2026-02-03 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users: add auth/provider metadata and allow password_hash to be nullable
    op.add_column(
        "users",
        sa.Column("auth_provider", sa.String(length=20), nullable=True, server_default="email"),
    )
    op.add_column(
        "users",
        sa.Column("google_sub", sa.String(length=255), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("email_verified", sa.Boolean(), nullable=True, server_default=sa.false()),
    )
    op.add_column(
        "users",
        sa.Column("full_name", sa.String(length=255), nullable=True),
    )

    op.create_index("ix_users_google_sub", "users", ["google_sub"], unique=True)

    op.alter_column(
        "users",
        "password_hash",
        existing_type=sa.String(length=255),
        nullable=True,
    )

    # Songs: enforce unique artist + title
    op.create_unique_constraint("uix_songs_title_artist", "songs", ["title", "artist"])


def downgrade() -> None:
    op.drop_constraint("uix_songs_title_artist", "songs", type_="unique")

    op.alter_column(
        "users",
        "password_hash",
        existing_type=sa.String(length=255),
        nullable=False,
    )

    op.drop_index("ix_users_google_sub", table_name="users")

    op.drop_column("users", "full_name")
    op.drop_column("users", "email_verified")
    op.drop_column("users", "google_sub")
    op.drop_column("users", "auth_provider")
