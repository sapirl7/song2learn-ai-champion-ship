"""Initial schema

Revision ID: 001
Revises:
Create Date: 2025-01-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create users table with UUID primary key
    op.create_table(
        'users',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('native_lang', sa.String(10), nullable=True, default='en'),
        sa.Column('learning_lang', sa.String(10), nullable=True, default='en'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    # Create songs table
    op.create_table(
        'songs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('artist', sa.String(255), nullable=False),
        sa.Column('album', sa.String(255), nullable=True),
        sa.Column('language', sa.String(10), nullable=True),
        sa.Column('lyrics', sa.Text(), nullable=True),
        sa.Column('synced_lyrics', sa.Text(), nullable=True),
        sa.Column('lrclib_id', sa.Integer(), nullable=True),
        sa.Column('duration', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_songs_id'), 'songs', ['id'], unique=False)
    op.create_index(op.f('ix_songs_lrclib_id'), 'songs', ['lrclib_id'], unique=False)

    # Create user_songs table with UUID foreign key
    op.create_table(
        'user_songs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', UUID(as_uuid=True), nullable=False),
        sa.Column('song_id', sa.Integer(), nullable=False),
        sa.Column('saved_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['song_id'], ['songs.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'song_id', name='uix_user_song'),
    )
    op.create_index(op.f('ix_user_songs_id'), 'user_songs', ['id'], unique=False)

    # Create vocabulary table with UUID foreign key
    op.create_table(
        'vocabulary',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', UUID(as_uuid=True), nullable=False),
        sa.Column('word', sa.String(255), nullable=False),
        sa.Column('translation', sa.String(255), nullable=False),
        sa.Column('context', sa.Text(), nullable=True),
        sa.Column('song_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['song_id'], ['songs.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_vocabulary_id'), 'vocabulary', ['id'], unique=False)
    op.create_index(op.f('ix_vocabulary_user_id'), 'vocabulary', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_vocabulary_user_id'), table_name='vocabulary')
    op.drop_index(op.f('ix_vocabulary_id'), table_name='vocabulary')
    op.drop_table('vocabulary')

    op.drop_index(op.f('ix_user_songs_id'), table_name='user_songs')
    op.drop_table('user_songs')

    op.drop_index(op.f('ix_songs_lrclib_id'), table_name='songs')
    op.drop_index(op.f('ix_songs_id'), table_name='songs')
    op.drop_table('songs')

    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
