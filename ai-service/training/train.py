import os
import pandas as pd
import numpy as np
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

DATASET_PATH = os.path.join(os.path.dirname(__file__), "datasets", "align_compliance_pairs.csv")
MODEL_EXPORT_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "align_classifier.pkl")
VECTORIZER_EXPORT_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "align_vectorizer.pkl")

def train_pipeline():
    print(f"Loading synthetic compliance training dataset from {DATASET_PATH}...")
    df = pd.read_csv(DATASET_PATH)
    
    print(f"Dataset loaded. Total compliance pairs: {len(df)}")
    
    # Combine requirement and SOP text for feature extraction
    texts = (df['requirement_text'] + " " + df['sop_text']).tolist()
    vectorizer = TfidfVectorizer(max_features=500, stop_words='english')
    X = vectorizer.fit_transform(texts)
    y = df['label'].values
    
    print("Training Logistic Regression classifier...")
    clf = LogisticRegression(random_state=42, max_iter=500)
    clf.fit(X, y)
    
    os.makedirs(os.path.dirname(MODEL_EXPORT_PATH), exist_ok=True)
    with open(MODEL_EXPORT_PATH, "wb") as f:
        pickle.dump(clf, f)
    with open(VECTORIZER_EXPORT_PATH, "wb") as f:
        pickle.dump(vectorizer, f)
        
    print(f"Successfully trained and saved ML classifier artifact to {MODEL_EXPORT_PATH}")

if __name__ == "__main__":
    train_pipeline()
