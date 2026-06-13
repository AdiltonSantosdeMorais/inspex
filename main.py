import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import json

app = FastAPI(title="InspeX Backend")

# Ruta absoluta del proyecto para evitar fallos de ubicación
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Configuración de archivos estáticos (Imágenes, Iconos, Logos)
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")

# Modelo de datos para recibir las inspecciones
class InspeccionData(BaseModel):
    equipo: str
    datos: dict

# Ruta para servir el archivo manifest.json (Soluciona el error 404 del manifest)
@app.get("/manifest.json")
def get_manifest():
    manifest_path = os.path.join(BASE_DIR, "manifest.json")
    if os.path.exists(manifest_path):
        with open(manifest_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return JSONResponse(status_code=404, content={"detail": "manifest.json no encontrado"})

# RUTA PRINCIPAL: Panel de selección de equipos (index.html)
@app.get("/", response_class=HTMLResponse)
def read_index():
    index_path = os.path.join(BASE_DIR, "index.html")
    if os.path.exists(index_path):
        with open(index_path, "r", encoding="utf-8") as f:
            return f.read()
    raise HTTPException(status_code=404, detail="Archivo index.html no encontrado en la carpeta app/")

# ENRUTADOR DINÁMICO DE CHECKLISTS: Maneja ambulancia, camiones y vehículos ligeros de forma automática
@app.get("/checklist/{nombre_equipo}", response_class=HTMLResponse)
def get_checklist(nombre_equipo: str):
    # Forzamos a que busque el nombre en minúsculas y limpio
    nombre_archivo = f"{nombre_equipo.lower().strip()}.html"
    file_path = os.path.join(BASE_DIR, nombre_archivo)
    
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
            
    raise HTTPException(
        status_code=404, 
        detail=f"O modelo de checklist para '{nombre_equipo}' ainda está sendo configurado ou o arquivo '{nombre_archivo}' não foi encontrado."
    )

# API: Recepción y guardado de las inspecciones ejecutadas
@app.post("/api/inspeccion/salvar")
def salvar_inspeccion(data: InspeccionData):
    try:
        # Aquí puedes añadir lógica para guardar en base de datos o archivos JSON
        print(f"Inspección recibida para: {data.equipo}")
        return {"status": "success", "message": "Inspección sincronizada correctamente"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})