#!/usr/bin/env python
"""
Script para ejecutar el seed de la base de datos
Uso: python seed_db.py
"""
from app.seed import seed_database

if __name__ == "__main__":
    seed_database()
