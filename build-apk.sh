#!/bin/bash

echo "=========================================="
echo "직원 급여 관리 앱 APK 빌드 스크립트"
echo "=========================================="
echo ""

# EAS 로그인 확인
echo "1단계: Expo 계정 로그인 확인"
if ! eas whoami &> /dev/null; then
    echo "Expo 계정에 로그인해야 합니다."
    echo "다음 명령어를 실행하세요: eas login"
    echo ""
    read -p "로그인을 완료하셨나요? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "빌드를 취소합니다."
        exit 1
    fi
fi

echo "✓ 로그인 확인 완료"
echo ""

# 프로젝트 설정
echo "2단계: 프로젝트 설정"
if [ ! -f "eas.json" ]; then
    echo "eas.json 파일이 없습니다. 설정을 진행합니다..."
    eas build:configure
else
    echo "✓ 프로젝트 설정 완료"
fi
echo ""

# Android APK 빌드
echo "3단계: Android APK 빌드 시작"
echo "이 작업은 약 10-20분이 소요될 수 있습니다..."
echo ""

eas build --platform android --profile preview

echo ""
echo "=========================================="
echo "빌드가 완료되면 다운로드 링크가 제공됩니다."
echo "APK 파일을 다운로드하여 핸드폰에 설치하세요."
echo "=========================================="
