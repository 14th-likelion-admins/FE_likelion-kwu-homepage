import feLogo from '../assets/curriculum/fe_logo.png'
import beLogo from '../assets/curriculum/be_logo.png'
import deLogo from '../assets/curriculum/de_logo.png'

export const curriculumData = {
  backend: {
    heading: '백엔드 커리큘럼 상세보기',
    logo: beLogo,
    items: [
      {
        title: 'Git & GitHub를 활용한 협업과 버전 관리',
        description:
          'Git의 기본 개념을 이해하고 .gitignore 설정과 커밋, 푸시 과정을 실습하며 협업에 필요한 버전 관리 능력을 기릅니다. 또한 Spring Boot 프로젝트를 생성하고 build.gradle을 이용한 의존성 설정을 통해 프로젝트의 초기 구성을 익힙니다.',
      },
      {
        title: 'HTTP와 웹 API의 개념 및 구현',
        description:
          '서버와 클라이언트 간의 통신 구조를 이해하고, HTTP 요청/응답 구조와 메서드, 상태 코드의 의미를 학습합니다. Controller에 각 HTTP 메서드를 연결해 API를 구현하고 Postman으로 테스트하며 RESTful API 설계 과정을 익힙니다.',
      },
      {
        title: 'MVC 패턴과 계층형 아키텍처 설계',
        description:
          '백엔드 시스템에서 핵심 구조인 MVC 패턴과 계층형 아키텍처의 개념을 이해합니다. Controller, Service, Repository 계층의 역할을 분리해 비즈니스 로직을 효율적으로 관리하고, 의존성 주입을 통해 유지보수가 쉬운 구조를 설계합니다.',
      },
      {
        title: '데이터베이스 연동 및 JPA 활용',
        description:
          '관계형 데이터베이스의 기본 구조를 이해하고 ERD를 설계합니다. JPA를 활용해 CRUD 기능을 구현하고 트랜잭션 및 객체-관계 매핑을 통해 데이터 저장, 조회, 수정, 삭제를 효과적으로 처리하는 방법을 학습합니다.',
      },
      {
        title: 'AWS를 활용한 서버 배포',
        description:
          'AWS의 EC2, RDS, S3를 활용하여 서버를 구성하고 빌드 파일 배포, 데이터베이스 연결, 파일 저장소 구성 등을 실습합니다. 클라우드 환경에서 실제 서비스를 운영하기 위한 배포 흐름을 익힙니다.',
      },
      {
        title: 'GitHub Actions를 활용한 자동 배포 (CI/CD)',
        description:
          'GitHub Actions를 통해 코드 푸시만으로 S3 업로드부터 EC2 배포까지 자동화된 파이프라인을 구성합니다. deploy.yml, appspec.yml, deploy.sh 파일을 연동하고 Secrets 및 IAM 설정을 통해 안정적인 자동 배포 환경을 구축합니다.',
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
          'Git의 기본 개념과 사용하는 이유를 이해하고, git init, clone, add, commit, push, pull, status, log 등을 실습합니다. GitHub를 통해 원격 저장소를 연동하고 branch를 이용한 협업 개발 방식을 경험합니다.',
      },
      {
        title: 'React 시작하기: 기초 개념과 환경 구축',
        description:
          'React를 처음 사용하는 사람을 위해 Vite 기반의 빠른 환경 설정법을 배우고 폴더 구조를 구성합니다. 컴포넌트를 생성하고 재사용하는 방법, props를 통한 데이터 전달, React Router를 사용한 페이지 구성 방식을 실습합니다.',
      },
      {
        title: 'JavaScript로 배우는 리액트 핵심 기능',
        description:
          'React 개발에 필요한 JavaScript 문법을 실습합니다. const, let, function, arrow function, map, filter 등 기초 문법과 함께 useState, useEffect, useRef 같은 핵심 훅까지 익히며 SPA 동작 원리를 이해합니다.',
      },
      {
        title: '요구사항 분석과 UI 설계 with Figma',
        description:
          '와이어프레임과 실제 디자인을 토대로 디자인-개발 간 협업 플로우를 학습합니다. Figma 기반의 UI 구조 이해, 컴포넌트 분석, 페이지 흐름 정리 과정을 통해 구현 가능한 화면 설계 방식을 익힙니다.',
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
      {
        title: '프로젝트 회고 및 발표',
        description:
          '팀 단위 프로젝트를 발표하고 회고를 통해 배운 점과 아쉬운 점을 정리합니다. 코드 리뷰와 협업 방식에 대한 피드백을 공유하며, README/Notion 문서화를 통해 프로젝트 정리 습관을 기릅니다.',
      },
    ],
  },
  design: {
    heading: '디자인 커리큘럼 상세보기',
    logo: deLogo,
    items: [
      {
        title: '피그마 기본 설정과 컴포넌트 이해',
        description:
          '피그마의 기본 사용법과 프레임, 스타일, 컴포넌트 설정 방법을 익힙니다. 단축키를 활용해 작업 효율을 높이고 팀 프로젝트를 위한 협업 환경을 세팅해 도구에 익숙해지는 것을 목표로 합니다.',
      },
      {
        title: '클론 디자인 실습',
        description:
          '실제 앱 또는 웹사이트를 선정해 클론 디자인을 수행하며 레이아웃 구성과 색상 사용, UI 설계 감각을 기릅니다. 반복적인 재현 과정을 통해 시각적 완성도와 관찰력을 함께 향상시킵니다.',
      },
      {
        title: '프로토타입 연결과 디자인 시스템 구성',
        description:
          '프로토타입 기능을 사용해 화면 간 연결을 설정하고, 마진/패딩 등 스페이싱 원칙을 적용합니다. 버튼과 입력창 같은 공통 UI 요소를 정리하여 일관성 있는 디자인 시스템을 구성합니다.',
      },
      {
        title: '리디자인 실습',
        description:
          '개선이 필요한 웹이나 앱을 선정해 UX 문제를 분석하고 새로운 구조와 디자인을 제안합니다. 기능보다 사용자 경험에 집중하며 불편함을 해소하는 디자인 감각을 기릅니다.',
      },
      {
        title: '프로젝트 기획안 작성',
        description:
          '개별 또는 팀 단위로 프로젝트 주제를 선정하고 서비스 목적, 기능, 대상 사용자를 구체화합니다. 시장 조사와 벤치마킹을 통해 차별화 전략을 도출하고 기획안을 작성합니다.',
      },
      {
        title: '와이어프레임과 IA 설계',
        description:
          'IA 구조를 구성하고 사용자 플로우를 고려한 와이어프레임을 제작합니다. 기능 배치와 화면 전환을 설계하며 디자인 이전 단계의 논리적 구조화 과정을 경험합니다.',
      },
      {
        title: '화면 디자인 완성',
        description:
          '와이어프레임을 바탕으로 색상, 타이포그래피, UI 요소를 적용해 화면을 완성합니다. 컴포넌트를 체계적으로 정리하고 프로토타입을 구현하며 프로젝트를 마무리합니다.',
      },
    ],
  },
}

export const trackTabs = [
  { key: 'design', label: '디자인' },
  { key: 'frontend', label: '프론트엔드' },
  { key: 'backend', label: '백엔드' },
]
