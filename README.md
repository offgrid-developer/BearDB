# BearDB

**BearDB** is a hybrid database management platform designed to bridge the power of **Excel**, **VectorDB**, and a **high-performance C++ core engine**.  
It provides both a **frontend dashboard** and **REST API** backend for managing structured data efficiently.

---

## Features

-  High-performance C++ core engine for computation-heavy tasks  
-  Upload, parse, and convert Excel, CSV, and ODS data  
-  Flask backend API for CRUD operations  
-  React + Bootstrap frontend for data visualization  
-  VectorDB for fast vector-based queries and analytics  
-  SSH-ready deployment via GitHub, Ngrok, or Render  

---

##  Tech Stack

| Layer | Technology |
|-------|-------------|
| **Core Engine** | ⚙️ C++ (High-performance data processing) |
| **Backend API** |  Flask (Python) |
| **Database** | VectorDB |
| **Frontend** |  React + Bootstrap |
| **File Support** |  Excel (.xlsx), CSV, ODS |
| **Hosting** | GitHub + Ngrok or Render (optional) |


    ┌────────────────────────────┐
    │        Frontend UI         │
    │  (React + Bootstrap)       │
    └────────────┬───────────────┘
                 │ REST / JSON API
    ┌────────────┴───────────────┐
    │       Flask Backend        │
    │  (Python interface layer)  │
    └────────────┬───────────────┘
                 │ FFI / API Bridge
    ┌────────────┴───────────────┐
    │       C++ Core Engine      │
    │   (High-speed processor)   │
    └────────────┬───────────────┘
                 │
    ┌────────────┴───────────────┐
    │         VectorDB           │
    │ (Optimized data storage)   │
    └────────────────────────────┘


---

## ⚙️ Setup Instructions

### Clone the repository

```bash
git clone git@github.com:offgrid-developer/BearDB.git
cd BearDB

Backend Setup (Python + Flask)
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt


 C++ Core Engine

Ensure you have a C++ compiler installed (g++ or clang++)

Build the engine (example using make):cd backend/core
make

 Run Flask API
cd ~/BearDB/backend
export FLASK_APP=app.py
export FLASK_ENV=development
flask run
Access at http://127.0.0.1:5000/


 Frontend Setup
cd ~/BearDB/frontend
npm install
npm run dev

Access at http://127.0.0.1:5173/


🛠 Developer Notes

Python ↔ C++ Integration:

Using ctypes or pybind11 to call the C++ core engine functions from Flask.

Shared libraries should be versioned and placed in /backend/core/build/.

VectorDB:

Used for storing and querying vectorized representations of datasets.

Supports fast similarity searches and high-dimensional indexing.

File Handling:

Excel, CSV, and ODS files are parsed and stored efficiently in VectorDB.

Frontend provides CSV download and upload forms for user convenience.

Deployment Tips:

Frontend: Can be deployed on GitHub Pages or Vercel.

Backend: Can be deployed on Render, Railway, or any VPS with Python + C++ installed.

Ensure C++ shared libraries are accessible on the deployment server.

 Future Plans

Add user authentication and role-based dashboards

Automated ETL pipelines from Excel to VectorDB

Cloud backups and snapshot support

Real-time analytics via React charts

�� Author

Offgrid Developer
 developer@offgridconsultingltd.com

 Offgrid Consulting Ltd

🛡 License

This project is licensed under the MIT License — see LICENSE for details.

🔖 Badges (Optional)
![Python](https://img.shields.io/badge/Python-3.11-blue)
![Flask](https://img.shields.io/badge/Flask-2.3-green)
![C++](https://img.shields.io/badge/C%2B%2B-17-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)
