"""add_explanation_to_topics

Revision ID: f1a2b3c4d5e6
Revises: ae37b0d5d772
Create Date: 2026-01-23 22:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f1a2b3c4d5e6'
down_revision: Union[str, Sequence[str], None] = 'ae37b0d5d772'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add explanation field to existing topics in levels table."""
    # Add explanation to existing topic objects
    # This adds an empty explanation to all existing topics
    op.execute("""
        UPDATE levels
        SET topics = (
            SELECT jsonb_agg(
                topic || jsonb_build_object('explanation', '')
            )
            FROM jsonb_array_elements(topics::jsonb) AS topic
        )
        WHERE topics IS NOT NULL AND topics::text != '[]'
    """)


def downgrade() -> None:
    """Remove explanation field from topics."""
    # Remove the explanation field from topic objects
    op.execute("""
        UPDATE levels
        SET topics = (
            SELECT jsonb_agg(
                topic - 'explanation'
            )
            FROM jsonb_array_elements(topics::jsonb) AS topic
        )
        WHERE topics IS NOT NULL
    """)
