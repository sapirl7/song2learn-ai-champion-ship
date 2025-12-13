"""Add vocabulary source/target languages

Revision ID: 002
Revises: 001
Create Date: 2025-12-13 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("vocabulary", sa.Column("source_lang", sa.String(length=10), nullable=True))
    op.add_column("vocabulary", sa.Column("target_lang", sa.String(length=10), nullable=True))


def downgrade() -> None:
    op.drop_column("vocabulary", "target_lang")
    op.drop_column("vocabulary", "source_lang")


