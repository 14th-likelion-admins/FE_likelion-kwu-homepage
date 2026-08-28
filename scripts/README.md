# 이미지 최적화 스크립트

`src/assets` 아래 정적 이미지를 WebP로 변환하고, 반복 가능한 노이즈 텍스처를
타일로 잘라내는 **오프라인 일회성 도구**입니다. 앱 런타임이나 빌드에서는
호출되지 않습니다.

## sharp를 저장소 의존성에 넣지 않는 이유

이 스크립트들은 `sharp`를 쓰지만, `sharp`는 플랫폼별 네이티브 바이너리를
받아오는 무거운 패키지입니다. `devDependencies`에 넣으면 Vercel 배포 빌드가
매번 이걸 설치하려다 실패합니다. 실제로 그렇게 배포가 깨진 적이 있습니다.

그래서 필요할 때만 임시로 설치해서 씁니다.

## 사용법

```bash
npm i --no-save sharp
npm run optimize:images
```

작업이 끝나면 되돌립니다.

```bash
npm ci
```

## 스크립트

| 파일 | 역할 |
|---|---|
| `optimize-images.mjs` | 정적 래스터 이미지를 WebP로 일괄 변환하고 용량 리포트를 남긴다 |
| `analyze-noise.mjs` | 노이즈 텍스처가 균일한 그레인인지 통계로 판정한다 (타일링 가능 여부 판단용) |
| `convert-phase-one.mjs` | 1차 대상 이미지들을 변환한다 |

`.image-report-before.txt` / `.image-report-after.txt` / `.noise-analysis.txt`는
당시 측정 결과를 남긴 기록입니다.
