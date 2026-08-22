import importlib.util
from pathlib import Path

module_path = Path(__file__).with_name("import-balaghah-nahj.py")
spec = importlib.util.spec_from_file_location("balaghah_importer", module_path)
if spec is None or spec.loader is None:
    raise RuntimeError("Cannot load importer")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

session = module.requests.Session()
soup = module.fetch(session, "http://arabic.balaghah.net/node/389")
if soup is None:
    raise RuntimeError("Page unavailable")

for element in soup.select("div"):
    classes = " ".join(element.get("class", []))
    text = module.normalize(element.get_text(" ", strip=True))
    if len(text) > 300:
        print(f"class={classes!r} id={element.get('id')!r} length={len(text)} sample={text[:140]!r}")
