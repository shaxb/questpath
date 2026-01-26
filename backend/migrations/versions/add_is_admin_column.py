"""add is_admin column

Revision ID: add_is_admin_column
Revises: add_events_table
Create Date: 2026-01-26

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_is_admin_column'
down_revision = 'add_events_table'
branch_labels = None
depends_on = None


def upgrade():
    # Add is_admin column with default False
    op.add_column('users', sa.Column('is_admin', sa.Boolean(), nullable=False, server_default='false'))
    # Create index for faster admin queries
    op.create_index('ix_users_is_admin', 'users', ['is_admin'])


def downgrade():
    # Drop index first
    op.drop_index('ix_users_is_admin', table_name='users')
    # Drop column
    op.drop_column('users', 'is_admin')
