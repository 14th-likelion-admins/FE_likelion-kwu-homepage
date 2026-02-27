import feLogo from '../assets/curriculum/fe_logo.png'
import beLogo from '../assets/curriculum/be_logo.png'
import deLogo from '../assets/curriculum/de_logo.png'

export const curriculumData = {
  backend: {
    heading: '백엔드 커리큘럼 상세보기',
    logo: beLogo,
    items: [
      {
        title: '클라이언트–서버 구조와 HTTP, REST API의 기본 개념을 이해합니다',
        description:
          '클라이언트–서버 통신 구조를 기반으로 HTTP 요청/응답, 메서드, 상태 코드의 의미를 학습합니다. REST API의 기본 원칙을 이해하고 간단한 엔드포인트를 통해 데이터 흐름을 실습합니다.',
      },
      {
        title: 'Spring Boot 프로젝트를 생성하고 DI와 빌드 도구를 활용한 구조를 학습합니다',
        description:
          'Spring Boot 프로젝트를 구성하고 실행 구조를 파악하며, DI를 통해 애플리케이션의 객체 관리 방식과 설계 원리를 학습합니다. Maven/Gradle을 활용해 의존성 관리와 빌드 설정을 표준화합니다.',
      },
      {
        title: '데이터베이스 기초를 바탕으로 CRUD 구현과 API 명세 작성을 수행합니다',
        description:
          '관계형 데이터베이스의 기본 개념을 바탕으로 CRUD 기능을 구현하며 데이터 처리의 전체 흐름을 익힙니다. 협업을 위한 API 명세 작성 방법을 학습하고 요청/응답 규격을 문서화합니다.',
      },
      {
        title: 'JPA를 활용한 데이터 접근 계층 설계와 Git 기반 협업을 수행합니다',
        description:
          'JPA 기반의 객체–관계 매핑을 적용하여 데이터 접근 계층을 설계하고, 트랜잭션 및 연관관계 등 DB 심화 주제를 함께 다룹니다. Git/GitHub를 활용해 브랜치 전략, PR, 충돌 해결 등 협업 중심의 버전 관리 역량을 강화합니다.',
      },
      {
        title: 'MVC 패턴과 계층형 아키텍처를 적용해 구조를 설계합니다',
        description:
          'MVC 및 계층형 아키텍처의 역할 분리를 통해 유지보수성과 확장성을 고려한 구조를 설계합니다. Controller–Service–Repository 책임을 명확히 하고 비즈니스 로직을 체계적으로 구성하는 방법을 학습합니다.',
      },
      {
        title: 'AWS 인프라 기반 배포 환경을 구축하고 CORS 문제를 해결합니다',
        description:
          'AWS 인프라(EC2, RDS)를 기반으로 애플리케이션 배포 및 데이터베이스 연결 과정을 실습하며 운영 환경 구축 흐름을 익힙니다. 프론트엔드 연동 과정에서 발생하는 CORS 이슈를 원인부터 해결까지 정리합니다.',
      },
      {
        title: 'GitHub Actions를 활용해 CI/CD 자동 배포 파이프라인을 구축합니다',
        description:
          'GitHub Actions를 활용해 빌드·테스트·배포를 자동화하고 안정적인 배포 파이프라인을 구성합니다. Secrets 및 IAM 등 운영에 필요한 설정을 포함하여 실무형 자동 배포 환경을 구축합니다.',
      },
    ],
  },
  frontend: {
    heading: '프론트엔드 커리큘럼 상세보기',
    logo: feLogo,
    items: [
      {
        title: 'Git과 GitHub 기본 사용법',
        description:
          'Git의 기본 개념과 사용하는 이유를 이해하고, git init, clone, add, commit, push, pull 등의 다양한 명령어를 실습합니다. GitHub를 통해 원격 저장소를 연동하고 branch를 이용한 협업 개발 방식을 경험합니다.',
      },
      {
        title: '요구사항 분석과 UI 설계 with Figma',
        description:
          '와이어프레임과 실제 디자인을 토대로 디자인과 개발 간 협업 플로우를 학습합니다. Figma 기반의 UI 구조 이해, 컴포넌트 분석, 페이지 흐름 정리 과정을 통해 구현 가능한 화면 설계 방식을 익힙니다.',
      },
      {
        title: 'React 시작하기: 기초 개념과 환경 구축',
        description:
          'React를 처음 사용하는 사람을 위해 Vite 기반의 빠른 환경 설정법을 배우고 폴더 구조를 구성합니다. 컴포넌트를 생성하고 재사용하는 방법, props를 통한 데이터 전달, React Router를 사용한 페이지 구성 방식을 실습합니다.',
      },
      {
        title: '배포',
        description:
          '프론트엔드 애플리케이션을 실제 서비스 환경에 배포하는 과정을 학습합니다. 빌드(Build)의 개념과 환경 변수 설정을 이해하고, GitHub 저장소와 연동하여 Vercel, Netlify와 같은 호스팅 서비스를 활용해 프로젝트 배포를 경험합니다.',
      },
      {
        title: 'JavaScript로 배우는 리액트 핵심 기능',
        description:
          'React 개발에 필요한 JavaScript 문법을 실습합니다. const, let, function, arrow function, map, filter 등 기초 문법과 함께 useState, useEffect, useRef 같은 핵심 훅까지 익히며 SPA 동작 원리를 이해합니다.',
      },
      {
        title: 'HTTP 통신과 API 연동',
        description:
          'HTTP 통신의 기본 원리와 REST API의 개념을 이해하고, API 명세를 읽어 프론트엔드에 연결하는 방법을 학습합니다. 비동기 처리와 에러 핸들링, 데이터 렌더링 흐름까지 실전 중심으로 다룹니다.',
      },
      {
        title: '실제 프로젝트: UI 개발과 API 통신',
        description:
          'Figma 디자인을 바탕으로 팀 단위 프로젝트를 개발합니다. 컴포넌트 구조 설계, 상태 관리, API 연동, 조건부 렌더링, 반복 렌더링 등 핵심 내용을 종합적으로 적용해 실제 동작하는 애플리케이션을 구현합니다.',
      },
    ],
  },
  design: {
    heading: '기획/디자인 커리큘럼 상세보기',
    logo: deLogo,
    items: [
      {
        title: '문제 정의 및 사용자 시나리오 보드 제작',
        description:
          '명확한 문제 정의와 타겟 페르소나 설정을 통해 서비스의 존재 이유를 증명하고, 사용자가 목표를 달성하는 전체 과정을 시나리오로 시각화합니다. 이 과정에서 실무 툴인 피그마의 기초를 익혀, 기획·디자인·개발 협업 구조 속에서 피그마를 사고를 정리하고 공유하는 도구로 활용하는 법을 배웁니다.',
      },
      {
        title: '서비스 구조 설계: IA 및 사용자 플로우',
        description:
          '서비스의 전체 페이지와 기능을 체계적으로 정리한 정보 구조(IA)를 구축하여 개발자와 디자이너가 공유할 수 있는 정교한 뼈대를 만듭니다. 이를 바탕으로 사용자가 목표를 달성하는 동선과 예외 상황까지 꼼꼼히 연결하는 사용자 플로우를 설계해, 화면 간의 흐름을 정의하고 개발 단계의 혼선을 방지합니다.',
      },
      {
        title: '효율적인 UI 설계: 컴포넌트와 Auto Layout',
        description:
          '자주 사용하는 요소를 컴포넌트화하여 원본 수정 시 모든 화면에 반영되는 재사용 가능한 구조를 설계하고 디자인 작업의 효율성을 극대화합니다. 내용물에 따라 크기가 유연하게 조절되는 오토레이아웃 기능을 활용하여, 수정이 용이하고 완성도 높은 UI 시스템을 구축하는 법을 익힙니다.',
      },
      {
        title: '화면 설계 및 기능 명세서 작성',
        description:
          '핵심 화면을 와이어프레임으로 시각화하여 1차 UX 테스트로 타당성을 검증한 뒤, 이를 기반으로 작동 원리와 예외 상황을 구체적으로 문서화한 기능 명세서를 작성합니다. 화면별 기능 매핑을 통해 기획 의도가 구현 단계에서 누락되지 않도록 방지하며, 개발자와의 원활한 협업을 이끄는 탄탄한 가이드를 수립합니다.',
      },
      {
        title: '디자인 시스템 구축',
        description:
          '브랜드의 정체성을 담은 컬러와 타이포그래피를 정의하고, 요소 간의 일관성을 유지하기 위한 스페이싱(Spacing) 규칙을 수립합니다. 디자인 요소를 개별적 값이 아닌 "디자인 토큰" 개념으로 정리하여, 프로젝트 규모가 커져도 쉽고 빠르게 스타일을 제어할 수 있는 체계적인 관리 기반을 마련합니다.',
      },
      {
        title: 'High-Fi UI 디자인 및 상태 설계',
        description:
          '앞서 설계한 와이어프레임을 바탕으로 실제 서비스 수준의 고도화된 UI를 구현하며, 시각적 완성도를 극대화합니다. 사용자 인터랙션에 따른 세부 상태값을 정밀하게 반영하고, 2차 UX 사용자 테스트를 통해 발견된 문제점을 최종 보완하여 실제 제품에 가까운 디자인을 완성합니다.',
      },
      {
        title: '개발 협업을 위한 정리',
        description:
          '피그마의 Dev Mode와 Inspect 기능을 활용하여 디자인 에셋과 수치를 개발자가 이해하기 쉬운 형태로 정리하고 효율적인 핸드오프 환경을 구축합니다. 프로젝트를 마무리하며 기획과 디자인 산출물을 최종 점검하고, 실제 구현 시 발생할 수 있는 주의사항을 체계적으로 전달하여 협업의 완성도를 높입니다.',
      },
    ],
  },
}

export const trackTabs = [
  { key: 'design', label: '기획/디자인' },
  { key: 'frontend', label: '프론트엔드' },
  { key: 'backend', label: '백엔드' },
]
