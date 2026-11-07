"""
Ingredient normalization service.
Maps raw ingredient names to canonical names using a curated alias table.
Fuzzy matching is NOT used for silent merging — only exact alias lookups.
"""
import re
import unicodedata
from typing import Optional

# ---------------------------------------------------------------------------
# Curated alias table: alias (lowercase, stripped) → canonical name
# ---------------------------------------------------------------------------
ALIAS_MAP: dict[str, str] = {
    # Peppers / Capsicum
    "bell pepper": "capsicum",
    "bell peppers": "capsicum",
    "capsicum": "capsicum",
    "green pepper": "capsicum",
    "red bell pepper": "red capsicum",
    "yellow bell pepper": "yellow capsicum",
    "shimla mirch": "capsicum",

    # Onion family
    "onion": "onion",
    "onions": "onion",
    "red onion": "onion",
    "red onions": "onion",
    "yellow onion": "onion",
    "brown onion": "onion",
    "pyaz": "onion",
    "spring onion": "spring onion",
    "spring onions": "spring onion",
    "green onion": "spring onion",
    "scallion": "spring onion",
    "shallot": "shallot",
    "shallots": "shallot",

    # Tomato
    "tomato": "tomato",
    "tomatoes": "tomato",
    "tamatar": "tomato",

    # Garlic
    "garlic": "garlic",
    "garlic clove": "garlic",
    "garlic cloves": "garlic",
    "lehsun": "garlic",

    # Ginger
    "ginger": "ginger",
    "adrak": "ginger",
    "fresh ginger": "ginger",

    # Coriander / Cilantro
    "coriander": "coriander leaves",
    "coriander leaves": "coriander leaves",
    "cilantro": "coriander leaves",
    "dhania": "coriander leaves",
    "fresh coriander": "coriander leaves",
    "coriander powder": "coriander powder",
    "dhania powder": "coriander powder",

    # Cumin
    "cumin": "cumin seeds",
    "cumin seeds": "cumin seeds",
    "jeera": "cumin seeds",
    "cumin powder": "cumin powder",
    "jeera powder": "cumin powder",

    # Turmeric
    "turmeric": "turmeric powder",
    "turmeric powder": "turmeric powder",
    "haldi": "turmeric powder",

    # Chilli
    "red chilli": "red chilli",
    "red chili": "red chilli",
    "red chillies": "red chilli",
    "red chilies": "red chilli",
    "lal mirch": "red chilli",
    "green chilli": "green chilli",
    "green chili": "green chilli",
    "green chillies": "green chilli",
    "hari mirch": "green chilli",
    "chilli powder": "red chilli powder",
    "chili powder": "red chilli powder",
    "red chilli powder": "red chilli powder",
    "lal mirch powder": "red chilli powder",

    # Rice
    "rice": "rice",
    "basmati rice": "basmati rice",
    "white rice": "rice",
    "chawal": "rice",

    # Lentils / Dal
    "dal": "red lentils",
    "daal": "red lentils",
    "lentils": "red lentils",
    "red lentils": "red lentils",
    "masoor dal": "red lentils",
    "toor dal": "yellow lentils",
    "arhar dal": "yellow lentils",
    "yellow lentils": "yellow lentils",
    "moong dal": "moong dal",
    "yellow moong dal": "moong dal",
    "chana dal": "chana dal",
    "urad dal": "urad dal",

    # Potato
    "potato": "potato",
    "potatoes": "potato",
    "aloo": "potato",

    # Peas
    "peas": "green peas",
    "green peas": "green peas",
    "matar": "green peas",
    "frozen peas": "green peas",

    # Spinach
    "spinach": "spinach",
    "palak": "spinach",
    "baby spinach": "spinach",

    # Eggs
    "egg": "egg",
    "eggs": "egg",
    "anda": "egg",
    "farm fresh eggs": "egg",
    "fresh eggs": "egg",
    "egg whites": "egg",
    "egg yolk": "egg",

    # Meat & Poultry
    "chicken": "chicken",
    "chicken breast": "chicken",
    "chicken breasts": "chicken",
    "chicken thigh": "chicken",
    "chicken thighs": "chicken",
    "boneless chicken": "chicken",
    "minced chicken": "chicken",
    "murgh": "chicken",

    # Tofu
    "tofu": "tofu",
    "firm tofu": "tofu",
    "silken tofu": "tofu",

    # Beans
    "kidney beans": "kidney beans",
    "rajma": "kidney beans",
    "black beans": "black beans",

    # Paneer
    "paneer": "paneer",
    "cottage cheese": "paneer",

    # Milk / Dairy
    "milk": "milk",
    "doodh": "milk",
    "curd": "curd",
    "yogurt": "curd",
    "yoghurt": "curd",
    "dahi": "curd",
    "butter": "butter",
    "makhan": "butter",
    "ghee": "ghee",
    "cream": "cream",
    "fresh cream": "cream",

    # Oils
    "oil": "cooking oil",
    "cooking oil": "cooking oil",
    "vegetable oil": "cooking oil",
    "refined oil": "cooking oil",
    "sunflower oil": "cooking oil",
    "mustard oil": "mustard oil",
    "sarson ka tel": "mustard oil",
    "olive oil": "olive oil",

    # Salt / basics
    "salt": "salt",
    "namak": "salt",
    "sugar": "sugar",
    "cheeni": "sugar",
    "water": "water",
    "pani": "water",

    # Bread / Flour
    "bread": "bread",
    "double roti": "bread",
    "flour": "wheat flour",
    "wheat flour": "wheat flour",
    "maida": "all-purpose flour",
    "all purpose flour": "all-purpose flour",
    "all-purpose flour": "all-purpose flour",
    "besan": "chickpea flour",
    "chickpea flour": "chickpea flour",
    "gram flour": "chickpea flour",

    # Oats
    "oats": "oats",
    "rolled oats": "oats",
    "quick oats": "oats",

    # Carrot
    "carrot": "carrot",
    "carrots": "carrot",
    "gajar": "carrot",

    # Cabbage
    "cabbage": "cabbage",
    "patta gobhi": "cabbage",

    # Cauliflower
    "cauliflower": "cauliflower",
    "gobhi": "cauliflower",
    "phool gobhi": "cauliflower",

    # Mustard seeds
    "mustard seeds": "mustard seeds",
    "rai": "mustard seeds",
    "sarson": "mustard seeds",

    # Curry leaves
    "curry leaves": "curry leaves",
    "kadi patta": "curry leaves",

    # Asafoetida
    "asafoetida": "asafoetida",
    "hing": "asafoetida",

    # Garam masala
    "garam masala": "garam masala",

    # Poha / Flattened rice
    "poha": "poha",
    "flattened rice": "poha",
    "beaten rice": "poha",

    # Chickpeas
    "chickpeas": "chickpeas",
    "chana": "chickpeas",
    "chole": "chickpeas",
    "garbanzo beans": "chickpeas",

    # Lemon / Lime
    "lemon": "lemon",
    "lime": "lemon",
    "nimbu": "lemon",
    "lemon juice": "lemon juice",

    # Tomato puree / paste
    "tomato puree": "tomato puree",
    "tomato paste": "tomato puree",
    "tomato sauce": "tomato puree",
}

# Ingredients treated as optional pantry staples by default
DEFAULT_PANTRY_STAPLES: set[str] = {"salt", "water", "cooking oil"}


def _preprocess(name: str) -> str:
    """Lowercase, strip, normalize unicode, collapse whitespace."""
    name = unicodedata.normalize("NFC", name)
    name = name.strip().lower()
    name = re.sub(r"\s+", " ", name)
    # Remove trailing punctuation
    name = name.rstrip(".,;:")
    return name


def normalize(name: str) -> str:
    """
    Map a raw ingredient name to its canonical form.
    Returns the canonical name if found in alias table, else the preprocessed input.
    """
    key = _preprocess(name)
    return ALIAS_MAP.get(key, key)


def is_pantry_staple(canonical_name: str) -> bool:
    return canonical_name in DEFAULT_PANTRY_STAPLES


def normalize_ingredient_list(names: list[str]) -> list[str]:
    """Normalize a list of ingredient names, deduplicate."""
    seen = set()
    result = []
    for name in names:
        canon = normalize(name)
        if canon not in seen:
            seen.add(canon)
            result.append(canon)
    return result
