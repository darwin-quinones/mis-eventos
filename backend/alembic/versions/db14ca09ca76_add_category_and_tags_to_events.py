"""add_category_and_tags_to_events

Revision ID: db14ca09ca76
Revises: 24e327823a26
Create Date: 2026-04-15 23:32:11.707973

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'db14ca09ca76'
down_revision: Union[str, None] = '24e327823a26'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('events', sa.Column('category', sa.String(), nullable=True))
    op.add_column('events', sa.Column('tags', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('events', 'tags')
    op.drop_column('events', 'category')
