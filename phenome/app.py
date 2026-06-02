import os
import sys
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler

if sys.platform == "win32":
    try: sys.stdout.reconfigure(encoding="utf-8")
    except Exception: pass

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

diseases_db = {}

def train_model_for_disease(disease_name, nmr_path, meta_path, sample_col, target_col):
    print(f"\n🚀 กำลังสร้างโมเดลสำหรับ: {disease_name}")
    
    nmr = pd.read_csv(nmr_path, sep='\t')
    meta = pd.read_csv(meta_path, sep='\t')

    # จัดการชื่อสาร
    metabolite_names = nmr['metabolite_identification'].fillna('Unknown_Shift_' + nmr['chemical_shift'].astype(str))
    
    # 🧠 ใช้คอลัมน์รหัสผู้ป่วยตามที่ผู้ใช้เลือกมาจากหน้าเว็บ
    meta[sample_col] = meta[sample_col].astype(str)
    nmr.columns = nmr.columns.astype(str)
    
    # ดึงเฉพาะคอลัมน์ใน NMR ที่มีรหัสตรงกับในไฟล์ Meta
    valid_sample_cols = [col for col in nmr.columns if col in meta[sample_col].values]
    
    if not valid_sample_cols:
        raise ValueError(f"❌ ไม่พบรหัสตัวอย่างที่ตรงกันเลย โปรดตรวจสอบการจับคู่คอลัมน์")

    X_raw = nmr[valid_sample_cols].T
    X_raw.columns = metabolite_names
    X_raw.reset_index(names=sample_col, inplace=True)

    print(f"📌 ใช้เกณฑ์แบ่งกลุ่มจากคอลัมน์: '{target_col}'")

    # เชื่อมข้อมูลด้วยคอลัมน์ที่ผู้ใช้ระบุ
    df = pd.merge(meta[[sample_col, target_col]], X_raw, on=sample_col, how='inner')
    
    # ลบแถวที่ไม่มีข้อมูลกลุ่มเป้าหมาย
    df = df.dropna(subset=[target_col])
    
    unique_groups = df[target_col].unique()
    if len(unique_groups) < 2:
        raise ValueError("❌ ข้อมูลในคอลัมน์โรค มีกลุ่มไม่เพียงพอ (ต้องมีอย่างน้อย 2 กลุ่ม เช่น ป่วย/ไม่ป่วย)")
        
    disease_group = unique_groups[0] 
    print(f"📌 กลุ่มเป้าหมาย (ความเสี่ยง) คือ: '{disease_group}' vs กลุ่มอื่นๆ")
    
    df['Target'] = df[target_col].apply(lambda x: 1 if x == disease_group else 0)

    X = df.drop(columns=[sample_col, target_col, 'Target']).fillna(0)
    y = df['Target']

    # เทรนโมเดลเพื่อหาความสำคัญ (Biomarker)
    temp_rf = RandomForestClassifier(n_estimators=50, random_state=42)
    temp_rf.fit(X, y)
    
    importances = pd.DataFrame({'Metabolite': X.columns, 'Importance': temp_rf.feature_importances_})
    
    # 🧠 ระบบ AI คัดเลือกจำนวนสารอัตโนมัติ (Dynamic Feature Selection)
    importances = importances.sort_values(by='Importance', ascending=False)
    dynamic_top = importances[importances['Importance'] >= 0.03] # เอาที่สำคัญเกิน 3%
    
    if len(dynamic_top) > 10: top_df = dynamic_top.head(10)
    elif len(dynamic_top) < 3: top_df = importances.head(3)
    else: top_df = dynamic_top
    
    top_features = top_df['Metabolite'].tolist()
    top_scores = top_df['Importance'].tolist()

    X_top = X[top_features]

    feature_ranges = {}
    for col in top_features:
        feature_ranges[col] = {
            'min': float(X_top[col].min()),
            'max': float(X_top[col].max()),
            'mean': float(X_top[col].mean())
        }

    scaler = StandardScaler()
    X_top_scaled = scaler.fit_transform(X_top)

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_top_scaled, y)

    diseases_db[disease_name] = {
        'model': model,
        'scaler': scaler,
        'features': top_features,
        'scores': top_scores,
        'ranges': feature_ranges
    }
    print(f"✅ สร้างโมเดล '{disease_name}' สำเร็จ!\n")


# ==========================================
# API ROUTES
# ==========================================

@app.route('/api/diseases', methods=['GET'])
def get_diseases_list():
    result = {}
    for d_name, d_data in diseases_db.items():
        result[d_name] = {
            'features': d_data['features'],
            'scores': d_data['scores'],
            'ranges': d_data['ranges']
        }
    return jsonify(result)

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        disease_name = data.get('disease')
        input_values = data.get('values', [])

        if disease_name not in diseases_db:
            return jsonify({'error': 'ไม่พบข้อมูลภาวะนี้ในระบบ'}), 400
        
        d_config = diseases_db[disease_name]
        input_scaled = d_config['scaler'].transform(np.array(input_values).reshape(1, -1))
        probability = d_config['model'].predict_proba(input_scaled)[0][1]
        
        return jsonify({'risk_percentage': round(probability * 100, 2)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/upload', methods=['POST'])
def upload_data():
    try:
        disease_name = request.form.get('disease_name', '').strip()
        sample_col = request.form.get('sample_col', '').strip()
        target_col = request.form.get('target_col', '').strip()
        
        if not disease_name or not sample_col or not target_col: 
            return jsonify({'error': 'ข้อมูลไม่ครบถ้วน (ชื่อโรค, หรือการจับคู่คอลัมน์)'}), 400

        nmr_file = request.files['nmr_file']
        meta_file = request.files['meta_file']
        
        safe_name = "".join([c for c in disease_name if c.isalnum() or c==' ']).rstrip()
        new_nmr_path = os.path.join(UPLOAD_FOLDER, f'{safe_name}_nmr.tsv')
        new_meta_path = os.path.join(UPLOAD_FOLDER, f'{safe_name}_meta.tsv')
        
        nmr_file.save(new_nmr_path)
        meta_file.save(new_meta_path)
        
        train_model_for_disease(disease_name, new_nmr_path, new_meta_path, sample_col, target_col)
        return jsonify({'message': 'สำเร็จ'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)