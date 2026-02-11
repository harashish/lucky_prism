import os
from pathlib import Path

# --- KONFIGURACJA ---
# Nazwa pliku wyjściowego, do którego zapisana zostanie struktura i zawartość
OUTPUT_FILE = "project_structure_and_content_v3.txt" # Zmieniono nazwę, aby odróżnić

# Katalogi główne
FRONTEND_DIR = "frontend"
BACKEND_DIR = "backend"

# Ścieżki do uwzględnienia w backendzie (jako pliki lub katalogi do rozwinięcia)
BACKEND_PATHS_TO_INCLUDE = [
    os.path.join(BACKEND_DIR, 'apps'),
    os.path.join(BACKEND_DIR, 'backend', 'urls.py'), 
    os.path.join(BACKEND_DIR, 'backend', 'settings.py'),
]

# Katalogi we frontendzie do uwzględnienia
FRONTEND_DIRS_TO_INCLUDE = [
    os.path.join(FRONTEND_DIR, 'constants'),
    os.path.join(FRONTEND_DIR, 'components'),
    os.path.join(FRONTEND_DIR, 'features'),
    os.path.join(FRONTEND_DIR, 'app'),
    os.path.join(FRONTEND_DIR, 'utils'),
]

# Ścieżki i pliki do zignorowania
PATHS_TO_IGNORE = [
    '__pycache__',
    '.git',
    'node_modules',
    'venv',
    # Reguły ignorowania specyficzne dla projektu
    'migrations',   
    'admin.py',     
    'apps.py',      
    #'tests.py', # DODANE: Ignorowanie wszystkich plików tests.py
    # Inne standardowe ignorowane
    '__init__.py',
    'package-lock.json',
    'dist',
    'build',
]
# --- KONIEC KONFIGURACJI ---

# Treść, która ma być dodana na początku pliku
REQUIRED_HEADER_CONTENT = """

\n\n"""

# --- Funkcje pomocnicze pozostają bez zmian (is_ignored, collect_paths, _traverse_dir) ---

def is_ignored(path_name):
    """Sprawdza, czy nazwa ścieżki (katalog lub plik) powinna być zignorowana."""
    return path_name in PATHS_TO_IGNORE

def collect_paths(root_dir, specific_paths, file_list, structure_lines, prefix=''):
    """
    Inicjuje przechodzenie przez konkretne ścieżki i katalogi.
    (Bez zmian w logice)
    """
    
    added_to_structure = set() 
    
    for path_str in specific_paths:
        specific_path = Path(path_str)

        if str(specific_path) in added_to_structure:
             continue
        
        if specific_path.is_file():
            if specific_path not in file_list:
                file_list.append(specific_path)
            
            if specific_path.parent not in added_to_structure:
                 # Dodawanie katalogu rodzica
                 structure_lines.append(f"{prefix}└── **{specific_path.parent.name}/**")
                 added_to_structure.add(specific_path.parent)

            # Dodaj do struktury plik
            parent_prefix = prefix + ("    " if specific_path.parent.name != BACKEND_DIR else "")
            structure_lines.append(f"{parent_prefix}├── {specific_path.name}")
            
        elif specific_path.is_dir():
            line_prefix = prefix + "└── " 
            structure_lines.append(f"{line_prefix}**{specific_path.name}/**")
            added_to_structure.add(specific_path)

            _traverse_dir(specific_path, file_list, structure_lines, prefix + "    ")


def _traverse_dir(current_dir, file_list, structure_lines, prefix):
    """Pomocnicza funkcja rekurencyjna do przechodzenia katalogów. (Bez zmian w logice)"""
    
    items = sorted(os.listdir(current_dir))
    
    for i, item_name in enumerate(items):
        item_path = current_dir / item_name

        if is_ignored(item_name):
            continue

        is_last = (i == len(items) - 1)
        
        line_prefix = prefix + ("└── " if is_last else "├── ")

        if item_path.is_dir():
            if item_name in PATHS_TO_IGNORE:
                 continue

            structure_lines.append(f"{line_prefix}**{item_name}/**")
            
            next_prefix = prefix + ("    " if is_last else "│   ")
            _traverse_dir(item_path, file_list, structure_lines, next_prefix)

        elif item_path.is_file():
            if item_name in PATHS_TO_IGNORE:
                continue
                
            file_list.append(item_path)
            structure_lines.append(f"{line_prefix}{item_name}")


def main():
    """Główna funkcja skryptu."""
    
    all_files_to_process = []
    structure_output = []

    # --- Krok 1 & 2: Zbieranie ścieżek (jak poprzednio) ---
    
    # BACKEND
    structure_output.append(f"└── **{BACKEND_DIR}/**")
    backend_config_paths = [p for p in BACKEND_PATHS_TO_INCLUDE if Path(p).is_file()]
    collect_paths(BACKEND_DIR, backend_config_paths, all_files_to_process, structure_output, prefix="    ")
    backend_dir_paths = [p for p in BACKEND_PATHS_TO_INCLUDE if Path(p).is_dir()]
    collect_paths(BACKEND_DIR, backend_dir_paths, all_files_to_process, structure_output, prefix="    ")

    # FRONTEND
    structure_output.append(f"└── **{FRONTEND_DIR}/**")
    frontend_paths = list(FRONTEND_DIRS_TO_INCLUDE) 
    collect_paths(FRONTEND_DIR, frontend_paths, all_files_to_process, structure_output, prefix="    ")


    # --- Krok 3: Zapis do pliku ---
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        
        # !!! WPROWADZENIE WYMAGANEJ TREŚCI NA POCZĄTEK PLIKU !!!
        f.write(REQUIRED_HEADER_CONTENT)
        f.write("\n\n" + "-"*80 + "\n\n")

        # 1. Zapis struktury
        f.write("="*80 + "\n")
        f.write("STRUKTURA PLIKÓW PROJEKTU (Filtr: Migracje, admin.py, apps.py, tests.py zignorowane)\n")
        f.write("="*80 + "\n\n")
        
        f.write(". (Root Project Directory)\n")
        
        final_structure_lines = []
        for line in structure_output:
            if line.strip(): 
                final_structure_lines.append(line)
                
        f.write('\n'.join(final_structure_lines))
        f.write("\n\n" + "-"*80 + "\n\n")

        # 2. Zapis zawartości plików
        f.write("="*80 + "\n")
        f.write(f"ZAWARTOSĆ {len(all_files_to_process)} PLIKÓW\n")
        f.write("="*80 + "\n\n")

        for file_path in all_files_to_process:
            relative_path = os.path.relpath(file_path)
            
            f.write(f"\n{'#'*10} START PLIK: {relative_path} {'#'*10}\n\n")
            
            try:
                with open(file_path, 'r', encoding='utf-8') as file:
                    content = file.read()
                    f.write(content)
            except UnicodeDecodeError:
                f.write(f"[BŁĄD DEKODOWANIA]: Plik '{relative_path}' zawiera nie-tekstową lub binarną zawartość.\n")
            except FileNotFoundError:
                f.write(f"[BŁĄD]: Plik '{relative_path}' nie został znaleziony.\n")
            except Exception as e:
                f.write(f"[INNY BŁĄD]: Nie udało się odczytać pliku '{relative_path}'. Błąd: {e}\n")

            f.write(f"\n\n{'#'*10} KONIEC PLIKU: {relative_path} {'#'*10}\n\n\n")

    print(f"✅ Skrypt zakończył działanie. Zapisano do pliku: {OUTPUT_FILE}")
    print(f"Liczba przetworzonych plików: {len(all_files_to_process)}")

if __name__ == "__main__":
    main()
