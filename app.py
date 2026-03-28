"""
app.py — Main Flask Application
ElecPro: Electrician Contractor Management System

Roles:
  admin       → full access (add/delete electricians, jobs, tasks, materials)
  electrician → can see own assigned jobs and tasks
  user        → read-only access (view electricians, jobs, tasks)
"""

from flask import (Flask, render_template, request,
                   redirect, url_for, session, flash)
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db, init_db

app = Flask(__name__)
app.secret_key = 'elecpro_secret_key_2026'   # needed for session/flash


# ════════════════════════════════════════════════════════════════
#  HELPER: role-checking decorators
# ════════════════════════════════════════════════════════════════

def login_required(f):
    """Redirect to login page if user is not logged in."""
    from functools import wraps
    @wraps(f)
    def wrapper(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in first.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return wrapper


def admin_required(f):
    """Only allow admins; redirect others to their own dashboard."""
    from functools import wraps
    @wraps(f)
    def wrapper(*args, **kwargs):
        if session.get('role') != 'admin':
            flash('Admin access only.', 'danger')
            return redirect(url_for('dashboard'))
        return f(*args, **kwargs)
    return login_required(wrapper)


# ════════════════════════════════════════════════════════════════
#  HOME PAGE
# ════════════════════════════════════════════════════════════════

@app.route('/')
def index():
    """Landing / Home page."""
    return render_template('index.html')


# ════════════════════════════════════════════════════════════════
#  REGISTER
# ════════════════════════════════════════════════════════════════

@app.route('/register', methods=['GET', 'POST'])
def register():
    """Show registration form (GET) and create a new user (POST)."""
    if request.method == 'POST':
        name     = request.form.get('name', '').strip()
        email    = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        role     = request.form.get('role', 'user')   # admin/electrician/user

        # Basic validation
        if not name or not email or not password:
            flash('All fields are required.', 'danger')
            return redirect(url_for('register'))

        db = get_db()
        # Check if email already exists
        existing = db.execute(
            'SELECT id FROM users WHERE email = ?', (email,)
        ).fetchone()

        if existing:
            flash('Email already registered. Please log in.', 'warning')
            db.close()
            return redirect(url_for('login'))

        # Save new user
        db.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            (name, email, generate_password_hash(password), role)
        )

        # If registering as electrician, also add to electricians table
        if role == 'electrician':
            phone = request.form.get('phone', '')
            skill = request.form.get('skill', '')
            db.execute(
                'INSERT INTO electricians (name, phone, skill, email) VALUES (?, ?, ?, ?)',
                (name, phone, skill, email)
            )

        db.commit()
        db.close()
        flash('Account created! Please log in.', 'success')
        return redirect(url_for('login'))

    return render_template('register.html')


# ════════════════════════════════════════════════════════════════
#  LOGIN
# ════════════════════════════════════════════════════════════════

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Show login form (GET) and validate credentials (POST)."""
    if request.method == 'POST':
        email    = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        role     = request.form.get('role', 'user')

        db   = get_db()
        user = db.execute(
            'SELECT * FROM users WHERE email = ? AND role = ?', (email, role)
        ).fetchone()
        db.close()

        if user and check_password_hash(user['password'], password):
            # Store user info in session
            session['user_id']   = user['id']
            session['user_name'] = user['name']
            session['role']      = user['role']
            flash(f'Welcome, {user["name"]}!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid email, password, or role. Please try again.', 'danger')

    return render_template('login.html')


# ════════════════════════════════════════════════════════════════
#  DASHBOARD — redirects based on role
# ════════════════════════════════════════════════════════════════

@app.route('/dashboard')
@login_required
def dashboard():
    """Send user to the correct dashboard based on their role."""
    role = session.get('role')
    if role == 'admin':
        return redirect(url_for('admin_dashboard'))
    elif role == 'electrician':
        return redirect(url_for('elec_dashboard'))
    else:
        return redirect(url_for('user_dashboard'))


# ════════════════════════════════════════════════════════════════
#  ADMIN DASHBOARD
# ════════════════════════════════════════════════════════════════

@app.route('/admin/dashboard')
@admin_required
def admin_dashboard():
    """Admin home: counts of electricians, jobs, tasks."""
    db   = get_db()
    elec_count = db.execute('SELECT COUNT(*) FROM electricians').fetchone()[0]
    job_count  = db.execute('SELECT COUNT(*) FROM jobs').fetchone()[0]
    task_count = db.execute('SELECT COUNT(*) FROM tasks').fetchone()[0]
    mat_count  = db.execute('SELECT COUNT(*) FROM materials').fetchone()[0]

    pending_jobs   = db.execute("SELECT COUNT(*) FROM jobs WHERE status='pending'").fetchone()[0]
    inprog_jobs    = db.execute("SELECT COUNT(*) FROM jobs WHERE status='in_progress'").fetchone()[0]
    completed_jobs = db.execute("SELECT COUNT(*) FROM jobs WHERE status='completed'").fetchone()[0]

    recent_jobs    = db.execute('SELECT * FROM jobs ORDER BY id DESC LIMIT 5').fetchall()
    db.close()

    return render_template('admin_dashboard.html',
                           elec_count=elec_count,
                           job_count=job_count,
                           task_count=task_count,
                           mat_count=mat_count,
                           pending_jobs=pending_jobs,
                           inprog_jobs=inprog_jobs,
                           completed_jobs=completed_jobs,
                           recent_jobs=recent_jobs)


# ════════════════════════════════════════════════════════════════
#  ELECTRICIAN DASHBOARD
# ════════════════════════════════════════════════════════════════

@app.route('/elec/dashboard')
@login_required
def elec_dashboard():
    """Electrician sees tasks assigned to them."""
    if session.get('role') not in ('electrician', 'admin'):
        flash('Access denied.', 'danger')
        return redirect(url_for('dashboard'))

    name = session.get('user_name')
    db   = get_db()

    # Tasks assigned to this electrician (matched by name)
    my_tasks = db.execute(
        'SELECT t.*, j.title as job_title FROM tasks t '
        'LEFT JOIN jobs j ON t.job_id = j.id '
        'WHERE t.assigned_to = ?', (name,)
    ).fetchall()

    my_jobs = db.execute(
        'SELECT DISTINCT j.* FROM jobs j '
        'INNER JOIN tasks t ON j.id = t.job_id '
        'WHERE t.assigned_to = ?', (name,)
    ).fetchall()
    db.close()

    return render_template('elec_dashboard.html',
                           my_tasks=my_tasks,
                           my_jobs=my_jobs)


# ════════════════════════════════════════════════════════════════
#  USER DASHBOARD (read-only)
# ════════════════════════════════════════════════════════════════

@app.route('/user/dashboard')
@login_required
def user_dashboard():
    """Regular user sees electricians and jobs (read-only)."""
    db   = get_db()
    electricians = db.execute('SELECT * FROM electricians').fetchall()
    jobs         = db.execute('SELECT * FROM jobs ORDER BY id DESC').fetchall()
    db.close()
    return render_template('user_dashboard.html',
                           electricians=electricians, jobs=jobs)


# ════════════════════════════════════════════════════════════════
#  ELECTRICIANS (Admin: CRUD  |  User/Elec: read-only)
# ════════════════════════════════════════════════════════════════

@app.route('/electricians', methods=['GET', 'POST'])
@login_required
def electricians():
    db = get_db()

    if request.method == 'POST':
        # Only admin can add
        if session.get('role') != 'admin':
            flash('Admin access only.', 'danger')
            return redirect(url_for('electricians'))

        name  = request.form.get('name', '').strip()
        phone = request.form.get('phone', '').strip()
        skill = request.form.get('skill', '').strip()
        email = request.form.get('email', '').strip()

        if name:
            db.execute(
                'INSERT INTO electricians (name, phone, skill, email) VALUES (?, ?, ?, ?)',
                (name, phone, skill, email)
            )
            db.commit()
            flash('Electrician added!', 'success')
        return redirect(url_for('electricians'))

    all_elec = db.execute('SELECT * FROM electricians').fetchall()
    db.close()
    return render_template('electricians.html', electricians=all_elec)


@app.route('/electricians/delete/<int:elec_id>', methods=['POST'])
@admin_required
def delete_electrician(elec_id):
    db = get_db()
    db.execute('DELETE FROM electricians WHERE id = ?', (elec_id,))
    db.commit()
    db.close()
    flash('Electrician deleted.', 'info')
    return redirect(url_for('electricians'))


# ════════════════════════════════════════════════════════════════
#  JOBS (Admin: CRUD  |  Others: read-only)
# ════════════════════════════════════════════════════════════════

@app.route('/jobs', methods=['GET', 'POST'])
@login_required
def jobs():
    db = get_db()

    if request.method == 'POST':
        if session.get('role') != 'admin':
            flash('Admin access only.', 'danger')
            return redirect(url_for('jobs'))

        title  = request.form.get('title', '').strip()
        desc   = request.form.get('description', '').strip()
        status = request.form.get('status', 'pending')

        if title:
            db.execute(
                'INSERT INTO jobs (title, description, status) VALUES (?, ?, ?)',
                (title, desc, status)
            )
            db.commit()
            flash('Job added!', 'success')
        return redirect(url_for('jobs'))

    all_jobs = db.execute('SELECT * FROM jobs ORDER BY id DESC').fetchall()
    db.close()
    return render_template('jobs.html', jobs=all_jobs)


@app.route('/jobs/delete/<int:job_id>', methods=['POST'])
@admin_required
def delete_job(job_id):
    db = get_db()
    db.execute('DELETE FROM jobs WHERE id = ?', (job_id,))
    db.commit()
    db.close()
    flash('Job deleted.', 'info')
    return redirect(url_for('jobs'))


# ════════════════════════════════════════════════════════════════
#  TASKS (Admin: CRUD  |  Others: read-only)
# ════════════════════════════════════════════════════════════════

@app.route('/tasks', methods=['GET', 'POST'])
@login_required
def tasks():
    db = get_db()

    if request.method == 'POST':
        if session.get('role') != 'admin':
            flash('Admin access only.', 'danger')
            return redirect(url_for('tasks'))

        job_id      = request.form.get('job_id')
        assigned_to = request.form.get('assigned_to', '').strip()
        description = request.form.get('description', '').strip()
        status      = request.form.get('status', 'pending')

        if assigned_to:
            db.execute(
                'INSERT INTO tasks (job_id, assigned_to, description, status) VALUES (?, ?, ?, ?)',
                (job_id, assigned_to, description, status)
            )
            db.commit()
            flash('Task added!', 'success')
        return redirect(url_for('tasks'))

    # Join with jobs to show job title
    all_tasks = db.execute(
        'SELECT t.*, j.title as job_title FROM tasks t '
        'LEFT JOIN jobs j ON t.job_id = j.id'
    ).fetchall()
    all_jobs  = db.execute('SELECT id, title FROM jobs').fetchall()
    db.close()
    return render_template('tasks.html', tasks=all_tasks, jobs=all_jobs)


@app.route('/tasks/delete/<int:task_id>', methods=['POST'])
@admin_required
def delete_task(task_id):
    db = get_db()
    db.execute('DELETE FROM tasks WHERE id = ?', (task_id,))
    db.commit()
    db.close()
    flash('Task deleted.', 'info')
    return redirect(url_for('tasks'))


# ════════════════════════════════════════════════════════════════
#  MATERIALS (Admin: CRUD  |  Others: read-only)
# ════════════════════════════════════════════════════════════════

@app.route('/materials', methods=['GET', 'POST'])
@login_required
def materials():
    db = get_db()

    if request.method == 'POST':
        if session.get('role') != 'admin':
            flash('Admin access only.', 'danger')
            return redirect(url_for('materials'))

        name     = request.form.get('name', '').strip()
        quantity = request.form.get('quantity', 0)
        unit     = request.form.get('unit', 'pcs').strip()
        job_id   = request.form.get('job_id') or None

        if name:
            db.execute(
                'INSERT INTO materials (name, quantity, unit, job_id) VALUES (?, ?, ?, ?)',
                (name, quantity, unit, job_id)
            )
            db.commit()
            flash('Material added!', 'success')
        return redirect(url_for('materials'))

    all_materials = db.execute(
        'SELECT m.*, j.title as job_title FROM materials m '
        'LEFT JOIN jobs j ON m.job_id = j.id'
    ).fetchall()
    all_jobs = db.execute('SELECT id, title FROM jobs').fetchall()
    db.close()
    return render_template('materials.html',
                           materials=all_materials, jobs=all_jobs)


@app.route('/materials/delete/<int:mat_id>', methods=['POST'])
@admin_required
def delete_material(mat_id):
    db = get_db()
    db.execute('DELETE FROM materials WHERE id = ?', (mat_id,))
    db.commit()
    db.close()
    flash('Material deleted.', 'info')
    return redirect(url_for('materials'))


# ════════════════════════════════════════════════════════════════
#  REPORTS
# ════════════════════════════════════════════════════════════════

@app.route('/reports')
@login_required
def reports():
    db = get_db()
    total_jobs       = db.execute('SELECT COUNT(*) FROM jobs').fetchone()[0]
    pending_jobs     = db.execute("SELECT COUNT(*) FROM jobs WHERE status='pending'").fetchone()[0]
    inprog_jobs      = db.execute("SELECT COUNT(*) FROM jobs WHERE status='in_progress'").fetchone()[0]
    completed_jobs   = db.execute("SELECT COUNT(*) FROM jobs WHERE status='completed'").fetchone()[0]
    total_tasks      = db.execute('SELECT COUNT(*) FROM tasks').fetchone()[0]
    total_elec       = db.execute('SELECT COUNT(*) FROM electricians').fetchone()[0]
    total_materials  = db.execute('SELECT COUNT(*) FROM materials').fetchone()[0]
    all_jobs         = db.execute('SELECT * FROM jobs ORDER BY id DESC').fetchall()
    db.close()

    return render_template('reports.html',
                           total_jobs=total_jobs,
                           pending_jobs=pending_jobs,
                           inprog_jobs=inprog_jobs,
                           completed_jobs=completed_jobs,
                           total_tasks=total_tasks,
                           total_elec=total_elec,
                           total_materials=total_materials,
                           all_jobs=all_jobs)


# ════════════════════════════════════════════════════════════════
#  PROFILE
# ════════════════════════════════════════════════════════════════

@app.route('/profile')
@login_required
def profile():
    db   = get_db()
    user = db.execute(
        'SELECT * FROM users WHERE id = ?', (session['user_id'],)
    ).fetchone()
    db.close()
    return render_template('profile.html', user=user)


# ════════════════════════════════════════════════════════════════
#  LOGOUT
# ════════════════════════════════════════════════════════════════

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('login'))


# ════════════════════════════════════════════════════════════════
#  RUN
# ════════════════════════════════════════════════════════════════

if __name__ == '__main__':
    init_db()          # Create tables if they do not exist
    app.run(debug=True)
