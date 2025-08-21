from app import db
from datetime import datetime
import uuid

def generate_uuid():
    """Generate UUID string for SQLite compatibility"""
    return str(uuid.uuid4())

class Agreement(db.Model):
    __tablename__ = 'agreements'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    filename = db.Column(db.String(255), nullable=False)
    vendor = db.Column(db.String(255))
    buyer = db.Column(db.String(255))
    order_date = db.Column(db.Date)
    effective_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    term_length_months = db.Column(db.Integer)
    total_value = db.Column(db.Numeric(12, 2))
    currency = db.Column(db.String(3), default='USD')
    raw_text = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    dates = db.relationship('AgreementDate', backref='agreement', cascade='all, delete-orphan')
    products = db.relationship('Product', backref='agreement', cascade='all, delete-orphan')
    renewal_terms = db.relationship('RenewalTerm', backref='agreement', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            'vendor': self.vendor,
            'buyer': self.buyer,
            'order_date': self.order_date.isoformat() if self.order_date else None,
            'effective_date': self.effective_date.isoformat() if self.effective_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'term_length_months': self.term_length_months,
            'total_value': float(self.total_value) if self.total_value else None,
            'currency': self.currency,
            'created_at': self.created_at.isoformat()
        }

class AgreementDate(db.Model):
    __tablename__ = 'agreement_dates'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    agreement_id = db.Column(db.String(36), db.ForeignKey('agreements.id'), nullable=False)
    date_type = db.Column(db.String(50), nullable=False)  # 'renewal_date', 'notice_deadline', 'expiration_date'
    date_value = db.Column(db.Date, nullable=False)
    description = db.Column(db.Text)
    is_recurring = db.Column(db.Boolean, default=False)
    recurrence_interval_months = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'agreement_id': self.agreement_id,
            'date_type': self.date_type,
            'date_value': self.date_value.isoformat(),
            'description': self.description,
            'is_recurring': self.is_recurring,
            'recurrence_interval_months': self.recurrence_interval_months
        }

class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    agreement_id = db.Column(db.String(36), db.ForeignKey('agreements.id'), nullable=False)
    product_name = db.Column(db.String(255))
    quantity = db.Column(db.Integer)
    unit_price = db.Column(db.Numeric(12, 2))
    total_price = db.Column(db.Numeric(12, 2))
    term_months = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class RenewalTerm(db.Model):
    __tablename__ = 'renewal_terms'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    agreement_id = db.Column(db.String(36), db.ForeignKey('agreements.id'), nullable=False)
    auto_renewal = db.Column(db.Boolean, default=False)
    notice_period_days = db.Column(db.Integer)
    notice_description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)