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
        
        # Add extracted dates
        for date_info in extracted_data.get('important_dates', []):
            agreement_date = AgreementDate(
                agreement_id=agreement.id,
                date_type=date_info['type'],
                date_value=date_info['date'],
                description=date_info.get('description'),
                is_recurring=date_info.get('is_recurring', False),
                recurrence_interval_months=date_info.get('recurrence_interval_months')
            )
            db.session.add(agreement_date)
        
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