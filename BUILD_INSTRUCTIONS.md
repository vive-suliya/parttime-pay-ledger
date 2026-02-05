# APK 빌드 가이드

핸드폰에 설치할 수 있는 APK 파일을 만드는 방법입니다.

## 빠른 시작

### 방법 1: 스크립트 사용 (가장 쉬움)
```bash
./build-apk.sh
```

### 방법 2: 수동 빌드

#### 1단계: Expo 계정 생성 및 로그인
```bash
# Expo 계정이 없다면 먼저 생성하세요 (무료)
eas login
```

Expo 계정이 없다면:
- https://expo.dev 에서 무료 계정 생성
- 또는 `eas register` 명령어로 계정 생성

#### 2단계: 프로젝트 설정
```bash
npm run build:configure
# 또는
eas build:configure
```

#### 3단계: Android APK 빌드
```bash
npm run build:android
# 또는
eas build --platform android --profile preview
```

빌드가 완료되면:
- 빌드 상태를 확인할 수 있는 URL이 제공됩니다
- 빌드가 완료되면 다운로드 링크가 제공됩니다
- APK 파일을 다운로드하여 핸드폰에 설치할 수 있습니다

#### 4단계: APK 설치
1. 다운로드한 APK 파일을 핸드폰으로 전송 (이메일, USB, 클라우드 등)
2. **Android 설정**:
   - 설정 > 보안 > "알 수 없는 출처" 허용
   - 또는 APK 파일을 열 때 "이 출처에서 설치 허용" 선택
3. APK 파일을 탭하여 설치

## 빌드 상태 확인

```bash
# 빌드 목록 확인
eas build:list

# 특정 빌드 상세 정보
eas build:view [BUILD_ID]
```

## 참고사항

- ✅ EAS Build는 무료 계정으로도 사용 가능합니다
- ⏱️ 빌드에는 약 10-20분이 소요될 수 있습니다
- 📧 빌드 완료 후 이메일로 알림을 받을 수 있습니다
- 📱 Android 5.0 (API 21) 이상 지원

## 문제 해결

### 빌드 중 오류가 발생하면:
1. `eas build:list`로 빌드 상태 확인
2. `eas build:view`로 빌드 로그 확인
3. Expo 문서 참조: https://docs.expo.dev/build/introduction/

### 로그인 문제:
```bash
# 로그아웃 후 다시 로그인
eas logout
eas login
```

### 프로젝트 설정 문제:
```bash
# 프로젝트 재설정
rm eas.json
eas build:configure
```
