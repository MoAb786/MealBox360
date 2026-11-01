from app.services.normalizer import normalize, is_pantry_staple, normalize_ingredient_list

def test_alias_resolution():
    assert normalize("bell pepper") == "capsicum"
    assert normalize("bell peppers") == "capsicum"
    assert normalize("green pepper") == "capsicum"
    assert normalize("cilantro") == "coriander leaves"
    assert normalize("dhania") == "coriander leaves"
    assert normalize("fresh coriander") == "coriander leaves"
    assert normalize("tomatoes") == "tomato"
    assert normalize("onions") == "onion"

def test_case_and_whitespace():
    assert normalize("  Bell Pepper  ") == "capsicum"
    assert normalize("Onion\n") == "onion"
    assert normalize("TOMATO") == "tomato"

def test_pantry_staples():
    assert is_pantry_staple("salt") is True
    assert is_pantry_staple("water") is True
    assert is_pantry_staple("cooking oil") is True
    assert is_pantry_staple("capsicum") is False

def test_normalize_ingredient_list():
    raw = ["Bell Pepper", "capsicum", "cilantro", "dhania", "Salt"]
    normalized = normalize_ingredient_list(raw)
    assert normalized == ["capsicum", "coriander leaves", "salt"]
