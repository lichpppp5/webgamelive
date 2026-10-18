@echo off
chcp 65001 > nul
title Đẩy Code MasterKey Lên GitHub
color 0a
echo ========================================================
echo   ĐANG ĐẨY CODE MASTERKEY LÊN GITHUB REPOSITORY...     
echo ========================================================
cd /d "D:\DA Game\webgamelive"
git push origin main
echo ========================================================
if %errorlevel% equ 0 (
    echo [OK] ĐÃ ĐẨY CODE LÊN GITHUB THÀNH CÔNG!
    echo Bây giờ bạn có thể lên server gõ: git pull
) else (
    echo [LỖI] Đẩy code thất bại. Vui lòng kiểm tra quyền đăng nhập GitHub.
)
echo ========================================================
pause
