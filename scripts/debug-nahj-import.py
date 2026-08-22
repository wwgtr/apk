from collections import Counter
import importlib.util
from pathlib import Path

module_path = Path(__file__).with_name("import-open-heritage-sources.py")
spec = importlib.util.spec_from_file_location("heritage_importer", module_path)
if spec is None or spec.loader is None:
    raise RuntimeError("Unable to load the heritage importer")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
read_nahj_sql_records = module.read_nahj_sql_records


records = read_nahj_sql_records()
print("records", len(records))
print("field counts", Counter(len(record) for record in records))
for record in records[:3]:
    print("sample", len(record), record[:4], [len(str(value or "")) for value in record])
