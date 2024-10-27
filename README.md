# Finance Manager App

A full-stack finance management application built with React and Flask.

## Features
- Track income and expenses
- Monthly transaction history
- Summary dashboard with total income, expenses, and balance
- Pagination for transaction history
- Monthly filtering of transactions

## Tech Stack
- Frontend: React, TailwindCSS
- Backend: Flask, SQLite3
- Database: SQLite

## Setup

### Backend Setup
1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install flask flask-cors
```

4. Run the Flask server:
```bash
python app.py
```

### Frontend Setup
1. Navigate to the root directory and install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Environment Setup
The backend will create a SQLite database file (`finance.db`) automatically when first run.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
