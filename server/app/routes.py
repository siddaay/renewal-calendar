from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from app import db
from app.models import Agreement, AgreementDate
from app.pdf_processor import process_pdf
from app.ai_extractor import extract_agreement_data
import os
from datetime import datetime, timedelta

bp = Blueprint('main', __name__)

ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def calculate_important_dates(agreement):
    """Calculate important dates based on agreement terms"""
    important_dates = []
    
    if not agreement.end_date:
        return important_dates
    
    # Always add expiration date
    important_dates.append({
        'type': 'expiration_date',
        'date': agreement.end_date,
        'description': f'{agreement.vendor} agreement expires',
        'is_recurring': False,
        'recurrence_interval_months': None
    })
    
    # Add renewal date (typically same as expiration for non-auto-renewing)
    important_dates.append({
        'type': 'renewal_date', 
        'date': agreement.end_date,
        'description': f'{agreement.vendor} agreement renewal due',
        'is_recurring': True,
        'recurrence_interval_months': agreement.term_length_months or 12
    })
    
    # Calculate notice deadline (assume 90 days before expiration if not specified)
    notice_days = 90  # Default notice period
    notice_date = agreement.end_date - timedelta(days=notice_days)
    
    # Only add notice deadline if it's in the future relative to effective date
    if not agreement.effective_date or notice_date > agreement.effective_date:
        important_dates.append({
            'type': 'notice_deadline',
            'date': notice_date,
            'description': f'{agreement.vendor} renewal notice deadline ({notice_days} days before expiration)',
            'is_recurring': False,
            'recurrence_interval_months': None
        })
    
    return important_dates

def update_agreement_dates(agreement):
    """Update calendar events for an agreement"""
    try:
        # Delete existing dates for this agreement
        AgreementDate.query.filter_by(agreement_id=agreement.id).delete()
        
        # Calculate new important dates
        important_dates = calculate_important_dates(agreement)
        
        # Add new dates
        for date_info in important_dates:
            agreement_date = AgreementDate(
                agreement_id=agreement.id,
                date_type=date_info['type'],
                date_value=date_info['date'],
                description=date_info['description'],
                is_recurring=date_info['is_recurring'],
                recurrence_interval_months=date_info['recurrence_interval_months']
            )
            db.session.add(agreement_date)
        
        return True
    except Exception as e:
        current_app.logger.error(f"Error updating agreement dates: {str(e)}")
        return False

@bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()})

@bp.route('/upload', methods=['POST'])
def upload_pdf():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed. Please upload a PDF.'}), 400
        
        # Save file
        filename = secure_filename(file.filename)
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)
        file.save(filepath)
        
        # Process PDF
        raw_text = process_pdf(filepath)
        
        # Extract data using AI
        extracted_data = extract_agreement_data(raw_text)
        
        # Save to database
        agreement = Agreement(
            filename=filename,
            vendor=extracted_data.get('vendor'),
            buyer=extracted_data.get('buyer'),
            order_date=extracted_data.get('order_date'),
            effective_date=extracted_data.get('effective_date'),
            end_date=extracted_data.get('end_date'),
            term_length_months=extracted_data.get('term_length_months'),
            total_value=extracted_data.get('total_value'),
            raw_text=raw_text
        )
        
        db.session.add(agreement)
        db.session.flush()  # Get the ID
        
        # Add extracted dates (prefer AI-extracted dates if available)
        ai_dates = extracted_data.get('important_dates', [])
        if ai_dates:
            # Use AI-extracted dates
            for date_info in ai_dates:
                agreement_date = AgreementDate(
                    agreement_id=agreement.id,
                    date_type=date_info['type'],
                    date_value=date_info['date'],
                    description=date_info.get('description'),
                    is_recurring=date_info.get('is_recurring', False),
                    recurrence_interval_months=date_info.get('recurrence_interval_months')
                )
                db.session.add(agreement_date)
        else:
            # Fallback to calculated dates
            update_agreement_dates(agreement)
        
        db.session.commit()
        
        # Clean up file
        os.remove(filepath)
        
        return jsonify({
            'message': 'PDF processed successfully',
            'agreement_id': agreement.id,
            'agreement': agreement.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Upload error: {str(e)}")
        return jsonify({'error': 'Failed to process PDF'}), 500

@bp.route('/agreements', methods=['GET'])
def get_agreements():
    try:
        agreements = Agreement.query.all()
        return jsonify([agreement.to_dict() for agreement in agreements])
    except Exception as e:
        current_app.logger.error(f"Get agreements error: {str(e)}")
        return jsonify({'error': 'Failed to fetch agreements'}), 500

@bp.route('/calendar', methods=['GET'])
def get_calendar():
    try:
        # Get optional date range from query params
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        query = db.session.query(AgreementDate, Agreement).join(Agreement)
        
        if start_date:
            query = query.filter(AgreementDate.date_value >= start_date)
        if end_date:
            query = query.filter(AgreementDate.date_value <= end_date)
        
        results = query.order_by(AgreementDate.date_value).all()
        
        calendar_events = []
        for agreement_date, agreement in results:
            calendar_events.append({
                'id': agreement_date.id,
                'date': agreement_date.date_value.isoformat(),
                'type': agreement_date.date_type,
                'description': agreement_date.description,
                'vendor': agreement.vendor,
                'filename': agreement.filename,
                'agreement_id': agreement.id,
                'is_recurring': agreement_date.is_recurring
            })
        
        return jsonify(calendar_events)
        
    except Exception as e:
        current_app.logger.error(f"Calendar error: {str(e)}")
        return jsonify({'error': 'Failed to fetch calendar data'}), 500

@bp.route('/calendar/upcoming', methods=['GET'])
def get_upcoming_dates():
    """Get dates in the next 90 days"""
    try:
        today = datetime.now().date()
        future_date = today + timedelta(days=90)
        
        query = db.session.query(AgreementDate, Agreement).join(Agreement).filter(
            AgreementDate.date_value.between(today, future_date)
        ).order_by(AgreementDate.date_value)
        
        results = query.all()
        
        upcoming_events = []
        for agreement_date, agreement in results:
            upcoming_events.append({
                'id': agreement_date.id,
                'date': agreement_date.date_value.isoformat(),
                'type': agreement_date.date_type,
                'description': agreement_date.description,
                'vendor': agreement.vendor,
                'filename': agreement.filename,
                'days_until': (agreement_date.date_value - today).days
            })
        
        return jsonify(upcoming_events)
        
    except Exception as e:
        current_app.logger.error(f"Upcoming dates error: {str(e)}")
        return jsonify({'error': 'Failed to fetch upcoming dates'}), 500

@bp.route('/agreements/<agreement_id>', methods=['DELETE'])
def delete_agreement(agreement_id):
    """Delete an agreement and all its associated data"""
    try:
        # Find the agreement
        agreement = Agreement.query.get(agreement_id)
        if not agreement:
            return jsonify({'error': 'Agreement not found'}), 404
        
        # Store vendor name for response
        vendor_name = agreement.vendor
        
        # Delete the agreement (cascading deletes will handle related data)
        db.session.delete(agreement)
        db.session.commit()
        
        return jsonify({
            'message': f'Successfully deleted {vendor_name} agreement',
            'deleted_id': agreement_id
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Delete agreement error: {str(e)}")
        return jsonify({'error': 'Failed to delete agreement'}), 500

@bp.route('/agreements/<agreement_id>', methods=['PUT'])
def update_agreement(agreement_id):
    """Update an agreement's details and sync calendar events"""
    try:
        # Find the agreement
        agreement = Agreement.query.get(agreement_id)
        if not agreement:
            return jsonify({'error': 'Agreement not found'}), 404
        
        # Get the JSON data from request
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Track if date-related fields changed
        dates_changed = False
        old_end_date = agreement.end_date
        old_effective_date = agreement.effective_date
        old_term_length = agreement.term_length_months
        
        # Update fields if provided
        if 'vendor' in data:
            agreement.vendor = data['vendor'].strip()
        
        if 'effective_date' in data:
            try:
                from dateutil import parser as date_parser
                new_effective_date = date_parser.parse(data['effective_date']).date()
                if new_effective_date != old_effective_date:
                    agreement.effective_date = new_effective_date
                    dates_changed = True
            except (ValueError, TypeError):
                return jsonify({'error': 'Invalid effective_date format'}), 400
        
        if 'end_date' in data:
            try:
                from dateutil import parser as date_parser
                new_end_date = date_parser.parse(data['end_date']).date()
                if new_end_date != old_end_date:
                    agreement.end_date = new_end_date
                    dates_changed = True
            except (ValueError, TypeError):
                return jsonify({'error': 'Invalid end_date format'}), 400
        
        if 'term_length_months' in data:
            try:
                new_term_length = int(data['term_length_months'])
                if new_term_length < 1:
                    return jsonify({'error': 'Term length must be at least 1 month'}), 400
                if new_term_length != old_term_length:
                    agreement.term_length_months = new_term_length
                    dates_changed = True
            except (ValueError, TypeError):
                return jsonify({'error': 'Invalid term_length_months'}), 400
        
        if 'total_value' in data:
            try:
                agreement.total_value = float(data['total_value'])
                if agreement.total_value < 0:
                    return jsonify({'error': 'Total value must be non-negative'}), 400
            except (ValueError, TypeError):
                return jsonify({'error': 'Invalid total_value'}), 400
        
        if 'currency' in data:
            agreement.currency = data['currency']
        
        # Validate that end_date is after effective_date
        if agreement.effective_date and agreement.end_date:
            if agreement.end_date <= agreement.effective_date:
                return jsonify({'error': 'End date must be after effective date'}), 400
        
        # Update the updated_at timestamp
        agreement.updated_at = datetime.utcnow()
        
        # If any date-related fields changed, update calendar events
        if dates_changed:
            current_app.logger.info(f"Dates changed for agreement {agreement_id}, updating calendar events")
            if not update_agreement_dates(agreement):
                return jsonify({'error': 'Failed to update calendar events'}), 500
        
        # Commit all changes
        db.session.commit()
        
        return jsonify({
            'message': f'Successfully updated {agreement.vendor} agreement',
            'agreement': agreement.to_dict(),
            'calendar_updated': dates_changed
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Update agreement error: {str(e)}")
        return jsonify({'error': 'Failed to update agreement'}), 500