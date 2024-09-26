from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
import nltk
import json
from urllib.parse import urlparse

# Download NLTK resources if not already downloaded
nltk.download("punkt", quiet=True)
nltk.download("stopwords", quiet=True)

app = Flask(__name__)
CORS(app)


# Load known phishing domains from a text file
def load_known_phishing_domains():
    with open("known_phishing_domains.txt", "r") as f:
        domains = {line.strip() for line in f if line.strip()}
    # print("Known Phishing Domains Loaded:", domains)  # Debugging line
    return domains


# Load phishing and genuine keywords from JSON file
def load_keywords():
    with open("phishing_keywords.json", "r") as f:
        data = json.load(f)
        return data["phishing_keywords"], data["genuine_keywords"]


# Initialize phishing and genuine keywords and known phishing domains
phishing_keywords, genuine_keywords = load_keywords()
known_phishing_domains = load_known_phishing_domains()


# Load training data from a file
def load_training_data(file_path):
    training_data = []
    with open(file_path, "r") as f:
        for line in f:
            label, text = line.strip().split(",", 1)  # Split on the first comma
            training_data.append(
                (text.strip(), int(label.strip()))
            )  # Append tuple (text, label)
    return training_data


# Load training data
training_data = load_training_data("training_data.txt")

# Prepare the dataset
df = pd.DataFrame(training_data, columns=["text", "label"])
X = df["text"]
y = df["label"]

# Vectorization
vectorizer = CountVectorizer(stop_words="english")
X_vectorized = vectorizer.fit_transform(X)

# Train the model
model = MultinomialNB()
model.fit(X_vectorized, y)


# Extract URLs from the email content and return additional metadata
def extract_links(email_content):
    url_pattern = r"http[s]?://[^\s]+"
    links = re.findall(url_pattern, email_content)
    link_data = []

    for link in links:
        cleaned_link = link.rstrip(")")  # Remove trailing parentheses
        is_phishing = is_phishing_domain(cleaned_link)

        link_data.append({"url": cleaned_link, "is_phishing": is_phishing})

    # print("Extracted Links:", link_data)
    return link_data


# Check if a URL is a known phishing domain
def is_phishing_domain(link):
    domain = urlparse(link).netloc.replace("www.", "")
    # print(f"Checking if '{domain}' is a phishing domain.")
    return domain in known_phishing_domains


@app.route("/analyze-email", methods=["POST"])
def analyze_email():
    email_content = request.form["email_content"]
    email_content_cleaned = re.sub(r"\W+", " ", email_content).lower()

    # Extract links from the email content
    links = extract_links(email_content)

    detected_phrases = []
    phishing_urls = []
    detected_phishing_keywords = []
    detected_genuine_keywords = []

    # Check for phishing indicators in URLs
    for link in links:
        if link["is_phishing"]:
            detected_phrases.append(link["url"])
            phishing_urls.append(
                {"url": link["url"], "is_phishing": link["is_phishing"]}
            )

    # Check for phishing and genuine keywords in the email content
    for keyword in phishing_keywords:
        if keyword.lower() in email_content_cleaned:
            detected_phishing_keywords.append(keyword)

    for keyword in genuine_keywords:
        if keyword.lower() in email_content_cleaned:
            detected_genuine_keywords.append(keyword)

    # Analyze the email content using the model
    email_vectorized = vectorizer.transform([email_content])
    is_phishing_model = model.predict(email_vectorized)[0]

    # Update phishing detection logic
    is_phishing_email = (
        is_phishing_model == 1
        or len(phishing_urls) > 0
        or (
            len(detected_phishing_keywords) > 0
            and any(link["is_phishing"] for link in links)
        )
    )

    # Determine risk level based on detected phishing keywords
    if is_phishing_email:
        sensitive_keywords = [
            kw for kw in detected_phishing_keywords if kw in phishing_keywords
        ]
        num_sensitive_keywords = len(sensitive_keywords)

        if num_sensitive_keywords > 3:
            risk_level = "High"
        elif num_sensitive_keywords > 1:
            risk_level = "Medium"
        else:
            risk_level = "Low"
    else:
        risk_level = "Totally Safe"

    # Improve the result construction
    result = {
        "is_phishing": bool(is_phishing_email),
        "detected_phrases": detected_phrases,
        "phishing_urls": (
            phishing_urls
            if phishing_urls
            else [{"url": "None Detected", "is_phishing": False}]
        ),
        "detected_phishing_keywords": detected_phishing_keywords,
        "detected_genuine_keywords": detected_genuine_keywords,
        "email_type": "Phishing" if is_phishing_email else "Safe",
        "risk_level": risk_level,
    }

    print("Result to return:", result)

    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True)
