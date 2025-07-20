# Organiz-it

Organiz-it is a productivity tool designed to help users manage tasks, profiles, and workflows efficiently. It features a modern web interface and a robust backend, making it suitable for both personal and team use.

## Features

- User authentication and profile management
- Task and workflow organization
- Responsive web interface (React + Electron)
- RESTful API backend (FastAPI)
- Cross-platform desktop support via Electron
- Data storage using MongoDB and JSON files

## Tech Stack

- **Frontend:** React, Electron, Vite
- **Backend:** Python (FastAPI)
- **Database:** MongoDB, JSON file storage
- **Other:** Node.js, npm, Vite, Electron

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- Python 3.8+
- MongoDB (local or cloud instance)
- pip, virtualenv

### Installation

#### Backend

```bash
cd app-backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Ensure MongoDB is running and accessible
python main.py
```

#### Frontend

```bash
cd client
npm install
npm run dev
```

#### (Optional) Electron Desktop App

```bash
cd client/electron
npm install
npm start
```

## Usage

- Access the web app at `http://localhost:3000` (or the port shown in your terminal).
- Register or log in to manage your profiles and tasks.
- Use the Electron app for a desktop experience.
- Data is stored in MongoDB for persistent storage and JSON files for certain configurations or local data.

## Folder Structure

```
Organiz-it/
  app-backend/      # Python FastAPI backend API, MongoDB/JSON integration
  client/           # React frontend and Electron app
    electron/       # Electron main and preload scripts
    src/            # React components, contexts, and styles
  workspacer-gcext/ # (Extension or additional workspace features)
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

## License

[MIT](LICENSE)

## Acknowledgements

- FastAPI
- React
- Electron
- MongoDB
- Vite
- All contributors and open-source libraries used in this project