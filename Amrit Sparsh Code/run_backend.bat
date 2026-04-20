@echo off
echo Starting Amrit Sparsh Backend...
call myenv\Scripts\activate
uvicorn backend.main:app --reload
pause
