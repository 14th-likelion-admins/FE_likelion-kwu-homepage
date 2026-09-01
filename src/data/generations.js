/**
 * 기수 정보의 단일 출처.
 *
 * 예전에는 기수가 Activities, ProjectFormModal, Curriculum, links 네 파일에
 * 흩어져 있었다. 새 기수로 넘길 때 한두 곳을 빠뜨려도 화면 대부분은 멀쩡해
 * 보이기 때문에, 빠뜨린 자리를 나중에야 발견하게 된다.
 *
 * 그래서 기수를 여기 한 곳에만 두고 나머지는 전부 여기서 파생시킨다.
 * 새 기수가 시작되면 GENERATIONS 맨 앞에 숫자를 하나 더하면 된다.
 *
 * 다만 index.html의 <title>·og 태그는 정적 HTML이라 이 모듈을 읽지 못한다.
 * 거기만 손으로 함께 고쳐야 한다. README의 "새 기수로 넘기기" 절 참고.
 */

/** 최신 기수가 앞. 화면의 기수 버튼도 이 순서로 그려진다. */
export const GENERATIONS = [14, 13]

/** 기본으로 선택되는 기수. */
export const CURRENT_GENERATION = GENERATIONS[0]

/**
 * 프로젝트 데이터가 쓰는 기수 표기.
 *
 * projectsData.js의 정적 프로젝트가 '13TH' 같은 문자열을 쓰고, /projects의
 * 기수 필터는 이 문자열을 그대로 비교한다. 표기가 어긋나면 필터에 기수가
 * 두 줄로 갈라지므로 손으로 적지 않고 여기서 만든다.
 */
export const GENERATION_LABELS = GENERATIONS.map((generation) => `${generation}TH`)
