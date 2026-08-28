# 이미지 최적화 스크립트

`src/assets` 아래 정적 이미지를 WebP로 변환하고, 반복 가능한 노이즈 텍스처를
타일로 잘라내는 **오프라인 일회성 도구**입니다. 앱 런타임이나 빌드에서는
호출되지 않습니다.

## sharp를 저장소 의존성에 넣지 않는 이유

`sharp`는 플랫폼별 네이티브 바이너리를 내려받는 무거운 패키지인데, 여기서만
쓰는 일회성 도구입니다. `devDependencies`에 넣으면 Vercel이 배포할 때마다
설치하게 되므로, 빌드 시간만 쓰고 얻는 게 없습니다.

그래서 필요할 때만 임시로 설치해서 씁니다.

> 예전에 이 문서는 "sharp를 넣으면 Vercel 빌드가 실패한다"고 적혀 있었는데
> 틀린 설명이었습니다. 실제 원인은 `package.json`만 고치고 `pnpm-lock.yaml`을
> 갱신하지 않은 것이었습니다. 저장소 루트 README를 참고하세요.

## 사용법

```bash
pnpm add -D sharp
pnpm run optimize:images
```

작업이 끝나면 **`package.json`과 `pnpm-lock.yaml`을 반드시 되돌립니다.**
그대로 커밋하면 sharp가 배포 의존성으로 들어갑니다.

```bash
git checkout -- package.json pnpm-lock.yaml
pnpm install
```

## 스크립트

| 파일 | 역할 |
|---|---|
| `optimize-images.mjs` | 정적 래스터 이미지를 WebP로 일괄 변환하고 용량 리포트를 남긴다 |
| `analyze-noise.mjs` | 노이즈 텍스처가 균일한 그레인인지 통계로 판정한다 (타일링 가능 여부 판단용) |
| `convert-phase-one.mjs` | 1차 대상 이미지들을 변환한다 |

`.image-report-before.txt` / `.image-report-after.txt` / `.noise-analysis.txt`는
당시 측정 결과를 남긴 기록입니다.
