import os
import sys
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler

# Reconfigure stdout for UTF-8 encoding on Windows to prevent UnicodeEncodeError
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Resolve paths relative to the script directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
nmr_path = os.path.join(BASE_DIR, 'Domain_2_NMR_results_MTBLS242.tsv')
meta_path = os.path.join(BASE_DIR, 'Domain_2_sample_table_MTBLS242.tsv')

print("1. กำลังโหลดข้อมูล...")
nmr = pd.read_csv(nmr_path, sep='\t')
meta = pd.read_csv(meta_path, sep='\t')

print("2. กำลังจัดการข้อมูล (Data Preprocessing)...")
# เก็บชื่อสารไว้ทำ Mapping ทีหลัง
metabolite_names = nmr['metabolite_identification'].fillna('Unknown_Shift_' + nmr['chemical_shift'].astype(str))

# ดึงเฉพาะคอลัมน์ที่เป็น Sample
sample_cols = [col for col in nmr.columns if col.endswith('_S')]
X_raw = nmr[sample_cols].T # Transpose ให้ Sample เป็นแถว
X_raw.columns = metabolite_names # เปลี่ยนชื่อคอลัมน์เป็นชื่อสาร
X_raw.reset_index(names='Sample Name', inplace=True)

# Merge กับข้อมูลผู้ป่วย
df = pd.merge(meta[['Sample Name', 'Factor Value[time point]']], X_raw, on='Sample Name', how='inner')

# แปลง Target (preop = 1 (ป่วย), 12 months after = 0 (ปกติ))
df['Target'] = df['Factor Value[time point]'].apply(lambda x: 1 if x == 'preop' else 0)

# แยก X (ตัวแปรต้น/สาร) และ y (ตัวแปรตาม/โรค)
X = df.drop(columns=['Sample Name', 'Factor Value[time point]', 'Target'])
y = df['Target']

# จัดการค่า Null (เติม 0) และทำ Scaling
X = X.fillna(0)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
# นำกลับมาใส่ DataFrame เพื่อเก็บชื่อคอลัมน์ไว้
X_scaled = pd.DataFrame(X_scaled, columns=X.columns)

print(f"ขนาดข้อมูล: {X_scaled.shape[0]} ตัวอย่าง, {X_scaled.shape[1]} สารประกอบ")

print("3. กำลังค้นหา Biomarker ที่สำคัญที่สุด...")
# เทรนโมเดล Random Forest เพื่อดู Feature Importance
rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_scaled, y)

# ดึงความสำคัญของสารแต่ละตัว
feature_importances = pd.DataFrame({
    'Metabolite': X.columns,
    'Importance': rf.feature_importances_
})

# เรียงลำดับและเอา 10 อันดับแรก
top_10_biomarkers = feature_importances.sort_values(by='Importance', ascending=False).head(10)

print("\n=== สารประกอบ (Biomarkers) 10 อันดับแรกที่สำคัญที่สุดในการแยกกลุ่ม ===")
print(top_10_biomarkers)