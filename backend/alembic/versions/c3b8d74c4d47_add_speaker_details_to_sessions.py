"""add_speaker_details_to_sessions

Revision ID: c3b8d74c4d47
Revises: db14ca09ca76
Create Date: 2026-04-16 11:43:46.175311

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3b8d74c4d47'
down_revision: Union[str, None] = 'db14ca09ca76'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add speaker_bio and speaker_photo_url columns to sessions table
    op.add_column('sessions', sa.Column('speaker_bio', sa.Text(), nullable=True))
    op.add_column('sessions', sa.Column('speaker_photo_url', sa.String(), nullable=True))


def downgrade() -> None:
    # Remove speaker_bio and speaker_photo_url columns from sessions table
    op.drop_column('sessions', 'speaker_photo_url')
    op.drop_column('sessions', 'speaker_bio')
