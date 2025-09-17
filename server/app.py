import os
import pandas as pd
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import csv

# --- Machine Learning Imports ---
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.preprocessing import PolynomialFeatures, OneHotEncoder, StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.metrics import mean_absolute_error, accuracy_score
from sklearn.tree import DecisionTreeClassifier
from sklearn.naive_bayes import BernoulliNB
from sklearn.compose import make_column_transformer
from sklearn.cluster import KMeans

# --- CONFIGURATION ---
app = Flask(__name__)
CORS(app)
SALES_DATA_FILE = os.path.join('data', 'Online Sales Data.csv')
PRODUCTS_FILE = os.path.join('data', 'products.csv')

# --- Helper function to load the sales database ---
def load_sales_db():
    if not os.path.exists(SALES_DATA_FILE):
        return None
    df = pd.read_csv(SALES_DATA_FILE, on_bad_lines='skip')
    df.columns = df.columns.str.replace(' ', '')
    return df

# === API Endpoints for the Interactive Dashboard ===

@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        df = pd.read_csv(PRODUCTS_FILE)
        return jsonify(df.to_dict(orient='records'))
    except FileNotFoundError:
        return jsonify({"error": "Products file not found."}), 404

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    df = load_sales_db()
    if df is None: return jsonify({"error": "Sales data file not found."}), 404
    return jsonify(df.to_dict(orient='records'))

@app.route('/api/transactions', methods=['POST'])
def add_transaction():
    try:
        new_sale = request.get_json()
        last_id = 0
        try:
            sales_df = pd.read_csv(SALES_DATA_FILE, on_bad_lines='skip')
            if not sales_df.empty:
                last_id = sales_df['Transaction ID'].max()
        except (FileNotFoundError, pd.errors.EmptyDataError):
            last_id = 0
        new_id = int(last_id) + 1
        new_row = [
            new_id, datetime.now().strftime('%d/%m/%Y'), new_sale['ProductCategory'],
            new_sale['ProductName'], 1, float(new_sale['UnitPrice']),
            float(new_sale['UnitPrice']), new_sale['PaymentMethod']
        ]
        with open(SALES_DATA_FILE, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(new_row)
        response_record = {
            'Transaction ID': new_row[0], 'Date': new_row[1], 'Product Category': new_row[2],
            'Product Name': new_row[3], 'Units Sold': new_row[4], 'Unit Price': new_row[5],
            'Total Revenue': new_row[6], 'Payment Method': new_row[7]
        }
        return jsonify(response_record), 201
    except Exception as e:
        return jsonify({"error": f"Backend Error: {str(e)}"}), 500

# === NEW ENDPOINT for Chart Data ===
@app.route('/api/chart_data', methods=['GET'])
def get_chart_data():
    sales_df = load_sales_db()
    products_df = pd.read_csv(PRODUCTS_FILE)
    if sales_df is None or products_df is None:
        return jsonify({"error": "Data files not found."}), 404

    try:
        # 1. Get lists of categories and products
        categories = sales_df['ProductCategory'].unique().tolist()
        products = products_df.to_dict(orient='records')

        # 2. Prepare data for category sales over time (Line Chart)
        sales_df['Date'] = pd.to_datetime(sales_df['Date'], format='%d/%m/%Y')
        category_sales_over_time = sales_df.groupby(['Date', 'ProductCategory'])['TotalRevenue'].sum().reset_index()
        
        # Pivot data for easy frontend consumption
        category_sales_pivot = category_sales_over_time.pivot_table(index='Date', columns='ProductCategory', values='TotalRevenue', aggfunc='sum').fillna(0).reset_index()
        category_sales_data = {cat: category_sales_pivot[['Date', cat]].rename(columns={cat: 'TotalRevenue'}).to_dict('records') for cat in categories}


        # 3. Prepare data for product distribution within each category (Pie Chart)
        product_dist_by_cat = sales_df.groupby(['ProductCategory', 'ProductName'])['UnitsSold'].sum().reset_index()
        product_dist_data = {cat: product_dist_by_cat[product_dist_by_cat['ProductCategory'] == cat].to_dict('records') for cat in categories}

        # 4. Prepare data for individual product sales history (Bar Chart)
        product_sales_history = sales_df.groupby(['ProductName', 'Date'])['UnitsSold'].sum().reset_index()
        product_history_data = {
            name: product_sales_history[product_sales_history['ProductName'] == name][['Date', 'UnitsSold']].to_dict('records')
            for name in sales_df['ProductName'].unique()
        }

        return jsonify({
            "categories": categories,
            "products": products,
            "category_sales_over_time": category_sales_data,
            "product_distribution_by_category": product_dist_data,
            "product_sales_history": product_history_data
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# === Existing ML Prediction Endpoints ===
# ... (get_sales_forecast, get_product_classification, get_product_clustering functions remain unchanged) ...
@app.route('/api/predict/forecast', methods=['GET'])
def get_sales_forecast():
    model_type = request.args.get('model', 'best')
    df = load_sales_db()
    if df is None or len(df) < 10: return jsonify({"error": "Not enough data for forecast"}), 400
    try:
        df['Date'] = pd.to_datetime(df['Date'], format='%d/%m/%Y')
        df = df.sort_values('Date')
        df['TotalRevenue'] = pd.to_numeric(df['TotalRevenue'], errors='coerce').fillna(0)
        X = np.array(range(len(df))).reshape(-1, 1)
        y = df['TotalRevenue']
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)
        linear_model, polynomial_model = LinearRegression(), make_pipeline(PolynomialFeatures(degree=3), LinearRegression())
        linear_model.fit(X_train, y_train)
        linear_mae = mean_absolute_error(y_test, linear_model.predict(X_test))
        polynomial_model.fit(X_train, y_train)
        poly_mae = mean_absolute_error(y_test, polynomial_model.predict(X_test))
        if model_type == 'linear': final_model, final_mae = linear_model, linear_mae
        elif model_type == 'polynomial': final_model, final_mae = polynomial_model, poly_mae
        else: final_model, final_mae = (linear_model, linear_mae) if linear_mae < poly_mae else (polynomial_model, poly_mae)
        final_model.fit(X, y)
        future_days = 30
        future_X = np.array(range(len(df), len(df) + future_days)).reshape(-1, 1)
        forecast_values = final_model.predict(future_X)
        last_date = df['Date'].iloc[-1]
        forecast_dates = pd.to_datetime(last_date) + pd.to_timedelta(np.arange(1, future_days + 1), unit='d')
        forecast_data = [{"date": date.strftime('%Y-%m-%d'), "forecast": round(value, 2)} for date, value in zip(forecast_dates, forecast_values)]
        return jsonify({"forecast": forecast_data, "mae": round(final_mae, 2)})
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route('/api/predict/product_classification', methods=['GET'])
def get_product_classification():
    model_type = request.args.get('model', 'best')
    df = load_sales_db()
    if df is None: return jsonify({"error": "Dataset not found"}), 404
    try:
        product_sales = df.groupby('ProductName').agg(TotalUnitsSold=('UnitsSold', 'sum'), AveragePrice=('UnitPrice', 'mean'), Category=('ProductCategory', 'first')).reset_index()
        product_sales['SalesRank'] = product_sales['TotalUnitsSold'].rank(method='first')
        product_sales['Performance'] = pd.qcut(product_sales['SalesRank'], q=3, labels=['Slow-Moving', 'Average Seller', 'Best Seller'])
        X = product_sales[['Category', 'AveragePrice']]
        y = product_sales['Performance']
        preprocessor = make_column_transformer((OneHotEncoder(handle_unknown='ignore'), ['Category']), remainder='passthrough')
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
        models = {
            'Decision Tree': make_pipeline(preprocessor, DecisionTreeClassifier(random_state=42)),
            'Logistic Regression': make_pipeline(preprocessor, LogisticRegression(random_state=42, max_iter=1000)),
            'Naive Bayes': make_pipeline(preprocessor, BernoulliNB())
        }
        results = {}
        for name, model in models.items():
            model.fit(X_train, y_train)
            accuracy = accuracy_score(y_test, model.predict(X_test))
            results[name] = {'model': model, 'accuracy': accuracy}
        if model_type == 'decision_tree': final_model_name = 'Decision Tree'
        elif model_type == 'logistic_regression': final_model_name = 'Logistic Regression'
        elif model_type == 'naive_bayes': final_model_name = 'Naive Bayes'
        else: final_model_name = max(results, key=lambda k: results[k]['accuracy'])
        selected_model = results[final_model_name]['model']
        selected_accuracy = results[final_model_name]['accuracy']
        all_predictions = selected_model.predict(X)
        product_sales['PredictedPerformance'] = all_predictions
        model_used_name = f'Best ({final_model_name})' if model_type == 'best' else final_model_name
        return jsonify({"model_accuracy": round(selected_accuracy, 2), "model_used": model_used_name, "classified_products": product_sales.to_dict(orient='records')})
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route('/api/predict/product_clustering', methods=['GET'])
def get_product_clustering():
    df = load_sales_db()
    if df is None: return jsonify({"error": "Dataset not found"}), 404
    try:
        product_data = df.groupby('ProductName').agg(TotalUnitsSold=('UnitsSold', 'sum'), TotalRevenue=('TotalRevenue', 'sum'), AveragePrice=('UnitPrice', 'mean')).reset_index()
        if len(product_data) < 5: return jsonify({"error": "Not enough unique products to form clusters."}), 400
        features = ['TotalUnitsSold', 'TotalRevenue', 'AveragePrice']
        X = product_data[features]
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        optimal_k = 3
        kmeans = KMeans(n_clusters=optimal_k, n_init=10, random_state=42)
        product_data['Cluster'] = kmeans.fit_predict(X_scaled)
        return jsonify({"clustered_products": product_data.to_dict(orient='records'), "optimal_k": optimal_k})
    except Exception as e: return jsonify({"error": str(e)}), 500


# --- RUN THE APP ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)
