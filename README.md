# 광운대 멋쟁이사자처럼 14기 공식 홈페이지

## 패키지 매니저는 pnpm입니다

Vercel은 `pnpm-lock.yaml`을 보고 `pnpm install --frozen-lockfile`로 설치합니다.

```bash
pnpm install
pnpm dev
```

의존성을 추가하거나 지웠으면 **`pnpm-lock.yaml`을 반드시 함께 커밋하세요.**
`package.json`만 바뀌고 락파일이 그대로면 배포가 이 오류로 실패합니다.

```
ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile"
```

npm으로 설치하면 `package-lock.json`이 새로 생기는데 Vercel은 그 파일을 보지
않으므로, 로컬 빌드는 멀쩡한데 배포만 깨지는 상황이 됩니다. 실제로 이것 때문에
배포가 두 번 실패했고, 그래서 `package-lock.json`은 저장소에서 제거했습니다.

---

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
