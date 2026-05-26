# import pandas as pd
# from . import calibrate_params
# import psycopg2
# DB_CONFIG = {
#     "host":     "aws-1-ap-southeast-2.pooler.supabase.com",
#     "dbname":   "postgres",
#     "user":     "postgres.nnflwohgewhkqqjfvote",
#     "password": "Datamgnt25!#",
#     "options":  "-c search_path=rico"
    
# }

# # Temporary Excel source
# # Later Adikshit can replace with SQL


# def get_latest_parameters():


#     param_names = ['ACCEL. POINT mm ', 'BISCUIT THICKNESS mm ', 'CLAMP FORCE (%) ', 'CLAMP TONNAGE (T) ', 'CLAMP TONNAGE(HE.LOW) % ', 
#                    'CLAMP TONNAGE(HE.LOW) MN ', 'CLAMP TONNAGE(HE.UP) % ', 'CLAMP TONNAGE(OP.LOW) % ', 'CLAMP TONNAGE(OP.UP) % ', 
#                    'COOLING WATER FLOW RATE(MOV.) L/min ', 'COOLING WATER FLOW RATE(STA.) L/min ', 'CURING TIME sec ', 'DEACEL. POINT mm ',
#                      'DIE OPEN CORE OUT TIME sec ', 'DIE-CLOSE CORE IN TIME sec ', 'EJECTOR TIME sec ', 'EXTRACT TIME sec ', 
#                      'FIXED DIE TEMP (F-1) C ', 'FIXED DIE TEMP (F-2) C ', 'FURNACE METAL TEMP. C ', 'HIGH SHOT COUNT ', 'INTEN. TIME msec ', 
#                      'INTENSIFICATION ACC. PRESSURE MPa ', 'JET COOLING PRESSURE kgf/cm2 ', 'METAL PRESS. Mpa ', 'MOVING DIE TEMP (M-1) C ', 'MOVING DIE TEMP (M-2) C ', 'NG COUNTER ', 'POURING TIME sec ', 'SHOT ACC. PRESSURE MPa ', 'SHOT FWD TIME sec ', 'SLIDE TEMP-1 (S-1) C ', 'SPRAY TIME sec ', 'V1 m/sec ', 'V2 m/sec) ', 'V3 m/sec ', 'V4 m/sec ', 'VACUUM PRESSURE mbar ']
#     dict_parms = {name: 0 for name in param_names}
#     return dict_parms


# def compute_calibration_ranges(): #Input should be machineID and DieID, which is entered by user when opening calibration page
#     #For the time being no 
#     baselines = calibrate_params.main()
#     return {name: {"baseline": baselines[name][0], "tolerance": baselines[name][1], "min_range": baselines[name][2], "max_range": baselines[name][3]} for name, v in baselines.items()}

# def update_parameters(data):

#     #Assuming the data is same formate to the baseline data given earlier for compute_calibration_ranges
#     #The data for calibration date will be the same as created_at date, unless already created, then changed to updated_date
#     conn = psycopg2.connect(**DB_CONFIG)
#     cur  = conn.cursor()
#     cur.execute(
#     "SELECT id_client FROM client WHERE name = %s",
#     ('Suzuki',)
#     )
#     id_client = cur.fetchone()[0]
#     print(id_client)


#     #Get machine ID to match with 
#     cur.execute(
#     "SELECT id_machine FROM machine WHERE id_client = %s",
#     (id_client,)
#     )
#     id_machine = cur.fetchone()[0]
#     print(id_machine)

#     #Get die ID to match with 
#     cur.execute(
#     "SELECT id_die FROM die WHERE id_machine = %s",
#     (id_machine,)
#     )
#     id_die = cur.fetchone()[0]

#     #Add the DieCalibration data
    
#     cur.execute("""
#                     INSERT INTO die_calibration (id_die, id_client, id_machine, enabled)
#                     VALUES (%s, %s, %s, %s)
#                     RETURNING id_calibration
#             """, (id_die, id_client, id_machine, 'true'))
#     id_calibration = cur.fetchone()[0]

#     #Add the individual Param calibration data into Calibration Parameter
#     for col, v in data.items():
#         #Types need to be updated
#         baseline = int( data[col][0])
#         lower_tolerance = int(data[col][2])
#         upper_tolerance = int(data[col][3])
#         cur.execute("""
#                     INSERT INTO calibration_parameter (id_calibration, id_die, id_client, id_machine, parameter_name, baseline, lower_tolerance, upper_tolerance)
#                     VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
#                     RETURNING id_calibration
#             """, (id_calibration, id_die, id_client, id_machine, col, baseline, lower_tolerance, upper_tolerance))
        
#     conn.commit()
#     cur.close()
#     conn.close()

#     return {
#         "message": "Parameters updated successfully",
#         "updated_values": data
#     }

# def apply_calibration(data):

#     # Adikshit can later save to SQL

#     return {
#         "message": "Calibration Applied Successfully",
#         "applied_values": data
#     }


latest_parameters = {

    "pouring_time": 4.52,
    "shot_forward_time": 2.02,
    "cooling_time": 13.78,
    "die_open_core_out_time": 5.31,
    "ejector_time": 4.91,
    "extraction_time": 12.92,
    "spray_time": 14.74,

    "speed_1": 0.29,
    "speed_2": 0.30,
    "speed_3": 3.29,
    "speed_4": 3.36,

    "metal_pressure": 120.00,
    "metal_temperature": 690.00
}


def get_latest_parameters():

    return latest_parameters


def compute_calibration_ranges():

    return {

        "Pouring Time": {
            "baseline": 4.52,
            "tolerance": 0.09,
            "min_range": 4.23,
            "max_range": 4.81
        },

        "Shot Forward Time": {
            "baseline": 2.02,
            "tolerance": 0.04,
            "min_range": 1.89,
            "max_range": 2.16
        },

        "Cooling Time": {
            "baseline": 13.78,
            "tolerance": 0.03,
            "min_range": 13.66,
            "max_range": 13.90
        },

        "Die Open/Core Out Time": {
            "baseline": 5.31,
            "tolerance": 0.02,
            "min_range": 5.24,
            "max_range": 5.38
        },

        "Ejector Time": {
            "baseline": 4.91,
            "tolerance": 0.03,
            "min_range": 4.80,
            "max_range": 5.02
        },

        "Extraction Time": {
            "baseline": 12.92,
            "tolerance": 0.04,
            "min_range": 12.80,
            "max_range": 13.04
        },

        "Spray Time": {
            "baseline": 14.74,
            "tolerance": 0.09,
            "min_range": 14.47,
            "max_range": 15.02
        },

        "Speed 1": {
            "baseline": 0.29,
            "tolerance": 0.002,
            "min_range": 0.285,
            "max_range": 0.296
        },

        "Speed 2": {
            "baseline": 0.30,
            "tolerance": 0.002,
            "min_range": 0.302,
            "max_range": 0.316
        },

        "Speed 3": {
            "baseline": 3.29,
            "tolerance": 0.004,
            "min_range": 3.285,
            "max_range": 3.307
        },

        "Speed 4": {
            "baseline": 3.36,
            "tolerance": 0.004,
            "min_range": 3.356,
            "max_range": 3.379
        },

        "Metal Pressure": {
            "baseline": 120.0,
            "tolerance": 5.0,
            "min_range": 115.0,
            "max_range": 125.0
        },

        "Metal Temperature": {
            "baseline": 690.0,
            "tolerance": 10.0,
            "min_range": 680.0,
            "max_range": 700.0
        }
    }


def update_parameters(data):

    global latest_parameters

    latest_parameters.update(data)

    return {
        "message": "Parameters Updated Successfully"
    }


def apply_calibration(data):

    global latest_parameters

    latest_parameters.update(data)

    return {
        "message": "Calibration Applied Successfully"
    }
