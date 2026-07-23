import pandas as pd
import numpy as np
import warnings, re, os
from sklearn.linear_model    import LogisticRegression
try:
    from lightgbm import LGBMClassifier
except: os.system("pip install lightgbm -q"); from lightgbm import LGBMClassifier
try:
    from xgboost import XGBClassifier
except: os.system("pip install xgboost -q"); from xgboost import XGBClassifier
warnings.filterwarnings("ignore")
import psycopg2
import pickle
from datetime import date, timedelta, timezone
import requests
from .data_processing import process_data
import os

BASE_URL = "http://192.168.100.136:9090/api/v1"
AUTH_PATH = "/auth/login"
 
USERNAME = "sanjeev"
PASSWORD = "Sanjeev@rico123"

TOKEN_JSON_PATH = "token"

 
PARAM_COLS = [
    "cycletime value (sec)",
    "DIE CLOSE/CORE IN Parameter (sec)value",
    "POURING-step value (sec)",
    "SHOT FWD-step value (sec)",
    "COOLING-step value (sec)",
    "DIE OPEN/CORE OUT-step value (sec)",
    "EJECTOR-step value (sec)",
    "EXTRACTOR-step value (sec)",
    "SPRAY-step value (sec)",
    "SPEED 1 (m/sec)value",
    "SPEED 2 (m/sec)value",
    "SPEED 3 (m/sec)value",
    "SPEED 4(m/sec)value",
    "ACC POSITION 1(mm)value",
    "DEACC POSITION 1(mm)value",
    "INTESIFICAITON TIME(msec)value",
    "MATEL PRESSURE(Mpa)value",
    "BISCUIT THICKNESS(mm)value",
    "CLAMP FORCE(%)value",
    "CLAMP TONNAGE(MN)value",
    "SHOT ACC. PRESSURE value",
    "INTESIFICAITON ACC. PRESSUREvalue",
    "METAL TEMP.value",
]

PARAM_MAP = {
    "cycletime value (sec)": "cycletime value (sec)",
    "DIE CLOSE/CORE IN Parameter (sec)value": "DIE-CLOSE CORE IN TIME",
    "POURING-step value (sec)": "POURING TIME",
    "SHOT FWD-step value (sec)": "SHOT FWD TIME",
    "COOLING-step value (sec)": "CURING TIME",  # verify this one
    "DIE OPEN/CORE OUT-step value (sec)": "DIE OPEN CORE OUT TIME",
    "EJECTOR-step value (sec)": "EJECTOR TIME",
    "EXTRACTOR-step value (sec)": "EXTRACT TIME",
    "SPRAY-step value (sec)": "SPRAY TIME",
    "SPEED 1 (m/sec)value": "V1",
    "SPEED 2 (m/sec)value": "V2",
    "SPEED 3 (m/sec)value": "V3",
    "SPEED 4(m/sec)value": "V4",
    "ACC POSITION 1(mm)value": "ACCEL. POINT",
    "DEACC POSITION 1(mm)value": "DEACEL. POINT",
    "INTESIFICAITON TIME(msec)value": "INTEN. TIME",
    "MATEL PRESSURE(Mpa)value": "METAL PRESS.",
    "BISCUIT THICKNESS(mm)value": "BISCUIT THICKNESS",
    "CLAMP FORCE(%)value": "CLAMP FORCE",
    "CLAMP TONNAGE(MN)value": "CLAMP TONNAGE", 
    "SHOT ACC. PRESSURE value": "SHOT ACC. PRESSURE",
    "INTESIFICAITON ACC. PRESSUREvalue": "INTENSIFICATION ACC. PRESSURE",
    "METAL TEMP.value": "FURNACE METAL TEMP.",
}

PARAM_MAP_BL = {v: k for k, v in PARAM_MAP.items()}

RAW_TO_MODEL_ORDER = [
    "cycletime value (sec)",
    "POURING TIME sec",
    "SHOT FWD TIME sec",
    "CURING TIME",
    "DIE OPEN CORE OUT TIME",
    "EJECTOR TIME",
    "EXTRACT TIME",
    "SPRAY TIME",
    "V1",
    "V2",
    "V3",
    "V4",
    "ACCEL. POINT",
    "DEACEL. POINT",
    "INTEN. TIME",
    "METAL PRESS.",
    "BISCUIT THICKNESS",
    "CLAMP FORCE",
    "CLAMP TONNAGE",
    "SHOT ACC. PRESSURE MPa",
    "INTENSIFICATION ACC. PRESSURE",
    "FURNACE METAL TEMP.",
]


#The target outputs
TARGET_DEFECTS = ["Blow_Hole","Crack","Non_filling","Porosity","Shrinkage","Chipoff"]

#Database configurations for access
DB_CONFIG = {
    "host":     "aws-1-ap-southeast-2.pooler.supabase.com",
    "dbname":   "postgres",
    "user":     "postgres.nnflwohgewhkqqjfvote",
    "password": "Datamgnt25!#",
    "options":  "-c search_path=rico"
    
}

IOT_NAMES_UOM = {'accel_point': ['ACCEL. POINT', 'mm'], 
             'biscuit_thickness': ['BISCUIT THICKNESS', 'mm'], 
             'clamp_force_pct': ['CLAMP FORCE', '%'], 
            'clamp_tonnage': ['CLAMP TONNAGE', 'Mn'], 
            'curing_time': ['CURING TIME', 'sec'], 
            'deaccel_point': ['DEACEL. POINT',  'mm'], 
            'die_open_core_out_time': ['DIE OPEN CORE OUT TIME', 'sec'], 
            'die_close_core_in_time': ['DIE-CLOSE CORE IN TIME', 'sec'], 
            'ejector_time': ['EJECTOR TIME', 'sec'],
            'extract_time': ['EXTRACT TIME', 'sec'],  
            'furnace_metal_temp': ['FURNACE METAL TEMP.', 'C'], 
            'intensification_time': ['INTEN. TIME', 'msec'], 
            'intensification_acc_pressure': ['INTENSIFICATION ACC. PRESSURE', 'mPa'], 
            'metal_pressure': ['METAL PRESS.', 'Mpa'],
            'pouring_time': ['POURING TIME', 'sec'], 
            'shot_acc_pressure': ['SHOT ACC. PRESSURE', 'MPa'], 
            'shot_fwd_time': ['SHOT FWD TIME', 'sec'], 
            'spray_time': ['SPRAY TIME', 'sec'], 
            'v1_speed': ['V1', 'm/sec'], 
            'v2_speed': ['V2', 'm/sec'], 
            'v3_speed': ['V3', 'm/sec'], 
            'v4_speed': ['V4', 'm/sec'], 
            "cycle_time": ["cycletime value (sec)", "sec"]}

def update_date_path() -> str:
    #Connect to database
    # Fall back to a default if the table is empty
   
    date_from = date.today().strftime("%Y-%m-%dT00:00:00")
    date_to = (date.today() + timedelta(days=1)).strftime("%Y-%m-%dT00:00:00")

    # date_from = "2026-07-16T00:00:00"
    # date_to = "2026-07-16T12:00:00"
    data_path = f"/reports/report/data?dateFrom={date_from}&dateTo={date_to}"
    return data_path

def get_auth_token() -> str:
    """Step 1: POST credentials, pull the token out of the JSON response."""
    url = f"{BASE_URL}{AUTH_PATH}"
    payload = {"username": USERNAME, "password": PASSWORD}
 
    resp = requests.post(url, json=payload, timeout=15)
    resp.raise_for_status()
    body = resp.json()
 
    token = body
    for key in TOKEN_JSON_PATH.split("."):
        token = token[key]
 
    if not isinstance(token, str):
        raise ValueError(f"Expected a string token at '{TOKEN_JSON_PATH}', got: {token!r}")
    return token

def get_iot_data(token: str, data_path):
    """Step 2: GET the data endpoint using the token from step 1."""
    url = f"{BASE_URL}{data_path}"
    headers = {"Authorization": f"Bearer {token}"}
 
    resp = requests.get(url, headers=headers, timeout=20)
    resp.raise_for_status()
    data = resp.json()
    if len(data['rows']) != 0:
        print(len(data['rows']))
        last_record = data['rows'][0]
        process_data(last_record)
    
    return


def get_latest_calibration(machine: str = None, die: str = None):
    conn = psycopg2.connect(**DB_CONFIG)
    cur  = conn.cursor()

    query = """
        SELECT c.parameter_name, c.baseline, c.upper_tolerance, c.lower_tolerance
        FROM calibration_parameter c
        WHERE c.id_calibration = %s;

    """
    df_baselines = pd.read_sql(query, conn, params=('39',))
    
    baselines = df_baselines.set_index('parameter_name').to_dict(orient='index')

    #baselines = {PARAM_MAP_BL[k]:v for k, v in baselines.items()}
    baselines = {k:v for k, v in baselines.items()}
    
    #print(baselines['V2'].keys())
    #print(baselines.keys())
    conn.commit()
    cur.close()
    conn.close()
    
    return baselines

def monitor_data(die):
    #Connect to database
    conn = psycopg2.connect(**DB_CONFIG)

    query = """
        SELECT c.*
        FROM operating_parameter c
        WHERE c.id_part = (
        SELECT id_part FROM part
        WHERE id_die = %s
        ORDER BY manufactored_on DESC
        LIMIT 1
    );

    """

    df_raw = pd.read_sql(query, conn, params=(die,))
    print(df_raw == None)
    timestamp = df_raw["created_at"].iloc[0]  
    ist = timezone(timedelta(hours=5, minutes=30))
    formatted = timestamp.tz_convert(ist).strftime("%Y-%m-%dT%H:%M:%S")
    #print(timestamp)      
    
    df = df_raw.pivot(index=["id_part", "id_die"], columns="parameter_name", values="value")
    df.columns = df.columns.str.strip()
    die_id = df.index.get_level_values("id_die")[0]
    part_id = df.index.get_level_values("id_part")[0]

    X = pd.DataFrame(index=df.index)
    for target_col in PARAM_COLS:
        source_col = PARAM_MAP[target_col]
        X[target_col] = df[source_col]

    parameters = X.iloc[0].to_dict()
    last_params = {PARAM_MAP[d]:v for d , v in parameters.items()}
    last_params["part_id"] = part_id
    last_params["timestamp"] = formatted
    # last_params["verdict"] = "REJECT"
    print(last_params)
    return [last_params, die_id]

def predictions(die):

    #Connect to database
    conn = psycopg2.connect(**DB_CONFIG)
    cur  = conn.cursor()

    query = """
        SELECT c.*
        FROM operating_parameter c
        WHERE c.id_part = (
        SELECT id_part FROM part
        WHERE id_die = %s
        ORDER BY manufactored_on DESC
        LIMIT 1
    );

    """

    df_raw = pd.read_sql(query, conn, params=(die,))

    df = df_raw.pivot(index=["id_part", "id_die"], columns="parameter_name", values="value")
    df.columns = df.columns.str.strip()
    die_id = df.index.get_level_values("id_die")[0]
    print(die == die_id)
    id_part = df.index.get_level_values("id_part")[0]
    print(id_part)
    
    X = pd.DataFrame(index=df.index)
    for target_col in PARAM_COLS:
        source_col = PARAM_MAP[target_col]
        X[target_col] = df[source_col]

    # print("Param Names DB")
    # param_names = [col for col in X.columns if col not in ["id_part", "id_die"]]
    # print(param_names)

    query = """
        SELECT c.parameter_name, c.baseline, c.upper_tolerance, c.lower_tolerance
        FROM calibration_parameter c
        WHERE c.id_calibration = %s;

    """
    #For model bef it was 24
    df_baselines = pd.read_sql(query, conn, params=('39',))
    
    #Temporary, will be removed after retraining model to so that it uses all parameters rather than having remove conditions
    df_baselines = df_baselines[df_baselines["parameter_name"] != "DIE-CLOSE CORE IN TIME"]

    baselines = df_baselines.set_index('parameter_name').to_dict(orient='index')
    

  
    # print("Printing Baseline Keys:")
    # print(baselines.keys())
    feat_datasets = {}   # defect → feature DataFrame

    def safe_cn(col):
        return re.sub(r"[^a-zA-Z0-9]","_",str(col)).strip("_").replace("__","_")

    for defect in TARGET_DEFECTS:
        #Get the baselines for not producing defect
    # defect = 'Blow Hole'
        # print(bl_die)
        feat_rows = []

        for (part_id, die_id), row in X.iterrows():
            #For each row of data, get the die number and baselines of the die
            die = die_id
            feats = {}
            #In the baseline data, convert numeric values made earlier into numeric and ignore non numeric
            for col, v in baselines.items():
                col = PARAM_MAP_BL[col]
                val = pd.to_numeric(row.get(col, np.nan), errors="coerce")
                avg = v["baseline"]
                min_r = v["lower_tolerance"]
                max_r = v["upper_tolerance"]
                cn  = safe_cn(col)
                # print(cn)
                #If value in range and within percetange deviation
                feats[f"{cn}_inrange"] = int(min_r <= val <= max_r)
                pct = (val - avg) / avg if avg != 0 else 0.0
                #print(float(np.clip(pct, -0.30, 0.30)))
                feats[f"{cn}_pctdev"] = float(np.clip(pct, -0.30, 0.30))
            feat_rows.append(feats)
        feat_df = pd.DataFrame(feat_rows, index=df.index)
        # feat_df["Die_No"] = 'S-14'
        # feat_df[defect]   = defect
        feat_datasets[defect] = feat_df
        #print(f"  ✓ {defect:15}: {feat_df.shape}")
        #print(feat_df)

    pred_results = []
    print("Going to model")
    # Use latest model for each die, 
    for defect in TARGET_DEFECTS:
        defect_tag   = defect.replace(" ", "_")
        model_path = os.path.join('.', 'models', f'{defect_tag}_20260605_voting.pkl')
        model = pickle.load(open(model_path, 'rb'))
        #model = pickle.load(open(f'.\models\{defect_tag}_20260605_voting.pkl','rb'))
        #print(model.keys())
        #print("Expected by model:", model['scaler'].feature_names_in_.tolist())
        #print("Received in input:", feat_datasets[defect].columns.tolist())
        df_input = feat_datasets[defect][model['scaler'].feature_names_in_]
        X_scaled = model['scaler'].transform(df_input)
        X_pca    = model['pca'].transform(X_scaled)
        X_cca    = model['cca'].transform(X_pca)
        prob     = model['model'].predict_proba(X_cca)[:,1]
        pred_results.append(prob)
        pred     = (prob >= model['threshold']).astype(int)

    predictions = [float(p[0]) for p in pred_results]
    return predictions