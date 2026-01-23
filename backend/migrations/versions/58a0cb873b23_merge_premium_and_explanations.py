"""merge_premium_and_explanations

Revision ID: 58a0cb873b23
Revises: 7a6931a29692, f1a2b3c4d5e6
Create Date: 2026-01-23 22:42:26.586400

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '58a0cb873b23'
down_revision: Union[str, Sequence[str], None] = ('7a6931a29692', 'f1a2b3c4d5e6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
