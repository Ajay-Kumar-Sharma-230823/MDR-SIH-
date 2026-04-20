// Ward configurations with exact bed counts and patient data
const wardConfigs = {
    'icu-a': {
        name: 'ICU Ward A - Medical Intensive Care',
        code: 'A',
        totalBeds: 20,
        occupied: 12,
        beds: [
            // 12 Occupied beds
            { id: 'A01', number: 'A01', status: 'occupied', risk: 'critical', patient: { name: 'Rohan Sharma', age: 46, gender: 'Male', abha: '9087 1245 3321', admission: '12 Feb 2025', doctor: 'Dr. Mehta', riskScore: 88, riskLabel: 'High risk - Immediate monitoring required', mdr: false, vitals: { bp: '88/56 mmHg', hr: '118 bpm', spo2: '88%', temp: '38.9°C' } } },
            { id: 'A02', number: 'A02', status: 'occupied', risk: 'low', patient: { name: 'Priya Singh', age: 29, gender: 'Female', abha: '7832 4411 9942', admission: '09 Feb 2025', doctor: 'Dr. Mishra', riskScore: 32, riskLabel: 'Low risk - Routine monitoring', mdr: false, vitals: { bp: '118/76 mmHg', hr: '82 bpm', spo2: '97%', temp: '37.1°C' } } },
            { id: 'A03', number: 'A03', status: 'occupied', risk: 'medium', patient: { name: 'Abdul Kareem', age: 55, gender: 'Male', abha: '6691 2200 1132', admission: '11 Feb 2025', doctor: 'Dr. Sen', riskScore: 62, riskLabel: 'Moderate risk - Enhanced monitoring', mdr: false, vitals: { bp: '132/88 mmHg', hr: '94 bpm', spo2: '93%', temp: '37.8°C' } } },
            { id: 'A04', number: 'A04', status: 'occupied', risk: 'critical', patient: { name: 'Vivek Patel', age: 67, gender: 'Male', abha: '1177 3344 5566', admission: '07 Feb 2025', doctor: 'Dr. Mehra', riskScore: 79, riskLabel: 'High risk - Critical condition', mdr: false, vitals: { bp: '92/58 mmHg', hr: '112 bpm', spo2: '89%', temp: '38.5°C' } } },
            { id: 'A05', number: 'A05', status: 'occupied', risk: 'mdr', patient: { name: 'Kavita Rai', age: 62, gender: 'Female', abha: '5543 9911 7762', admission: '05 Feb 2025', doctor: 'Dr. Shukla', riskScore: 92, riskLabel: 'Critical - MDR confirmed, strict isolation', mdr: true, vitals: { bp: '102/64 mmHg', hr: '106 bpm', spo2: '91%', temp: '38.4°C' } } },
            { id: 'A06', number: 'A06', status: 'occupied', risk: 'medium', patient: { name: 'Mohit Yadav', age: 49, gender: 'Male', abha: '8822 5544 7733', admission: '10 Feb 2025', doctor: 'Dr. Kapoor', riskScore: 58, riskLabel: 'Moderate risk - Monitoring required', mdr: false, vitals: { bp: '128/84 mmHg', hr: '90 bpm', spo2: '94%', temp: '37.6°C' } } },
            { id: 'A07', number: 'A07', status: 'occupied', risk: 'low', patient: { name: 'Aisha Khan', age: 34, gender: 'Female', abha: '7711 6633 8844', admission: '13 Feb 2025', doctor: 'Dr. Reddy', riskScore: 20, riskLabel: 'Low risk - Stable condition', mdr: false, vitals: { bp: '115/72 mmHg', hr: '76 bpm', spo2: '98%', temp: '36.9°C' } } },
            { id: 'A08', number: 'A08', status: 'occupied', risk: 'critical', patient: { name: 'Anju Devi', age: 61, gender: 'Female', abha: '6655 4422 9911', admission: '08 Feb 2025', doctor: 'Dr. Iyer', riskScore: 90, riskLabel: 'Critical - Intensive monitoring', mdr: false, vitals: { bp: '86/54 mmHg', hr: '122 bpm', spo2: '87%', temp: '39.1°C' } } },
            { id: 'A09', number: 'A09', status: 'occupied', risk: 'low', patient: { name: 'Nisha Gupta', age: 50, gender: 'Female', abha: '5544 3322 7788', admission: '14 Feb 2025', doctor: 'Dr. Nair', riskScore: 30, riskLabel: 'Low risk - Recovering well', mdr: false, vitals: { bp: '120/78 mmHg', hr: '80 bpm', spo2: '96%', temp: '37.2°C' } } },
            { id: 'A10', number: 'A10', status: 'occupied', risk: 'medium', patient: { name: 'Rakesh Kumar', age: 58, gender: 'Male', abha: '4433 2211 6655', admission: '09 Feb 2025', doctor: 'Dr. Desai', riskScore: 60, riskLabel: 'Moderate risk - Close monitoring', mdr: false, vitals: { bp: '130/86 mmHg', hr: '92 bpm', spo2: '93%', temp: '37.7°C' } } },
            { id: 'A11', number: 'A11', status: 'occupied', risk: 'low', patient: { name: 'Meera Joshi', age: 41, gender: 'Female', abha: '3322 1100 5544', admission: '15 Feb 2025', doctor: 'Dr. Bose', riskScore: 34, riskLabel: 'Low risk - Stable', mdr: false, vitals: { bp: '118/74 mmHg', hr: '78 bpm', spo2: '97%', temp: '37.0°C' } } },
            { id: 'A12', number: 'A12', status: 'occupied', risk: 'medium', patient: { name: 'Leela Sharma', age: 70, gender: 'Female', abha: '2211 9988 4433', admission: '06 Feb 2025', doctor: 'Dr. Pillai', riskScore: 64, riskLabel: 'Moderate risk - Age-related concerns', mdr: false, vitals: { bp: '135/88 mmHg', hr: '88 bpm', spo2: '92%', temp: '37.8°C' } } },
            // 8 Empty beds
            { id: 'A13', number: 'A13', status: 'empty', risk: 'none' },
            { id: 'A14', number: 'A14', status: 'empty', risk: 'none' },
            { id: 'A15', number: 'A15', status: 'empty', risk: 'none' },
            { id: 'A16', number: 'A16', status: 'empty', risk: 'none' },
            { id: 'A17', number: 'A17', status: 'empty', risk: 'none' },
            { id: 'A18', number: 'A18', status: 'empty', risk: 'none' },
            { id: 'A19', number: 'A19', status: 'empty', risk: 'none' },
            { id: 'A20', number: 'A20', status: 'empty', risk: 'none' }
        ]
    },
    'icu-b': {
        name: 'ICU Ward B - Surgical Intensive Care',
        code: 'B',
        totalBeds: 16,
        occupied: 14,
        beds: [
            // 14 Occupied beds (NO MDR)
            { id: 'B01', number: 'B01', status: 'occupied', risk: 'medium', patient: { name: 'Amit Verma', age: 52, gender: 'Male', abha: '8811 7722 6633', admission: '13 Feb 2025', doctor: 'Dr. Kumar', riskScore: 55, riskLabel: 'Moderate risk - Post-surgical', mdr: false, vitals: { bp: '125/82 mmHg', hr: '88 bpm', spo2: '95%', temp: '37.5°C' } } },
            { id: 'B02', number: 'B02', status: 'occupied', risk: 'low', patient: { name: 'Suresh Rao', age: 45, gender: 'Male', abha: '7722 6611 5544', admission: '14 Feb 2025', doctor: 'Dr. Sharma', riskScore: 28, riskLabel: 'Low risk - Recovery on track', mdr: false, vitals: { bp: '120/78 mmHg', hr: '76 bpm', spo2: '98%', temp: '36.9°C' } } },
            { id: 'B03', number: 'B03', status: 'occupied', risk: 'low', patient: { name: 'Reema Jain', age: 38, gender: 'Female', abha: '6633 5522 4411', admission: '15 Feb 2025', doctor: 'Dr. Patel', riskScore: 24, riskLabel: 'Low risk - Stable', mdr: false, vitals: { bp: '118/74 mmHg', hr: '74 bpm', spo2: '97%', temp: '37.1°C' } } },
            { id: 'B04', number: 'B04', status: 'occupied', risk: 'critical', patient: { name: 'Joseph Daniel', age: 63, gender: 'Male', abha: '5544 4433 3322', admission: '10 Feb 2025', doctor: 'Dr. Thomas', riskScore: 82, riskLabel: 'High risk - Post-op complications', mdr: false, vitals: { bp: '95/60 mmHg', hr: '108 bpm', spo2: '90%', temp: '38.3°C' } } },
            { id: 'B05', number: 'B05', status: 'occupied', risk: 'medium', patient: { name: 'Ritu Kulkarni', age: 47, gender: 'Female', abha: '4455 3344 2233', admission: '12 Feb 2025', doctor: 'Dr. Joshi', riskScore: 52, riskLabel: 'Moderate risk - Monitoring', mdr: false, vitals: { bp: '128/84 mmHg', hr: '86 bpm', spo2: '94%', temp: '37.6°C' } } },
            { id: 'B06', number: 'B06', status: 'occupied', risk: 'low', patient: { name: 'Neha Sood', age: 35, gender: 'Female', abha: '3366 2255 1144', admission: '16 Feb 2025', doctor: 'Dr. Malhotra', riskScore: 22, riskLabel: 'Low risk - Good progress', mdr: false, vitals: { bp: '115/72 mmHg', hr: '72 bpm', spo2: '98%', temp: '36.8°C' } } },
            { id: 'B07', number: 'B07', status: 'occupied', risk: 'medium', patient: { name: 'Karan Iyer', age: 56, gender: 'Male', abha: '2277 1166 9955', admission: '11 Feb 2025', doctor: 'Dr. Menon', riskScore: 58, riskLabel: 'Moderate risk - Close watch', mdr: false, vitals: { bp: '130/86 mmHg', hr: '90 bpm', spo2: '93%', temp: '37.7°C' } } },
            { id: 'B08', number: 'B08', status: 'occupied', risk: 'low', patient: { name: 'Rishi Patel', age: 42, gender: 'Male', abha: '1188 9977 8866', admission: '15 Feb 2025', doctor: 'Dr. Shah', riskScore: 26, riskLabel: 'Low risk - Stable', mdr: false, vitals: { bp: '122/76 mmHg', hr: '78 bpm', spo2: '97%', temp: '37.0°C' } } },
            { id: 'B09', number: 'B09', status: 'occupied', risk: 'critical', patient: { name: 'Divya Sen', age: 59, gender: 'Female', abha: '9988 8877 7766', admission: '09 Feb 2025', doctor: 'Dr. Gupta', riskScore: 76, riskLabel: 'High risk - Critical monitoring', mdr: false, vitals: { bp: '98/62 mmHg', hr: '104 bpm', spo2: '91%', temp: '38.1°C' } } },
            { id: 'B10', number: 'B10', status: 'occupied', risk: 'medium', patient: { name: 'Aarav Shah', age: 48, gender: 'Male', abha: '8877 7766 6655', admission: '13 Feb 2025', doctor: 'Dr. Chopra', riskScore: 50, riskLabel: 'Moderate risk - Observation', mdr: false, vitals: { bp: '126/82 mmHg', hr: '84 bpm', spo2: '94%', temp: '37.4°C' } } },
            { id: 'B11', number: 'B11', status: 'occupied', risk: 'low', patient: { name: 'Rohan Mehta', age: 40, gender: 'Male', abha: '7766 6655 5544', admission: '16 Feb 2025', doctor: 'Dr. Bhatia', riskScore: 30, riskLabel: 'Low risk - Recovering', mdr: false, vitals: { bp: '120/78 mmHg', hr: '80 bpm', spo2: '96%', temp: '37.2°C' } } },
            { id: 'B12', number: 'B12', status: 'occupied', risk: 'medium', patient: { name: 'Priti Rao', age: 51, gender: 'Female', abha: '6655 5544 4433', admission: '12 Feb 2025', doctor: 'Dr. Nambiar', riskScore: 54, riskLabel: 'Moderate risk - Monitoring', mdr: false, vitals: { bp: '128/84 mmHg', hr: '88 bpm', spo2: '93%', temp: '37.6°C' } } },
            { id: 'B13', number: 'B13', status: 'occupied', risk: 'low', patient: { name: 'Sanjay Kumar', age: 44, gender: 'Male', abha: '5544 4433 3322', admission: '14 Feb 2025', doctor: 'Dr. Verma', riskScore: 32, riskLabel: 'Low risk - Stable', mdr: false, vitals: { bp: '118/74 mmHg', hr: '76 bpm', spo2: '97%', temp: '37.1°C' } } },
            { id: 'B14', number: 'B14', status: 'occupied', risk: 'medium', patient: { name: 'Anjali Desai', age: 53, gender: 'Female', abha: '4433 3322 2211', admission: '11 Feb 2025', doctor: 'Dr. Reddy', riskScore: 56, riskLabel: 'Moderate risk - Close monitoring', mdr: false, vitals: { bp: '130/86 mmHg', hr: '90 bpm', spo2: '93%', temp: '37.7°C' } } },
            // 2 Empty beds
            { id: 'B15', number: 'B15', status: 'empty', risk: 'none' },
            { id: 'B16', number: 'B16', status: 'empty', risk: 'none' }
        ]
    },
    'general': {
        name: 'General Ward - General Medicine',
        code: 'G',
        totalBeds: 24,
        occupied: 18,
        beds: [
            // 18 Occupied beds (NO MDR)
            { id: 'G01', number: 'G01', status: 'occupied', risk: 'low', patient: { name: 'Pooja Deshmukh', age: 36, gender: 'Female', abha: '3322 2211 1100', admission: '15 Feb 2025', doctor: 'Dr. Kulkarni', riskScore: 22, riskLabel: 'Low risk - Routine care', mdr: false, vitals: { bp: '118/74 mmHg', hr: '72 bpm', spo2: '98%', temp: '36.8°C' } } },
            { id: 'G02', number: 'G02', status: 'occupied', risk: 'low', patient: { name: 'Kiran Prasad', age: 42, gender: 'Male', abha: '2211 1100 9988', admission: '14 Feb 2025', doctor: 'Dr. Rao', riskScore: 26, riskLabel: 'Low risk - Stable', mdr: false, vitals: { bp: '120/76 mmHg', hr: '74 bpm', spo2: '97%', temp: '37.0°C' } } },
            { id: 'G03', number: 'G03', status: 'occupied', risk: 'medium', patient: { name: 'Manohar Das', age: 58, gender: 'Male', abha: '1100 9988 8877', admission: '12 Feb 2025', doctor: 'Dr. Singh', riskScore: 48, riskLabel: 'Moderate risk - Observation', mdr: false, vitals: { bp: '128/84 mmHg', hr: '86 bpm', spo2: '94%', temp: '37.5°C' } } },
            { id: 'G04', number: 'G04', status: 'occupied', risk: 'low', patient: { name: 'Sneha Tiwari', age: 31, gender: 'Female', abha: '9988 8877 7766', admission: '16 Feb 2025', doctor: 'Dr. Jain', riskScore: 20, riskLabel: 'Low risk - Good condition', mdr: false, vitals: { bp: '115/72 mmHg', hr: '70 bpm', spo2: '98%', temp: '36.9°C' } } },
            { id: 'G05', number: 'G05', status: 'occupied', risk: 'low', patient: { name: 'Hemant Kulkarni', age: 45, gender: 'Male', abha: '8877 7766 6655', admission: '15 Feb 2025', doctor: 'Dr. Desai', riskScore: 28, riskLabel: 'Low risk - Stable', mdr: false, vitals: { bp: '122/78 mmHg', hr: '76 bpm', spo2: '97%', temp: '37.1°C' } } },
            { id: 'G06', number: 'G06', status: 'occupied', risk: 'medium', patient: { name: 'Saba Ali', age: 52, gender: 'Female', abha: '7766 6655 5544', admission: '13 Feb 2025', doctor: 'Dr. Khan', riskScore: 52, riskLabel: 'Moderate risk - Monitoring', mdr: false, vitals: { bp: '130/86 mmHg', hr: '88 bpm', spo2: '93%', temp: '37.6°C' } } },
            { id: 'G07', number: 'G07', status: 'occupied', risk: 'low', patient: { name: 'Riti Mahajan', age: 39, gender: 'Female', abha: '6655 5544 4433', admission: '16 Feb 2025', doctor: 'Dr. Mehta', riskScore: 24, riskLabel: 'Low risk - Recovering', mdr: false, vitals: { bp: '118/74 mmHg', hr: '74 bpm', spo2: '97%', temp: '37.0°C' } } },
            { id: 'G08', number: 'G08', status: 'occupied', risk: 'low', patient: { name: 'Rajeev Sharma', age: 47, gender: 'Male', abha: '5544 4433 3322', admission: '14 Feb 2025', doctor: 'Dr. Gupta', riskScore: 30, riskLabel: 'Low risk - Stable', mdr: false, vitals: { bp: '120/78 mmHg', hr: '78 bpm', spo2: '96%', temp: '37.2°C' } } },
            { id: 'G09', number: 'G09', status: 'occupied', risk: 'low', patient: { name: 'Payal Gupta', age: 34, gender: 'Female', abha: '4433 3322 2211', admission: '15 Feb 2025', doctor: 'Dr. Patel', riskScore: 18, riskLabel: 'Low risk - Good progress', mdr: false, vitals: { bp: '115/72 mmHg', hr: '72 bpm', spo2: '98%', temp: '36.8°C' } } },
            { id: 'G10', number: 'G10', status: 'occupied', risk: 'medium', patient: { name: 'Dev Yadav', age: 55, gender: 'Male', abha: '3322 2211 1100', admission: '11 Feb 2025', doctor: 'Dr. Verma', riskScore: 50, riskLabel: 'Moderate risk - Observation', mdr: false, vitals: { bp: '128/84 mmHg', hr: '86 bpm', spo2: '94%', temp: '37.5°C' } } },
            { id: 'G11', number: 'G11', status: 'occupied', risk: 'low', patient: { name: 'Arpit Singh', age: 41, gender: 'Male', abha: '2211 1100 9988', admission: '16 Feb 2025', doctor: 'Dr. Sharma', riskScore: 26, riskLabel: 'Low risk - Stable', mdr: false, vitals: { bp: '120/76 mmHg', hr: '76 bpm', spo2: '97%', temp: '37.1°C' } } },
            { id: 'G12', number: 'G12', status: 'occupied', risk: 'low', patient: { name: 'Rohini Patil', age: 38, gender: 'Female', abha: '1100 9988 8877', admission: '15 Feb 2025', doctor: 'Dr. Kulkarni', riskScore: 22, riskLabel: 'Low risk - Good condition', mdr: false, vitals: { bp: '118/74 mmHg', hr: '74 bpm', spo2: '98%', temp: '36.9°C' } } },
            { id: 'G13', number: 'G13', status: 'occupied', risk: 'medium', patient: { name: 'Farah Khan', age: 49, gender: 'Female', abha: '9988 8877 7766', admission: '13 Feb 2025', doctor: 'Dr. Ali', riskScore: 46, riskLabel: 'Moderate risk - Monitoring', mdr: false, vitals: { bp: '126/82 mmHg', hr: '84 bpm', spo2: '94%', temp: '37.4°C' } } },
            { id: 'G14', number: 'G14', status: 'occupied', risk: 'low', patient: { name: 'Tanmay Bansal', age: 43, gender: 'Male', abha: '8877 7766 6655', admission: '14 Feb 2025', doctor: 'Dr. Joshi', riskScore: 28, riskLabel: 'Low risk - Stable', mdr: false, vitals: { bp: '122/78 mmHg', hr: '78 bpm', spo2: '97%', temp: '37.2°C' } } },
            { id: 'G15', number: 'G15', status: 'occupied', risk: 'low', patient: { name: 'Irfan Ali', age: 37, gender: 'Male', abha: '7766 6655 5544', admission: '16 Feb 2025', doctor: 'Dr. Khan', riskScore: 24, riskLabel: 'Low risk - Recovering', mdr: false, vitals: { bp: '118/74 mmHg', hr: '74 bpm', spo2: '98%', temp: '37.0°C' } } },
            { id: 'G16', number: 'G16', status: 'occupied', risk: 'low', patient: { name: 'Sameer Rao', age: 46, gender: 'Male', abha: '6655 5544 4433', admission: '15 Feb 2025', doctor: 'Dr. Reddy', riskScore: 30, riskLabel: 'Low risk - Stable', mdr: false, vitals: { bp: '120/78 mmHg', hr: '78 bpm', spo2: '96%', temp: '37.1°C' } } },
            { id: 'G17', number: 'G17', status: 'occupied', risk: 'low', patient: { name: 'Shweta Khanna', age: 33, gender: 'Female', abha: '5544 4433 3322', admission: '16 Feb 2025', doctor: 'Dr. Malhotra', riskScore: 20, riskLabel: 'Low risk - Good progress', mdr: false, vitals: { bp: '115/72 mmHg', hr: '72 bpm', spo2: '98%', temp: '36.8°C' } } },
            { id: 'G18', number: 'G18', status: 'occupied', risk: 'medium', patient: { name: 'Ankit Verma', age: 54, gender: 'Male', abha: '4433 3322 2211', admission: '12 Feb 2025', doctor: 'Dr. Singh', riskScore: 48, riskLabel: 'Moderate risk - Observation', mdr: false, vitals: { bp: '128/84 mmHg', hr: '86 bpm', spo2: '94%', temp: '37.5°C' } } },
            // 6 Empty beds
            { id: 'G19', number: 'G19', status: 'empty', risk: 'none' },
            { id: 'G20', number: 'G20', status: 'empty', risk: 'none' },
            { id: 'G21', number: 'G21', status: 'empty', risk: 'none' },
            { id: 'G22', number: 'G22', status: 'empty', risk: 'none' },
            { id: 'G23', number: 'G23', status: 'empty', risk: 'none' },
            { id: 'G24', number: 'G24', status: 'empty', risk: 'none' }
        ]
    },
    'mdr-isolation': {
        name: 'MDR Isolation Ward - Multi-Drug Resistant',
        code: 'M',
        totalBeds: 12,
        occupied: 11,
        beds: [
            // 11 Occupied beds (ALL MDR)
            { id: 'M01', number: 'M01', status: 'occupied', risk: 'mdr', patient: { name: 'Madhu Sharma', age: 68, gender: 'Female', abha: '3322 2211 1100', admission: '08 Feb 2025', doctor: 'Dr. Kapoor', riskScore: 89, riskLabel: 'Critical - MDR confirmed, strict isolation', mdr: true, vitals: { bp: '95/60 mmHg', hr: '102 bpm', spo2: '90%', temp: '38.6°C' } } },
            { id: 'M02', number: 'M02', status: 'occupied', risk: 'mdr', patient: { name: 'Danish Khan', age: 72, gender: 'Male', abha: '2211 1100 9988', admission: '06 Feb 2025', doctor: 'Dr. Ali', riskScore: 91, riskLabel: 'Critical - MDR organism, enhanced protocols', mdr: true, vitals: { bp: '98/62 mmHg', hr: '108 bpm', spo2: '89%', temp: '38.8°C' } } },
            { id: 'M03', number: 'M03', status: 'occupied', risk: 'mdr', patient: { name: 'Aarti Verma', age: 65, gender: 'Female', abha: '1100 9988 8877', admission: '07 Feb 2025', doctor: 'Dr. Gupta', riskScore: 87, riskLabel: 'Critical - MDR confirmed, isolation required', mdr: true, vitals: { bp: '92/58 mmHg', hr: '104 bpm', spo2: '88%', temp: '38.5°C' } } },
            { id: 'M04', number: 'M04', status: 'occupied', risk: 'mdr', patient: { name: 'Vinod Patel', age: 70, gender: 'Male', abha: '9988 8877 7766', admission: '05 Feb 2025', doctor: 'Dr. Shah', riskScore: 93, riskLabel: 'Critical - MDR, intensive monitoring', mdr: true, vitals: { bp: '90/56 mmHg', hr: '110 bpm', spo2: '87%', temp: '39.0°C' } } },
            { id: 'M05', number: 'M05', status: 'occupied', risk: 'mdr', patient: { name: 'Rajni Singh', age: 63, gender: 'Female', abha: '8877 7766 6655', admission: '09 Feb 2025', doctor: 'Dr. Verma', riskScore: 85, riskLabel: 'Critical - MDR confirmed, strict protocols', mdr: true, vitals: { bp: '96/62 mmHg', hr: '100 bpm', spo2: '90%', temp: '38.4°C' } } },
            { id: 'M06', number: 'M06', status: 'occupied', risk: 'mdr', patient: { name: 'Harish Rao', age: 69, gender: 'Male', abha: '7766 6655 5544', admission: '07 Feb 2025', doctor: 'Dr. Reddy', riskScore: 88, riskLabel: 'Critical - MDR organism detected', mdr: true, vitals: { bp: '94/60 mmHg', hr: '106 bpm', spo2: '89%', temp: '38.7°C' } } },
            { id: 'M07', number: 'M07', status: 'occupied', risk: 'mdr', patient: { name: 'Farida Ali', age: 66, gender: 'Female', abha: '6655 5544 4433', admission: '08 Feb 2025', doctor: 'Dr. Khan', riskScore: 90, riskLabel: 'Critical - MDR confirmed, isolation', mdr: true, vitals: { bp: '93/58 mmHg', hr: '105 bpm', spo2: '88%', temp: '38.9°C' } } },
            { id: 'M08', number: 'M08', status: 'occupied', risk: 'mdr', patient: { name: 'Gopal Das', age: 71, gender: 'Male', abha: '5544 4433 3322', admission: '06 Feb 2025', doctor: 'Dr. Mishra', riskScore: 92, riskLabel: 'Critical - MDR, enhanced monitoring', mdr: true, vitals: { bp: '91/57 mmHg', hr: '109 bpm', spo2: '87%', temp: '39.1°C' } } },
            { id: 'M09', number: 'M09', status: 'occupied', risk: 'mdr', patient: { name: 'Manju Devi', age: 64, gender: 'Female', abha: '4433 3322 2211', admission: '09 Feb 2025', doctor: 'Dr. Joshi', riskScore: 86, riskLabel: 'Critical - MDR confirmed, strict isolation', mdr: true, vitals: { bp: '97/61 mmHg', hr: '103 bpm', spo2: '90%', temp: '38.5°C' } } },
            { id: 'M10', number: 'M10', status: 'occupied', risk: 'mdr', patient: { name: 'Lokesh Meena', age: 67, gender: 'Male', abha: '3322 2211 1100', admission: '07 Feb 2025', doctor: 'Dr. Sharma', riskScore: 88, riskLabel: 'Critical - MDR organism, protocols active', mdr: true, vitals: { bp: '95/59 mmHg', hr: '104 bpm', spo2: '89%', temp: '38.6°C' } } },
            { id: 'M11', number: 'M11', status: 'occupied', risk: 'mdr', patient: { name: 'Rafiq Mohammad', age: 73, gender: 'Male', abha: '2211 1100 9988', admission: '05 Feb 2025', doctor: 'Dr. Ali', riskScore: 94, riskLabel: 'Critical - MDR confirmed, intensive care', mdr: true, vitals: { bp: '89/55 mmHg', hr: '112 bpm', spo2: '86%', temp: '39.2°C' } } },
            // 1 Empty bed
            { id: 'M12', number: 'M12', status: 'empty', risk: 'none' }
        ]
    },
    'surgical': {
        name: 'Surgical Ward - Post-Operative Care',
        code: 'S',
        totalBeds: 12,
        occupied: 2,
        beds: [
            // 2 Occupied beds (NO MDR)
            { id: 'S01', number: 'S01', status: 'occupied', risk: 'low', patient: { name: 'Rahul Soni', age: 40, gender: 'Male', abha: '1133 2244 5566', admission: '17 Feb 2025', doctor: 'Dr. Kulkarni', riskScore: 28, riskLabel: 'Low risk - Post-op recovery on track', mdr: false, vitals: { bp: '120/75 mmHg', hr: '75 bpm', spo2: '97%', temp: '37.2°C' } } },
            { id: 'S02', number: 'S02', status: 'occupied', risk: 'low', patient: { name: 'Shreya Nair', age: 33, gender: 'Female', abha: '4466 7788 9900', admission: '18 Feb 2025', doctor: 'Dr. Batra', riskScore: 22, riskLabel: 'Low risk - Recovering well', mdr: false, vitals: { bp: '118/74 mmHg', hr: '72 bpm', spo2: '98%', temp: '36.9°C' } } },
            // 10 Empty beds
            { id: 'S03', number: 'S03', status: 'empty', risk: 'none' },
            { id: 'S04', number: 'S04', status: 'empty', risk: 'none' },
            { id: 'S05', number: 'S05', status: 'empty', risk: 'none' },
            { id: 'S06', number: 'S06', status: 'empty', risk: 'none' },
            { id: 'S07', number: 'S07', status: 'empty', risk: 'none' },
            { id: 'S08', number: 'S08', status: 'empty', risk: 'none' },
            { id: 'S09', number: 'S09', status: 'empty', risk: 'none' },
            { id: 'S10', number: 'S10', status: 'empty', risk: 'none' },
            { id: 'S11', number: 'S11', status: 'empty', risk: 'none' },
            { id: 'S12', number: 'S12', status: 'empty', risk: 'none' }
        ]
    }
};

let currentWard = null;
let selectedBedId = null;

function selectWard(wardId) {
    currentWard = wardId;
    const config = wardConfigs[wardId];

    // Hide ward selection, show ward detail
    document.getElementById('ward-selection-screen').classList.add('hidden');
    document.getElementById('ward-detail-screen').classList.remove('hidden');

    // Update ward header
    document.getElementById('ward-detail-name').textContent = config.name;
    document.getElementById('ward-detail-info').textContent =
        `${config.totalBeds} beds • ${config.occupied} occupied • ${config.totalBeds - config.occupied} available`;

    // Render beds
    renderBeds(config.beds);
}

function backToWardSelection() {
    document.getElementById('ward-selection-screen').classList.remove('hidden');
    document.getElementById('ward-detail-screen').classList.add('hidden');
    closePanel();
    currentWard = null;
}

function renderBeds(beds) {
    const container = document.getElementById('beds-container');
    container.innerHTML = '';

    // Split beds into exactly 2 rows (first half and second half)
    const totalBeds = beds.length;
    const bedsPerRow = Math.ceil(totalBeds / 2);

    const row1Beds = beds.slice(0, bedsPerRow);
    const row2Beds = beds.slice(bedsPerRow);

    // Create Row 1
    const row1Div = document.createElement('div');
    row1Div.className = 'flex justify-center gap-4 mb-12';

    row1Beds.forEach((bed) => {
        const bedWrapper = createBedElement(bed, true);
        row1Div.appendChild(bedWrapper);
    });

    container.appendChild(row1Div);

    // Create Row 2 (if there are beds in second half)
    if (row2Beds.length > 0) {
        const row2Div = document.createElement('div');
        row2Div.className = 'flex justify-center gap-4';

        row2Beds.forEach((bed) => {
            const bedWrapper = createBedElement(bed, false);
            row2Div.appendChild(bedWrapper);
        });

        container.appendChild(row2Div);
    }
}

function createBedElement(bed, isRow1) {
    const bedWrapper = document.createElement('div');
    bedWrapper.className = 'relative flex-shrink-0';
    bedWrapper.style.width = '140px';

    const glowClass = bed.status === 'empty' ? 'glow-empty' :
        bed.risk === 'critical' ? 'glow-critical' :
            bed.risk === 'mdr' ? 'glow-mdr' :
                bed.risk === 'medium' ? 'glow-medium' : 'glow-low';

    const statusIcon = bed.status === 'empty' ? '○' :
        bed.risk === 'critical' ? '!' :
            bed.risk === 'mdr' ? '⚠' :
                bed.risk === 'medium' ? '~' : '✓';

    const statusColor = bed.status === 'empty' ? 'slate' :
        bed.risk === 'critical' ? 'rose' :
            bed.risk === 'mdr' ? 'violet' :
                bed.risk === 'medium' ? 'amber' : 'emerald';

    const statusLabel = bed.status === 'empty' ? 'EMPTY' :
        bed.risk === 'critical' ? 'CRITICAL' :
            bed.risk === 'mdr' ? 'MDR' :
                bed.risk === 'medium' ? 'MEDIUM' : 'STABLE';

    bedWrapper.innerHTML = `
    <button
      type="button"
      class="hospital-bed focus-ring w-full"
      data-bed-id="${bed.id}"
      onclick="selectBed('${bed.id}')"
    >
      <div class="bed-frame rounded-xl p-3 ${glowClass}">
        <div class="status-indicator">
          <div class="w-5 h-5 rounded-full bg-${statusColor}-${bed.status === 'empty' ? '400' : '500'} border-2 border-white flex items-center justify-center shadow-lg">
            <span class="text-white text-xs font-bold">${statusIcon}</span>
          </div>
        </div>

        <div class="relative">
          <div class="bed-rail h-1.5 rounded-t-lg mb-1"></div>
          <div class="bed-mattress rounded-lg p-2">
            <div class="bed-pillow h-6 rounded-md mb-1.5"></div>
            <div class="h-16 bg-gradient-to-b from-white to-slate-50 rounded-md border border-slate-200"></div>
          </div>
          <div class="bed-rail h-1.5 rounded-b-lg mt-1"></div>
          <div class="bed-rail absolute left-0 top-1.5 bottom-1.5 w-1 rounded-l-lg"></div>
          <div class="bed-rail absolute right-0 top-1.5 bottom-1.5 w-1 rounded-r-lg"></div>
        </div>

        <div class="mt-2 bg-white/95 backdrop-blur-sm rounded-lg p-2 border border-slate-200 shadow-md">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-bold text-slate-900">${bed.number}</span>
            <span class="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-${statusColor}-100 text-${statusColor}-700 border border-${statusColor}-300">
              ${statusLabel}
            </span>
          </div>
          ${bed.status === 'occupied' ? `
            <p class="text-[10px] text-slate-700 font-medium truncate">${bed.patient.name}</p>
            <p class="text-[8px] text-slate-500 mt-0.5">${bed.patient.age}y • ${bed.patient.gender[0]} • ${bed.patient.doctor}</p>
            <div class="mt-1.5 flex items-center justify-between">
              <span class="text-[8px] text-slate-500">Risk</span>
              <span class="text-[10px] font-bold text-${statusColor}-600">${bed.patient.riskScore}%</span>
            </div>
            <div class="mt-1 h-1 bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full bg-${statusColor}-500 rounded-full" style="width: ${bed.patient.riskScore}%;"></div>
            </div>
          ` : `
            <p class="text-[10px] text-slate-500 font-medium">Available</p>
            <p class="text-[8px] text-slate-400 mt-0.5">Ready for admission</p>
            <div class="mt-1.5 flex items-center justify-center py-0.5">
              <span class="text-[8px] text-slate-400">Cleaned today</span>
            </div>
          `}
        </div>
      </div>
    </button>

    ${bed.status === 'occupied' && isRow1 ? `
      <div class="absolute -right-4 top-6 flex flex-col items-center">
        <div class="iv-stand w-0.5 h-20 rounded-full"></div>
        <div class="iv-bag w-4 h-6 rounded-lg border border-slate-300 -mt-16 ml-3"></div>
      </div>
    ` : ''}
    
    ${isRow1 ? `
      <div class="bedside-table absolute -left-6 top-14 w-6 h-8 rounded border border-slate-300"></div>
      <div class="oxygen-port absolute -left-8 top-8 w-3 h-3 rounded-full border-2 border-white"></div>
      <div class="curtain absolute -right-3 top-0 bottom-0 w-1.5 opacity-60"></div>
    ` : ''}
  `;

    return bedWrapper;
}

function selectBed(bedId) {
    if (!currentWard) return;

    const config = wardConfigs[currentWard];
    const bed = config.beds.find(b => b.id === bedId);
    if (!bed) return;

    selectedBedId = bedId;

    // Remove previous selection
    document.querySelectorAll('.hospital-bed').forEach(b => {
        b.classList.remove('bed-selected');
    });

    // Add selection to clicked bed
    const bedElement = document.querySelector(`[data-bed-id="${bedId}"]`);
    if (bedElement) {
        bedElement.classList.add('bed-selected');
    }

    if (bed.status === 'empty') {
        // Show empty bed info
        document.getElementById('detail-bed-number').textContent = bed.number;
        document.getElementById('detail-patient-name').textContent = 'Empty Bed';
        document.getElementById('detail-patient-meta').textContent = 'Available for admission';
        document.getElementById('detail-abha').textContent = '—';
        document.getElementById('detail-admission').textContent = '—';
        document.getElementById('detail-doctor').textContent = '—';

        const statusBadge = document.getElementById('detail-status-badge');
        statusBadge.textContent = 'EMPTY';
        statusBadge.className = 'px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border-2 border-slate-300';

        document.getElementById('detail-risk-percent').textContent = '—';
        document.getElementById('detail-risk-label').textContent = 'Bed available for admission';
        document.getElementById('detail-risk-bar').style.width = '0%';
        document.getElementById('detail-mdr-section').classList.add('hidden');

        document.getElementById('detail-bp').textContent = '—';
        document.getElementById('detail-hr').textContent = '—';
        document.getElementById('detail-spo2').textContent = '—';
        document.getElementById('detail-temp').textContent = '—';
    } else {
        // Show patient info
        const patient = bed.patient;

        document.getElementById('detail-bed-number').textContent = bed.number;
        document.getElementById('detail-patient-name').textContent = patient.name;
        document.getElementById('detail-patient-meta').textContent = `${patient.age} years • ${patient.gender}`;
        document.getElementById('detail-abha').textContent = patient.abha;
        document.getElementById('detail-admission').textContent = patient.admission;
        document.getElementById('detail-doctor').textContent = patient.doctor;

        const statusColor = bed.risk === 'critical' ? 'rose' :
            bed.risk === 'mdr' ? 'violet' :
                bed.risk === 'medium' ? 'amber' : 'emerald';

        const statusLabel = bed.risk === 'critical' ? 'CRITICAL' :
            bed.risk === 'mdr' ? 'MDR' :
                bed.risk === 'medium' ? 'MEDIUM' : 'STABLE';

        const statusBadge = document.getElementById('detail-status-badge');
        statusBadge.textContent = statusLabel;
        statusBadge.className = `px-3 py-1.5 rounded-full text-xs font-bold bg-${statusColor}-100 text-${statusColor}-700 border-2 border-${statusColor}-300`;

        document.getElementById('detail-risk-percent').textContent = patient.riskScore + '%';
        document.getElementById('detail-risk-label').textContent = patient.riskLabel;

        const riskBar = document.getElementById('detail-risk-bar');
        riskBar.style.width = patient.riskScore + '%';
        riskBar.className = `h-full bg-${statusColor}-500 rounded-full transition-all duration-500`;

        const mdrSection = document.getElementById('detail-mdr-section');
        if (patient.mdr) {
            mdrSection.classList.remove('hidden');
        } else {
            mdrSection.classList.add('hidden');
        }

        document.getElementById('detail-bp').textContent = patient.vitals.bp;
        document.getElementById('detail-hr').textContent = patient.vitals.hr;
        document.getElementById('detail-spo2').textContent = patient.vitals.spo2;
        document.getElementById('detail-temp').textContent = patient.vitals.temp;
    }

    // Show panel
    const panel = document.getElementById('info-panel');
    panel.classList.remove('hidden');
    panel.classList.add('flex');
}

function closePanel() {
    const panel = document.getElementById('info-panel');
    panel.classList.add('hidden');
    panel.classList.remove('flex');

    document.querySelectorAll('.hospital-bed').forEach(bed => {
        bed.classList.remove('bed-selected');
    });
    selectedBedId = null;
}

function updateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata'
    }) + ' IST';
    const timeEl = document.getElementById('current-time');
    if (timeEl) {
        timeEl.textContent = timeStr;
    }
}

// Initialize
updateTime();
setInterval(updateTime, 60000);

// Element SDK integration
if (window.elementSdk) {
    const defaultConfig = {
        hospital_name: 'Apollo Medical Center',
        system_subtitle: 'Real-time ward monitoring & bed status intelligence'
    };

    window.elementSdk.init({
        defaultConfig,
        onConfigChange: async (config) => {
            const effective = { ...defaultConfig, ...(config || {}) };

            const hospitalName = document.getElementById('hospital-name');
            const systemSubtitle = document.getElementById('system-subtitle');

            if (hospitalName) hospitalName.textContent = effective.hospital_name;
            if (systemSubtitle) systemSubtitle.textContent = effective.system_subtitle;
        },
        mapToCapabilities: () => ({
            recolorables: [],
            borderables: [],
            fontEditable: undefined,
            fontSizeable: undefined
        }),
        mapToEditPanelValues: (config) => new Map([
            ['hospital_name', config.hospital_name || defaultConfig.hospital_name],
            ['system_subtitle', config.system_subtitle || defaultConfig.system_subtitle]
        ])
    });
}