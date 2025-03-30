import os
from flask import Flask, render_template, redirect, url_for, flash, request, jsonify, send_from_directory
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime
import uuid
from models import db, User, Request, Offer

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-for-testing')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configure uploads
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static/uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload
app.config['ALLOWED_EXTENSIONS'] = {'pdf', 'png', 'jpg', 'jpeg', 'gif'}

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize database with app
db.init_app(app)

# Initialize login manager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        user_type = request.form.get('user_type')  # 'buyer' or 'seller'
        
        # Check if user already exists by email
        existing_email = User.query.filter_by(email=email).first()
        if existing_email:
            flash('Email already registered. Please use a different email.', 'error')
            return redirect(url_for('register'))
        
        # Check if username already exists
        existing_username = User.query.filter_by(username=username).first()
        if existing_username:
            flash('Username already taken. Please choose a different username.', 'error')
            return redirect(url_for('register'))
        
        # Create new user
        new_user = User(
            username=username,
            email=email,
            password=generate_password_hash(password, method='pbkdf2:sha256'),
            user_type=user_type
        )
        
        # Add to database
        try:
            db.session.add(new_user)
            db.session.commit()
            flash('Registration successful! Please log in.', 'success')
            return redirect(url_for('login'))
        except Exception as e:
            db.session.rollback()
            flash(f'An error occurred: {str(e)}', 'error')
            return redirect(url_for('register'))
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        user = User.query.filter_by(email=email).first()
        
        if not user or not check_password_hash(user.password, password):
            flash('Please check your login details and try again.')
            return redirect(url_for('login'))
            
        login_user(user)
        return redirect(url_for('dashboard'))
    
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/dashboard')
@login_required
def dashboard():
    if current_user.user_type == 'buyer':
        # Fetch buyer's requests
        requests = Request.query.filter_by(user_id=current_user.id).all()
        return render_template('dashboard.html', requests=requests)
    else:
        # Fetch all available requests for sellers
        requests = Request.query.filter_by(status='open').all()
        # Fetch seller's offers
        offers = Offer.query.filter_by(seller_id=current_user.id).all()
        return render_template('dashboard.html', requests=requests, offers=offers)

@app.route('/post-request', methods=['GET', 'POST'])
@login_required
def post_request():
    if current_user.user_type != 'buyer':
        flash('Only buyers can post requests.')
        return redirect(url_for('dashboard'))
    
    if request.method == 'POST':
        title = request.form.get('title')
        description = request.form.get('description')
        budget = request.form.get('budget')
        company_name = request.form.get('company_name')
        
        # Create a unique folder for this request's files
        request_folder = str(uuid.uuid4())
        upload_path = os.path.join(app.config['UPLOAD_FOLDER'], request_folder)
        os.makedirs(upload_path, exist_ok=True)
        
        # Process uploaded files
        uploaded_files = []
        if 'files' in request.files:
            files = request.files.getlist('files')
            for file in files:
                if file and file.filename and allowed_file(file.filename):
                    filename = secure_filename(file.filename)
                    file_path = os.path.join(upload_path, filename)
                    file.save(file_path)
                    # Use forward slashes for path consistency
                    file_relative_path = os.path.join(request_folder, filename).replace('\\', '/')
                    uploaded_files.append(file_relative_path)
        
        # Convert list to comma-separated string for storage
        files_string = ','.join(uploaded_files) if uploaded_files else ''
        
        new_request = Request(
            title=title,
            description=description,
            budget=float(budget),
            user_id=current_user.id,
            status='open',
            files=files_string,
            company_name=company_name
        )
        
        db.session.add(new_request)
        db.session.commit()
        
        flash('Request posted successfully!')
        return redirect(url_for('dashboard'))
    
    return render_template('post_request.html')

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    # Ensure backslashes are converted to forward slashes for path handling
    filename = filename.replace('\\', '/')
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/request/<int:request_id>')
@login_required
def view_request(request_id):
    request_details = Request.query.get_or_404(request_id)
    offers = Offer.query.filter_by(request_id=request_id).all()
    
    return render_template('view_request.html', request=request_details, offers=offers)

@app.route('/edit-request/<int:request_id>', methods=['GET', 'POST'])
@login_required
def edit_request(request_id):
    request_details = Request.query.get_or_404(request_id)
    
    # Ensure only the owner can edit the request
    if current_user.id != request_details.user_id:
        flash('You are not authorized to edit this request.')
        return redirect(url_for('dashboard'))
    
    if request.method == 'POST':
        request_details.title = request.form.get('title')
        request_details.description = request.form.get('description')
        request_details.budget = float(request.form.get('budget'))
        request_details.company_name = request.form.get('company_name')
        
        # Handle new file uploads
        if 'files' in request.files:
            files = request.files.getlist('files')
            
            # Create folder if it doesn't exist
            if not request_details.files:
                request_folder = str(uuid.uuid4())
                upload_path = os.path.join(app.config['UPLOAD_FOLDER'], request_folder)
                os.makedirs(upload_path, exist_ok=True)
            else:
                # Get existing folder name from the first file path
                existing_files = request_details.files.split(',')
                if existing_files and len(existing_files[0].split('/')) > 0:
                    request_folder = existing_files[0].split('/')[0]
                    upload_path = os.path.join(app.config['UPLOAD_FOLDER'], request_folder)
                    os.makedirs(upload_path, exist_ok=True)
                elif existing_files and len(existing_files[0].split('\\')) > 0:
                    request_folder = existing_files[0].split('\\')[0]
                    upload_path = os.path.join(app.config['UPLOAD_FOLDER'], request_folder)
                    os.makedirs(upload_path, exist_ok=True)
                else:
                    request_folder = str(uuid.uuid4())
                    upload_path = os.path.join(app.config['UPLOAD_FOLDER'], request_folder)
                    os.makedirs(upload_path, exist_ok=True)
            
            # Process new uploads
            uploaded_files = []
            for file in files:
                if file and file.filename and allowed_file(file.filename):
                    filename = secure_filename(file.filename)
                    file_path = os.path.join(upload_path, filename)
                    file.save(file_path)
                    # Use forward slashes for path consistency
                    file_relative_path = os.path.join(request_folder, filename).replace('\\', '/')
                    uploaded_files.append(file_relative_path)
            
            # Combine with existing files if any
            existing_files = request_details.files.split(',') if request_details.files else []
            existing_files = [f for f in existing_files if f]  # Remove empty strings
            
            all_files = existing_files + uploaded_files
            request_details.files = ','.join(all_files)
        
        # Handle file deletions
        if 'delete_files' in request.form:
            files_to_delete = request.form.getlist('delete_files')
            existing_files = request_details.files.split(',') if request_details.files else []
            
            # Remove files to delete
            for file_path in files_to_delete:
                if file_path in existing_files:
                    # Delete the file from filesystem
                    try:
                        full_path = os.path.join(app.config['UPLOAD_FOLDER'], file_path.replace('\\', '/'))
                        if os.path.exists(full_path):
                            os.remove(full_path)
                    except Exception as e:
                        print(f"Error deleting file: {e}")  # Log but continue
                    
                    # Remove from list
                    existing_files.remove(file_path)
            
            # Update the files field
            request_details.files = ','.join(existing_files)
        
        db.session.commit()
        flash('Request updated successfully!')
        return redirect(url_for('view_request', request_id=request_id))
    
    return render_template('edit_request.html', request=request_details)

@app.route('/delete-request/<int:request_id>', methods=['POST'])
@login_required
def delete_request(request_id):
    request_details = Request.query.get_or_404(request_id)
    
    # Ensure only the owner can delete the request
    if current_user.id != request_details.user_id:
        flash('You are not authorized to delete this request.')
        return redirect(url_for('dashboard'))
    
    # Delete associated files
    if request_details.files:
        files = request_details.files.split(',')
        folder_path = None
        
        for file_path in files:
            if file_path:
                try:
                    # Normalize the path with forward slashes
                    normalized_path = file_path.replace('\\', '/')
                    
                    # Get the folder name from the first part of the path
                    folder = normalized_path.split('/')[0]
                    folder_path = os.path.join(app.config['UPLOAD_FOLDER'], folder)
                    
                    # Delete the individual file
                    file_full_path = os.path.join(app.config['UPLOAD_FOLDER'], normalized_path)
                    if os.path.exists(file_full_path):
                        os.remove(file_full_path)
                except Exception as e:
                    print(f"Error deleting file: {e}")  # Log but continue
        
        # Try to delete the folder if it exists and is empty
        try:
            if folder_path and os.path.exists(folder_path) and not os.listdir(folder_path):
                os.rmdir(folder_path)
        except Exception as e:
            print(f"Error deleting folder: {e}")  # Log but continue
    
    # Delete the request and related offers
    Offer.query.filter_by(request_id=request_id).delete()
    db.session.delete(request_details)
    db.session.commit()
    
    flash('Request deleted successfully!')
    return redirect(url_for('dashboard'))

@app.route('/make-offer/<int:request_id>', methods=['GET', 'POST'])
@login_required
def make_offer(request_id):
    if current_user.user_type != 'seller':
        flash('Only sellers can make offers.')
        return redirect(url_for('dashboard'))
    
    request_details = Request.query.get_or_404(request_id)
    
    if request.method == 'POST':
        price = request.form.get('price')
        description = request.form.get('description')
        
        new_offer = Offer(
            price=float(price),
            description=description,
            request_id=request_id,
            seller_id=current_user.id,
            status='pending'
        )
        
        db.session.add(new_offer)
        db.session.commit()
        
        flash('Offer submitted successfully!')
        return redirect(url_for('dashboard'))
    
    return render_template('make_offer.html', request=request_details)

@app.route('/accept-offer/<int:offer_id>', methods=['POST'])
@login_required
def accept_offer(offer_id):
    offer = Offer.query.get_or_404(offer_id)
    request_details = Request.query.get(offer.request_id)
    
    # Ensure only the request owner can accept offers
    if current_user.id != request_details.user_id:
        flash('You are not authorized to accept this offer.')
        return redirect(url_for('dashboard'))
    
    # Update offer status
    offer.status = 'accepted'
    request_details.status = 'assigned'
    
    # Mark other offers as rejected
    other_offers = Offer.query.filter_by(request_id=offer.request_id, status='pending').all()
    for other_offer in other_offers:
        if other_offer.id != offer.id:
            other_offer.status = 'rejected'
    
    db.session.commit()
    flash('Offer accepted successfully!')
    return redirect(url_for('dashboard'))

@app.route('/reject-offer/<int:offer_id>', methods=['POST'])
@login_required
def reject_offer(offer_id):
    # Get the offer
    offer = Offer.query.get_or_404(offer_id)
    request_details = Request.query.get(offer.request_id)
    
    # Ensure only the request owner can reject offers
    if current_user.id != request_details.user_id:
        flash('You are not authorized to reject this offer.', 'danger')
        return redirect(url_for('dashboard'))
    
    # Update offer status
    offer.status = 'rejected'
    db.session.commit()
    
    flash('Offer rejected successfully!', 'success')
    return redirect(url_for('view_request', request_id=request_details.id))

@app.route('/withdraw-offer/<int:offer_id>', methods=['POST'])
@login_required
def withdraw_offer(offer_id):
    # Get the offer
    offer = Offer.query.get_or_404(offer_id)
    
    # Ensure only the seller who made the offer can withdraw it
    if current_user.id != offer.seller_id:
        flash('You are not authorized to withdraw this offer.', 'danger')
        return redirect(url_for('dashboard'))
    
    # Update offer status or delete the offer
    db.session.delete(offer)
    db.session.commit()
    
    flash('Your offer has been withdrawn successfully.', 'success')
    return redirect(url_for('dashboard'))

@app.route('/offers/<int:offer_id>/update', methods=['POST'])
@login_required
def update_offer_status(offer_id):
    offer = Offer.query.get_or_404(offer_id)
    request_details = Request.query.get(offer.request_id)
    action = request.form.get('action')
    
    # Check user authorization
    if action in ['accept', 'reject'] and current_user.id != request_details.user_id:
        flash('You are not authorized to perform this action.', 'danger')
        return redirect(url_for('dashboard'))
    elif action == 'withdraw' and current_user.id != offer.seller_id:
        flash('You are not authorized to withdraw this offer.', 'danger')
        return redirect(url_for('dashboard'))
    
    # Process the action
    if action == 'accept':
        # Mark this offer as accepted
        offer.status = 'accepted'
        request_details.status = 'assigned'
        
        # Mark other offers as rejected
        other_offers = Offer.query.filter_by(request_id=offer.request_id, status='pending').all()
        for other_offer in other_offers:
            if other_offer.id != offer.id:
                other_offer.status = 'rejected'
        
        flash('Offer accepted successfully!', 'success')
    
    elif action == 'reject':
        offer.status = 'rejected'
        flash('Offer rejected successfully!', 'success')
    
    elif action == 'withdraw':
        db.session.delete(offer)
        flash('Your offer has been withdrawn successfully.', 'success')
    
    db.session.commit()
    
    # Redirect based on action
    if action == 'withdraw':
        return redirect(url_for('dashboard'))
    else:
        return redirect(url_for('view_request', request_id=request_details.id))

@app.route('/check-username', methods=['POST'])
def check_username():
    username = request.form.get('username')
    
    if not username:
        return jsonify({'valid': False, 'message': 'Username is required'})
    
    # Check if username already exists
    existing_user = User.query.filter_by(username=username).first()
    
    if existing_user:
        return jsonify({'valid': False, 'message': 'Username already taken'})
    else:
        return jsonify({'valid': True, 'message': 'Username is available'})

# View an offer details
@app.route('/offer/<int:offer_id>')
@login_required
def view_offer(offer_id):
    # Get the offer with the given ID
    offer = Offer.query.get_or_404(offer_id)
    
    # Check if the user is authorized to view this offer
    # Either the offer creator (seller) or the request owner (buyer) can view it
    if current_user.id != offer.seller_id and current_user.id != offer.request_details.user_id:
        flash('You are not authorized to view this offer.', 'danger')
        return redirect(url_for('dashboard'))
    
    return render_template('view_offer.html', offer=offer)

# Route to browse offers for a specific request
@app.route('/request/<int:request_id>/offers')
@login_required
def browse_offers(request_id):
    # Get the request with the given ID
    request_details = Request.query.get_or_404(request_id)
    
    # Check if the user is authorized to view these offers
    if current_user.user_type != 'buyer':
        flash('Only buyers can browse offers.', 'warning')
        return redirect(url_for('dashboard'))
        
    # Get all offers for this request
    offers = Offer.query.filter_by(request_id=request_id).all()
    
    # Check if there are offers
    if not offers:
        flash('There are no offers for this request yet.', 'info')
        return redirect(url_for('view_request', request_id=request_id))
    
    return render_template('browse_offers.html', request=request_details, offers=offers)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True) 