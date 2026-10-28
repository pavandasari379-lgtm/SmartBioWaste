import os
import sys

from fastapi.testclient import TestClient
from app.main import app, on_startup

# Run startup initialization
on_startup()
client = TestClient(app)

print('--- TEST 1: Health Check ---')
res = client.get('/api/health')
assert res.status_code == 200, f'Health failed: {res.text}'
print('Health check passed:', res.json())

print('\n--- TEST 2: Auth Login ---')
res = client.post('/api/auth/login', json={'email': 'admin@smartbiowaste.ai', 'password': 'Admin@12345'})
assert res.status_code == 200, f'Login failed: {res.text}'
token = res.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}
print('Login successful! Role:', res.json()['user']['role'])

print('\n--- TEST 3: Auth Profile ---')
res = client.get('/api/auth/me', headers=headers)
assert res.status_code == 200
print('User profile verified:', res.json()['full_name'])

print('\n--- TEST 4: Image Quality Check ---')
sample_img_path = '../uploads/test_syringe.jpg'
with open(sample_img_path, 'rb') as f:
    res = client.post('/api/image-quality', files={'file': ('test_syringe.jpg', f, 'image/jpeg')})
assert res.status_code == 200
print('Quality check passed:', res.json())

print('\n--- TEST 5: AI Waste Prediction & Grad-CAM ---')
with open(sample_img_path, 'rb') as f:
    res = client.post('/api/predict', files={'file': ('test_syringe.jpg', f, 'image/jpeg')}, headers=headers)
assert res.status_code == 200, f'Prediction failed: {res.text}'
pred = res.json()
print('Predicted class:', pred['predicted_class'])
print('Confidence:', pred['confidence'], f"({pred['confidence_level']})")
print('Destination Bin:', pred['recommended_bin'])
print('Grad-CAM Path:', pred['gradcam_image'])
print('Scan ID:', pred['scan_id'])
assert pred['gradcam_image'] is not None, 'Grad-CAM image not generated!'

print('\n--- TEST 6: Categories & Safety ---')
res = client.get('/api/waste/categories')
assert res.status_code == 200 and len(res.json()) >= 9
print(f"Retrieved {len(res.json())} categories.")

res = client.get('/api/safety/sharps')
assert res.status_code == 200
print('Sharps PPE count:', len(res.json()['ppe']))

print('\n--- TEST 7: Analytics ---')
res = client.get('/api/analytics/overview')
assert res.status_code == 200
print('Analytics overview:', res.json())

res = client.get('/api/analytics/trends?days=7')
assert res.status_code == 200, f'Analytics trends failed: {res.text}'
assert len(res.json()) == 7, f'Expected 7 trend days, got {len(res.json())}'
print('Analytics trend history verified.')

print('\n--- TEST 8: Smart Collection Bins ---')
res = client.get('/api/bins')
assert res.status_code == 200
print(f"Retrieved {len(res.json())} bins.")

print('\n--- TEST 9: Incidents ---')
res = client.get('/api/incidents')
assert res.status_code == 200
print(f"Retrieved {len(res.json())} incident reports.")

print('\n--- TEST 10: Voice Assistant Query ---')
res = client.post('/api/voice/query', json={'query': 'Where should a used syringe go?', 'language': 'en'})
assert res.status_code == 200
print('Voice Assistant response:', res.json()['response_text'])
print('Detected category:', res.json()['detected_category'])

print('\n--- TEST 11: Waste Forecast ML ---')
res = client.post('/api/waste-prediction', json={'horizon': 'next_7_days'})
assert res.status_code == 200
print('Total estimated kg (next 7 days):', res.json()['total_estimated_kg'])

print('\n=============================================')
print('ALL 11 END-TO-END SYSTEM TESTS PASSED CLEANLY!')
print('=============================================')
