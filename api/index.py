from flask import Flask, redirect
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import your app from the parent directory
from app import app as flask_app

@flask_app.route('/')
def home():
    return redirect('/dashboard')

# This is for Vercel - export the app variable
app = flask_app 