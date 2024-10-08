# Phishing Email Detection System

## Description
A machine learning-based system designed to detect phishing emails. It analyzes email content, checks for suspicious URLs, and identifies phishing indicators using a trained model.

## Features
- Analyzes email content for phishing indicators
- Extracts URLs and checks against known phishing domains
- Detects phishing and genuine keywords
- Classifies emails as Phishing or Safe
- Provides risk level assessment

<!-- ## Live Demo
You can try the live demo of the application [here](https://your-live-hosting-link.com). -->


## Installation

1. Clone the repository:
```bash
git clone https://github.com/Kushal129/Phishing_Email_Detection_System.git
   
cd phishing-email-detection-system
```

2. Set up a virtual environment:
```bash
python -m venv venv
```
3. Install the required packages:
```bash
pip install -r requirements.txt
```

## Usage
1. Run the Flask application:
```bash
python app.py
```
2. Send a POST request to /analyze-email with the email content.


### Notes
- Make sure to create a `requirements.txt` file that lists all dependencies (Flask, Flask-CORS, NLTK, scikit-learn, pandas) for easy installation.

Feel free to make any additional adjustments as needed!
