# Laptop Repair System

> A full-stack laptop repair management system to track repairs, manage customers, handle invoicing and inventory.

## Features

- Customer and device management
- Repair job tracking (intake → diagnosis → repair → delivery)
- Invoice generation
- Inventory management
- REST API backend (Python)
- Web frontend

## Project Structure

```
laptop-repair-system/
├── backend/       # Python REST API
├── frontend/      # Web interface
├── docs/          # Documentation
├── tests/         # Test suite
├── setup.bat      # Windows setup
└── start.sh       # Unix startup script
```

## Getting Started

### Windows
```bat
setup.bat
```

### Linux / macOS
```bash
chmod +x start.sh
./start.sh
```

### Manual
```bash
pip install -r requirements.txt
cd backend && python main.py
```

## License

MIT License — © 2025 Prasanga Pokharel
