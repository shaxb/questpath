"""add events table

Revision ID: add_events_table
Revises: 
Create Date: 2026-01-26 11:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_events_table'
down_revision: Union[str, None] = '58a0cb873b23'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'events',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('event_type', sa.String(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('data', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_events_user_id', 'events', ['user_id'])
    op.create_index('idx_events_type', 'events', ['event_type'])
    op.create_index('idx_events_created_at', 'events', ['created_at'])


def downgrade() -> None:
    op.drop_index('idx_events_created_at', table_name='events')
    op.drop_index('idx_events_type', table_name='events')
    op.drop_index('idx_events_user_id', table_name='events')
    op.drop_table('events')
