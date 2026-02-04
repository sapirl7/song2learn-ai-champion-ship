"""Add TTS audio retention table

Revision ID: 005
Revises: 004
Create Date: 2026-02-03 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


revision: str = "005"
down_revision: Union[str, None] = "004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "tts_audio",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", UUID(as_uuid=True), nullable=False),
        sa.Column("key", sa.String(length=255), nullable=False),
        sa.Column("text_hash", sa.String(length=64), nullable=False),
        sa.Column("voice_id", sa.String(length=64), nullable=True),
        sa.Column("language", sa.String(length=16), nullable=True),
        sa.Column("speed", sa.Float(), nullable=True),
        sa.Column("text_len", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_persistent", sa.Boolean(), nullable=True, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("last_accessed_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("key", name="uix_tts_audio_key"),
    )
    op.create_index(op.f("ix_tts_audio_id"), "tts_audio", ["id"], unique=False)
    op.create_index(op.f("ix_tts_audio_user_id"), "tts_audio", ["user_id"], unique=False)
    op.create_index(op.f("ix_tts_audio_key"), "tts_audio", ["key"], unique=False)
    op.create_index(op.f("ix_tts_audio_text_hash"), "tts_audio", ["text_hash"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_tts_audio_text_hash"), table_name="tts_audio")
    op.drop_index(op.f("ix_tts_audio_key"), table_name="tts_audio")
    op.drop_index(op.f("ix_tts_audio_user_id"), table_name="tts_audio")
    op.drop_index(op.f("ix_tts_audio_id"), table_name="tts_audio")
    op.drop_table("tts_audio")
