# Smart Dashboard

A comprehensive web application for analyzing sales data with interactive visualizations and machine learning predictions.

## Features

- **Dashboard**: Overview of key metrics and statistics.
- **Transactions**: View, add, and manage sales transactions.
- **Charts**: Visualize sales data with line, pie, and bar charts.
- **Forecast**: Predict future sales using linear and polynomial regression.
- **Classification**: Classify products into performance categories using ML models.
- **Clustering**: Group products into clusters based on sales patterns.

## Tech Stack

### Frontend
- React 19
- Vite
- React Router DOM
- Axios
- Recharts

### Backend
- Flask
- Pandas
- Scikit-learn
- NumPy

## Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd smart-dashboard
   ```

2. Install frontend dependencies:
   ```bash
   cd client
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd ../server
   pip install flask flask-cors pandas numpy scikit-learn
   ```

## Usage

1. Start the backend server:
   ```bash
   cd server
   python app.py
   ```
   The server will run on http://localhost:5000

2. Start the frontend:
   ```bash
   cd client
   npm run dev
   ```
   The app will be available at http://localhost:5173

## API Endpoints

- `GET /api/products` - Retrieve product list
- `GET /api/transactions` - Retrieve transactions
- `POST /api/transactions` - Add new transaction
- `GET /api/chart_data` - Get data for charts
- `GET /api/predict/forecast` - Sales forecast
- `GET /api/predict/product_classification` - Product classification
- `GET /api/predict/product_clustering` - Product clustering

## Data

The application uses CSV files located in `server/data/`:
- `Online Sales Data.csv` - Sales transactions
- `Products.csv` - Product catalog

## License

This project is licensed under the MIT License - see the LICENSE file for details.
