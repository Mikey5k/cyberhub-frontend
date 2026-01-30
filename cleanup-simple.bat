@echo off
echo Firestore Cleanup Script
echo ========================
echo.

set FIREBASE_API_KEY=AIzaSyA0p_nIsI-RaM4AKNq5JTOHAt6dF76fC_w
set PROJECT_ID=studio-4109137205-4e150

echo Users to KEEP:
echo 1. Ronny Odhiambo (ID: " 254729626011")
echo 2. Your Gmail admin (ID: user_1769745513883_lcwguyyin)
echo 3. Veritas admin (ID: user_1769745406772_4hffesbhk)
echo.

echo Deleting all other users...
echo.

:: Delete users (one by one - modify as needed)
curl -X DELETE "https://firestore.googleapis.com/v1/projects/%PROJECT_ID%/databases/(default)/documents/users/ 0708949580?key=%FIREBASE_API_KEY%"
curl -X DELETE "https://firestore.googleapis.com/v1/projects/%PROJECT_ID%/databases/(default)/documents/users/ 0799345677?key=%FIREBASE_API_KEY%"
curl -X DELETE "https://firestore.googleapis.com/v1/projects/%PROJECT_ID%/databases/(default)/documents/users/ 254700000000?key=%FIREBASE_API_KEY%"
curl -X DELETE "https://firestore.googleapis.com/v1/projects/%PROJECT_ID%/databases/(default)/documents/users/ 254712345678?key=%FIREBASE_API_KEY%"
curl -X DELETE "https://firestore.googleapis.com/v1/projects/%PROJECT_ID%/databases/(default)/documents/users/ 254715554444?key=%FIREBASE_API_KEY%"
curl -X DELETE "https://firestore.googleapis.com/v1/projects/%PROJECT_ID%/databases/(default)/documents/users/ 254722334455?key=%FIREBASE_API_KEY%"
curl -X DELETE "https://firestore.googleapis.com/v1/projects/%PROJECT_ID%/databases/(default)/documents/users/ 254733445566?key=%FIREBASE_API_KEY%"
curl -X DELETE "https://firestore.googleapis.com/v1/projects/%PROJECT_ID%/databases/(default)/documents/users/+254700000001?key=%FIREBASE_API_KEY%"
curl -X DELETE "https://firestore.googleapis.com/v1/projects/%PROJECT_ID%/databases/(default)/documents/users/+254700000003?key=%FIREBASE_API_KEY%"
curl -X DELETE "https://firestore.googleapis.com/v1/projects/%PROJECT_ID%/databases/(default)/documents/users/+254711111111?key=%FIREBASE_API_KEY%"
curl -X DELETE "https://firestore.googleapis.com/v1/projects/%PROJECT_ID%/databases/(default)/documents/users/+254712345678?key=%FIREBASE_API_KEY%"
curl -X DELETE "https://firestore.googleapis.com/v1/projects/%PROJECT_ID%/databases/(default)/documents/users/+254722222222?key=%FIREBASE_API_KEY%"
curl -X DELETE "https://firestore.googleapis.com/v1/projects/%PROJECT_ID%/databases/(default)/documents/users/+254733333333?key=%FIREBASE_API_KEY%"
curl -X DELETE "https://firestore.googleapis.com/v1/projects/%PROJECT_ID%/databases/(default)/documents/users/+254744444444?key=%FIREBASE_API_KEY%"
curl -X DELETE "https://firestore.googleapis.com/v1/projects/%PROJECT_ID%/databases/(default)/documents/users/+254799999999?key=%FIREBASE_API_KEY%"
curl -X DELETE "https://firestore.googleapis.com/v1/projects/%PROJECT_ID%/databases/(default)/documents/users/0719998888?key=%FIREBASE_API_KEY%"
curl -X DELETE "https://firestore.googleapis.com/v1/projects/%PROJECT_ID%/databases/(default)/documents/users/_plus_0708949580?key=%FIREBASE_API_KEY%"
curl -X DELETE "https://firestore.googleapis.com/v1/projects/%PROJECT_ID%/databases/(default)/documents/users/_plus_074433211333?key=%FIREBASE_API_KEY%"
curl -X DELETE "https://firestore.googleapis.com/v1/projects/%PROJECT_ID%/databases/(default)/documents/users/user_1769668565213_js0o09jcl?key=%FIREBASE_API_KEY%"
curl -X DELETE "https://firestore.googleapis.com/v1/projects/%PROJECT_ID%/databases/(default)/documents/users/user_1769689851942_vnrpofqs2?key=%FIREBASE_API_KEY%"
curl -X DELETE "https://firestore.googleapis.com/v1/projects/%PROJECT_ID%/databases/(default)/documents/users/user_1769690105494_vi9tg2gql?key=%FIREBASE_API_KEY%"
curl -X DELETE "https://firestore.googleapis.com/v1/projects/%PROJECT_ID%/databases/(default)/documents/users/user_1769732026616_wu9p0ovu6?key=%FIREBASE_API_KEY%"

echo.
echo Cleanup complete!
echo.
echo Remaining users:
curl -X GET "https://cyberhub-frontend.vercel.app/api/users?getAll=true&adminKey=veritas-admin-2024"