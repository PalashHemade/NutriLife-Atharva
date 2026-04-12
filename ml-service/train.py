# =========================================
# NutriLife Optimized Random Forest Model
# =========================================
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

# -------------------------------
# 1. Load Dataset
# -------------------------------
print("Loading dataset...")
dataset = pd.read_csv("diet_recommendations_dataset.csv")
print(f"Dataset shape: {dataset.shape}")

# -------------------------------
# 2. Drop Unwanted Features
# -------------------------------
columns_to_remove = [
    "Patient_ID",
    "Disease_Type",
    "Severity",
    "Physical_Activity_Level",
    "Adherence_to_Diet_Plan",
    "Dietary_Nutrient_Imbalance_Score"
]
dataset = dataset.drop(columns=columns_to_remove)
dataset = dataset.dropna()
print(f"After dropping columns & NaN: {dataset.shape}")

# -------------------------------
# 3. Separate Features
# -------------------------------
target_column = "Diet_Recommendation"

categorical_features = [
    "Gender",
    "Dietary_Restrictions",
    "Allergies",
    "Preferred_Cuisine"
]

numerical_features = [col for col in dataset.columns
                      if col not in categorical_features + [target_column]]

print(f"Numerical features ({len(numerical_features)}): {numerical_features}")
print(f"Categorical features ({len(categorical_features)}): {categorical_features}")

# -------------------------------
# 4. Encode Target
# -------------------------------
target_encoder = LabelEncoder()
dataset[target_column] = target_encoder.fit_transform(dataset[target_column])
print(f"Diet classes: {list(target_encoder.classes_)}")

X = dataset.drop(columns=[target_column])
y = dataset[target_column]

# -------------------------------
# 5. Preprocessing Pipeline
# -------------------------------
preprocessor = ColumnTransformer(
    transformers=[
        ("num", StandardScaler(), numerical_features),
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features)
    ]
)

# -------------------------------
# 6. Model Pipeline
# -------------------------------
pipeline = Pipeline(steps=[
    ("preprocessor", preprocessor),
    ("classifier", RandomForestClassifier(random_state=42))
])

# -------------------------------
# 7. Hyperparameter Tuning
# -------------------------------
param_grid = {
    "classifier__n_estimators": [100, 200],
    "classifier__max_depth": [None, 10, 20],
    "classifier__min_samples_split": [2, 5]
}

print("\nStarting GridSearchCV (this may take a minute)...")
grid_search = GridSearchCV(
    pipeline,
    param_grid,
    cv=3,
    n_jobs=-1,
    verbose=1
)

# -------------------------------
# 8. Train-Test Split
# -------------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# -------------------------------
# 9. Train Model
# -------------------------------
grid_search.fit(X_train, y_train)
best_model = grid_search.best_estimator_

# -------------------------------
# 10. Evaluation
# -------------------------------
y_pred = best_model.predict(X_test)

print("\n" + "=" * 50)
print("MODEL EVALUATION RESULTS")
print("=" * 50)
print(f"Best Parameters: {grid_search.best_params_}")
print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
print(f"\nConfusion Matrix:\n{confusion_matrix(y_test, y_pred)}")
print(f"\nClassification Report:\n{classification_report(y_test, y_pred, target_names=target_encoder.classes_)}")

# -------------------------------
# 11. Save Model
# -------------------------------
joblib.dump(best_model, "nutrilife_pipeline.pkl")
joblib.dump(target_encoder, "target_encoder.pkl")
print("\n✅ Model saved: nutrilife_pipeline.pkl")
print("✅ Encoder saved: target_encoder.pkl")
