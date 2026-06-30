import type { Badge, CompoundScenario, DailyEvent, DisasterDefinition, FamilyDefinition, Strategy } from '../types/game'

export const FAMILY: FamilyDefinition[] = [
  { id: 'mom', name: '엄마', emoji: '🌷', color: '#ef7777', outfit: '따뜻한 앞치마', ability: 'healer', abilityText: '돌봄의 손길 · 구급상자 회복량 +10' },
  { id: 'dad', name: '아빠', emoji: '🧰', color: '#4b8bd8', outfit: '튼튼한 작업 조끼', ability: 'forager', abilityText: '준비된 탐색 · 파밍 물품 +1 확률' },
  { id: 'grandma', name: '할머니', emoji: '👓', color: '#a77bc8', outfit: '포근한 보라 조끼', ability: 'hint', abilityText: '생활의 지혜 · 안전한 선택 힌트' },
  { id: 'grandpa', name: '할아버지', emoji: '🧢', color: '#6c9c75', outfit: '초록 모자와 조끼', ability: 'predictor', abilityText: '위험 예측 · 하루 위험도 감소' },
  { id: 'sister', name: '누나', emoji: '🎒', color: '#ed77ac', outfit: '밝은 탐험 재킷', ability: 'scout', abilityText: '빠른 탐색 · 파밍 부상 위험 감소' },
  { id: 'brother', name: '형', emoji: '🏃', color: '#ec914d', outfit: '주황 운동복', ability: 'guard', abilityText: '든든한 방어 · 위험 피해 감소' },
  { id: 'me', name: '본인', emoji: '⭐', color: '#f2c84b', outfit: '별무늬 안전 후드', ability: 'learner', abilityText: '안전 학습 · 교육 선택 대비 점수 +1' },
]

export const DISASTERS: DisasterDefinition[] = [
  { id: 'typhoon', name: '태풍', icon: '🌀', description: '강한 비바람에 대비해 창문과 비상용품을 살펴요.', safety: '창문에서 떨어져 있고 기상 정보를 자주 확인해요.' },
  { id: 'rain', name: '집중호우', icon: '🌧️', description: '물이 빠르게 불어날 수 있어 높은 곳과 대피로를 확인해요.', safety: '침수된 길에는 들어가지 않고 안전한 높은 곳으로 이동해요.' },
  { id: 'earthquake', name: '지진', icon: '🏠', description: '흔들림에 대비해 가구를 고정하고 안전 공간을 찾아요.', safety: '탁자 아래에서 머리를 보호하고 흔들림이 멈춘 뒤 이동해요.' },
]

export const STRATEGIES: Strategy[] = [
  { id: 'inspect', icon: '🔎', title: '위험 먼저 살피기', description: '다음 날 시작 위험도를 3 낮춰요.' },
  { id: 'supplies', icon: '🎒', title: '비상물품 점검하기', description: '재난 대비 점수를 2 높여요.' },
  { id: 'communicate', icon: '📻', title: '가족과 정보 나누기', description: '구조 연결 점수를 2 높여요.' },
  { id: 'recover', icon: '💗', title: '마음과 몸 돌보기', description: '행동 가능한 가족의 체력을 3 회복해요.' },
  { id: 'weather', icon: '🌦️', title: '기상 정보 다시 보기', description: '위험도는 2 낮추고 대비 점수는 1 높여요.' },
  { id: 'route', icon: '🗺️', title: '대피 경로 그려보기', description: '구조 연결과 재난 대비를 함께 높여요.' },
  { id: 'windows', icon: '🪟', title: '집 안 위험 요소 점검', description: '창문과 가구를 확인해 위험도를 4 낮춰요.' },
  { id: 'hygiene', icon: '🧼', title: '위생과 건강 챙기기', description: '가족 체력을 2 회복하고 대비 점수를 높여요.' },
  { id: 'neighbor', icon: '🤝', title: '이웃과 안전 정보 공유', description: '공동체의 구조 연결 점수를 3 높여요.' },
  { id: 'radio-check', icon: '📡', title: '라디오 주파수 확인', description: '구조 연결을 2 높이고 위험도를 1 낮춰요.' },
]

export function pickRandomStrategies(count = 3, random: () => number = Math.random): Strategy[] {
  const pool = [...STRATEGIES]
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]]
  }
  return pool.slice(0, Math.min(count, pool.length))
}

export const BADGES: Badge[] = [
  { id: 'first-step', icon: '🌱', name: '안전 첫걸음', description: '첫 안전 선택을 실천했어요.' },
  { id: 'combo-3', icon: '🔥', name: '안전 습관 3콤보', description: '안전한 선택을 3번 연속 실천했어요.' },
  { id: 'prepared-20', icon: '🛡️', name: '준비 대장', description: '재난 대비 점수 20을 달성했어요.' },
  { id: 'community-10', icon: '🤝', name: '우리 동네 지킴이', description: '구조 연결 점수 10을 달성했어요.' },
  { id: 'level-3', icon: '⭐', name: '안전 탐험가', description: '안전 등급 3레벨에 도달했어요.' },
]

export const COMPOUND_SCENARIOS: CompoundScenario[] = [
  {
    id: 'typhoon-blackout',
    title: '태풍과 정전 연속 시나리오',
    hazards: ['typhoon', 'strong-wind', 'blackout'],
    eventIds: ['window', 'blackout', 'radio'],
    sourceNote: '기상 특보와 정전이 연속될 수 있는 상황을 교육용으로 단순화한 확장 구조',
  },
  {
    id: 'earthquake-tsunami',
    title: '지진과 쓰나미 대피 시나리오',
    hazards: ['earthquake', 'tsunami', 'evacuation'],
    eventIds: ['shelf', 'radio'],
    sourceNote: '해안 지역 지진 이후 공식 대피 안내를 확인하는 복합 시나리오용 확장 구조',
  },
]

export const EVENTS: DailyEvent[] = [
  {
    id: 'window', disasters: ['typhoon', 'rain'], icon: '🪟', title: '흔들리는 창문', category: 'preparedness',
    scenario: { scenarioId: 'typhoon-blackout', hazards: ['typhoon', 'strong-wind'], phase: 'prepare', nextEventIds: ['blackout'] },
    description: '비바람이 거세져 창문 틈으로 바람이 들어와요. 어떻게 준비할까요?',
    choices: [
      { id: 'tape', label: '테이프로 창틀을 보강한다', result: '창틀을 단단히 보강해 피해를 줄였어요.', tip: '유리창에 가까이 서기보다 창문에서 떨어진 안전한 곳에 머물러요.', effects: [{ risk: -10, preparedness: 3 }] },
      { id: 'hand', label: '손으로 창문을 누른다', result: '손으로 누르는 일은 위험해요. 안전한 곳으로 물러났어요.', tip: '강풍 때는 유리창을 손으로 막지 않아요.', effects: [{ stat: 'health', amount: -20, target: 'random' }, { preparedness: 1 }] },
      { id: 'towel', label: '수건으로 창틀 틈을 막는다', result: '빗물이 들어오는 양을 줄였지만 방이 조금 습해졌어요.', tip: '수건은 물 유입을 줄이는 보조 수단이며 창문과 거리를 둬야 해요.', effects: [{ risk: -5, preparedness: 2 }] },
    ],
  },
  {
    id: 'blackout', disasters: 'all', icon: '🔦', title: '갑작스러운 정전', category: 'preparedness',
    scenario: { scenarioId: 'typhoon-blackout', hazards: ['blackout'], phase: 'impact', nextEventIds: ['radio'] },
    description: '집 안의 불이 꺼졌어요. 가족이 안전하게 움직일 방법을 골라요.',
    choices: [
      { id: 'flashlight', label: '손전등과 라디오를 찾는다', result: '비상가방의 손전등을 켜고 방송을 확인했어요.', tip: '정전에는 촛불보다 손전등이 안전해요.', effects: [{ preparedness: 3 }, { rescue: 2 }, { risk: -5 }] },
      { id: 'candle', label: '촛불부터 켠다', result: '넘어질 수 있어 촛불을 끄고 손전등을 사용했어요.', tip: '재난 상황의 촛불은 화재 위험이 있어요.', effects: [{ risk: 5 }, { preparedness: 1 }] },
      { id: 'together', label: '한곳에 모여 서로를 확인한다', result: '가족이 함께 있어 마음이 놓였어요.', tip: '어두울 때는 뛰지 말고 가족과 함께 천천히 움직여요.', effects: [{ stat: 'health', amount: 5, target: 'all' }, { preparedness: 2 }] },
    ],
  },
  {
    id: 'radio', disasters: 'all', icon: '📻', title: '구조 안내 방송', category: 'information',
    description: '라디오에서 가까운 안전지원소 안내가 들려요.',
    choices: [
      { id: 'record', label: '장소와 준비물을 적어 둔다', result: '안전지원소 정보를 모두 기록했어요.', tip: '공식 재난 방송의 장소와 이동 시간을 정확히 확인해요.', effects: [{ rescue: 8 }, { preparedness: 4 }] },
      { id: 'leave', label: '바로 밖으로 나간다', result: '밖의 상황을 먼저 확인해야 해서 집에서 기다렸어요.', tip: '이동 지시와 안전한 경로가 확인된 뒤 움직여요.', effects: [{ risk: 8 }, { rescue: 2 }] },
      { id: 'ignore', label: '라디오를 끄고 쉰다', result: '휴식했지만 중요한 안내 일부를 놓쳤어요.', tip: '배터리 라디오와 재난 문자는 중요한 정보 통로예요.', effects: [{ stat: 'health', amount: 5, target: 'all' }, { rescue: -2 }] },
    ],
  },
  {
    id: 'neighbor', disasters: 'all', icon: '🤝', title: '이웃의 도움 요청', category: 'community',
    description: '이웃이 비상용품 사용법을 물어봐요. 우리 물품도 넉넉하지 않아요.',
    choices: [
      { id: 'share', label: '안전 수칙과 빵을 나눈다', result: '함께 돕자 구조 정보를 나눌 수 있었어요.', tip: '내 안전을 지키는 범위에서 이웃과 정보를 나눠요.', effects: [{ item: 'bread', itemAmount: -1 }, { rescue: 5 }, { preparedness: 2 }] },
      { id: 'teach', label: '문 너머로 사용법을 알려준다', result: '안전한 거리를 두고 서로 도왔어요.', tip: '위험할 때는 직접 이동보다 안전한 소통 방법을 먼저 찾아요.', effects: [{ rescue: 3 }, { preparedness: 3 }] },
      { id: 'quiet', label: '가족 물품부터 점검한다', result: '우리 가족의 비상용품을 다시 정리했어요.', tip: '도움 전에는 나와 가족의 안전 상태를 먼저 확인해요.', effects: [{ risk: -3 }, { preparedness: 1 }] },
    ],
  },
  {
    id: 'shelf', disasters: ['earthquake'], icon: '📚', title: '흔들리는 선반', category: 'evacuation',
    scenario: { scenarioId: 'earthquake-tsunami', hazards: ['earthquake'], phase: 'impact', nextEventIds: ['radio'] },
    description: '작은 흔들림과 함께 선반 위 물건이 움직여요.',
    choices: [
      { id: 'table', label: '튼튼한 탁자 아래로 이동한다', result: '몸을 낮추고 머리를 보호했어요.', tip: '지진 때는 엎드리고, 가리고, 붙잡아요.', effects: [{ risk: -12 }, { preparedness: 4 }] },
      { id: 'hold', label: '선반을 붙잡는다', result: '선반에서 떨어져 안전한 곳으로 이동했어요.', tip: '넘어질 수 있는 가구에서 멀리 떨어져요.', effects: [{ stat: 'health', amount: -15, target: 'random' }, { risk: 5 }] },
      { id: 'door', label: '현관 밖으로 뛰어나간다', result: '흔들림 중 이동은 위험해 실내 안전 공간에 머물렀어요.', tip: '흔들리는 동안에는 유리와 가구를 피해 머리를 보호해요.', effects: [{ risk: 8 }, { preparedness: 1 }] },
    ],
  },
  {
    id: 'water-rise', disasters: ['rain'], icon: '🌊', title: '창밖의 높아진 물', category: 'evacuation',
    description: '골목의 물이 점점 높아져요. 지금 무엇을 해야 할까요?',
    choices: [
      { id: 'up', label: '중요 물품을 높은 곳에 둔다', result: '물과 구급상자를 높은 선반으로 옮겼어요.', tip: '침수 우려가 있으면 전기 제품과 비상용품을 높은 곳에 둬요.', effects: [{ risk: -10 }, { preparedness: 4 }] },
      { id: 'drain', label: '밖에 나가 배수구를 확인한다', result: '침수된 길은 위험해 밖으로 나가지 않았어요.', tip: '물이 찬 도로와 맨홀 근처에는 접근하지 않아요.', effects: [{ risk: 8 }] },
      { id: 'route', label: '높은 곳 대피 경로를 확인한다', result: '가족 모두가 안전한 이동 경로를 기억했어요.', tip: '집 주변의 높은 곳과 대피소를 미리 알아둬요.', effects: [{ rescue: 5 }, { preparedness: 4 }] },
    ],
  },
  {
    id: 'sound', disasters: 'all', icon: '👂', title: '밖에서 들리는 큰 소리', category: 'information',
    description: '문 밖에서 쿵 하는 소리가 들려요. 모두 조금 걱정하고 있어요.',
    choices: [
      { id: 'peek', label: '문을 열지 않고 확인한다', result: '창문에서 떨어진 위치에서 라디오와 현관 카메라를 확인했어요.', tip: '위험한 소리가 나면 바로 나가지 말고 공식 정보를 확인해요.', effects: [{ risk: -4 }, { preparedness: 3 }] },
      { id: 'open', label: '바로 문을 열어 본다', result: '문을 열기 전 주변 안전을 확인하기로 했어요.', tip: '재난 중에는 밖의 위험 요소를 확인한 뒤 이동해요.', effects: [{ risk: 8 }] },
      { id: 'breathe', label: '가족과 천천히 심호흡한다', result: '서로 손을 잡고 차분해졌어요.', tip: '불안할 때는 천천히 호흡하고 아는 어른과 상황을 나눠요.', effects: [{ stat: 'health', amount: 4, target: 'all' }, { preparedness: 2 }] },
    ],
  },
]

export const FARM_EVENTS: DailyEvent[] = [
  {
    id: 'farm-store', disasters: 'all', icon: '🏪', title: '안전한 물품 탐색', category: 'resources',
    description: '가까운 편의점 앞에 구조 물품 상자가 보여요. 주변을 살피며 이동해요.',
    choices: [
      { id: 'careful', label: '안전한 길로 조심히 가져온다', result: '빵 4개와 물 3개를 찾아 무사히 돌아왔어요.', tip: '외출 전 공식 안내와 귀가 경로를 가족에게 알려요.', effects: [{ item: 'bread', itemAmount: 4 }, { item: 'water', itemAmount: 3 }, { risk: 3 }] },
      { id: 'deep', label: '조금 더 깊이 탐색한다', result: '구급상자를 찾았지만 유리 조각을 피해 돌아오느라 지쳤어요.', tip: '무너진 건물과 깨진 유리 주변에는 들어가지 않아요.', effects: [{ item: 'medkit', itemAmount: 1 }, { stat: 'health', amount: -15, target: 'random' }, { risk: 8 }] },
      { id: 'return', label: '길이 위험해 보여 돌아온다', result: '물품보다 안전을 선택해 모두 안심했어요.', tip: '위험한 길에서는 돌아오는 것도 훌륭한 안전 선택이에요.', effects: [{ preparedness: 3 }, { risk: -4 }] },
    ],
  },
  {
    id: 'farm-puddle', disasters: ['rain', 'typhoon'], icon: '💧', title: '길가의 물웅덩이', category: 'resources',
    description: '맑아 보이는 물이 있지만 안전한 물인지 알 수 없어요.',
    choices: [
      { id: 'skip', label: '마시지 않고 표시만 한다', result: '오염 가능성을 기억하고 안전한 물만 사용했어요.', tip: '재난 뒤 고인 물은 끓여도 위험할 수 있어 공식 급수원을 이용해요.', effects: [{ preparedness: 4 }] },
      { id: 'collect', label: '정수된 지원 물을 찾아 담는다', result: '공식 급수 표시가 있는 물 3개를 확보했어요.', tip: '마실 물은 공식 급수원이나 밀봉된 생수를 이용해요.', effects: [{ item: 'water', itemAmount: 3 }, { preparedness: 3 }] },
    ],
  },
  {
    id: 'farm-pharmacy', disasters: 'all', icon: '💊', title: '동네 약국 앞 구조함', category: 'resources',
    description: '문이 잠긴 약국 앞에 공식 구호 표시가 붙은 응급 구조함이 보여요.',
    choices: [
      { id: 'open-kit', label: '구호 표시와 사용 안내를 확인한다', result: '구급상자 2개를 찾아 안전하게 챙겼어요.', tip: '약품은 이름과 사용기한을 확인하고 보호자와 함께 사용해요.', effects: [{ item: 'medkit', itemAmount: 2 }, { preparedness: 3 }] },
      { id: 'broken-door', label: '깨진 출입문 안쪽을 살펴본다', result: '유리 조각 때문에 더 들어가지 않고 돌아왔어요.', tip: '파손된 건물에는 들어가지 않고 공식 구호 지점을 이용해요.', effects: [{ stat: 'health', amount: -10, target: 'random' }, { risk: 6 }] },
      { id: 'mark-place', label: '위치를 지도에 표시하고 돌아온다', result: '가족과 구조함 위치를 공유했어요.', tip: '안전한 물품 위치를 기록하면 다음 이동 계획에 도움이 돼요.', effects: [{ preparedness: 3 }, { rescue: 2 }] },
    ],
  },
  {
    id: 'farm-school', disasters: 'all', icon: '🏫', title: '학교 임시 대피소', category: 'resources',
    description: '가까운 학교 운동장에 임시 물품 배부대가 설치되어 있어요.',
    choices: [
      { id: 'supply-line', label: '안내 줄을 따라 차례를 기다린다', result: '빵 3개와 물 2개를 배부받았어요.', tip: '대피소에서는 안내 요원의 지시에 따라 질서를 지켜요.', effects: [{ item: 'bread', itemAmount: 3 }, { item: 'water', itemAmount: 2 }, { rescue: 3 }] },
      { id: 'first-aid', label: '응급 지원대를 찾아간다', result: '구급상자 1개를 지원받았어요.', tip: '몸이 불편할 때는 대피소의 응급 지원대에 먼저 알려요.', effects: [{ item: 'medkit', itemAmount: 1 }, { preparedness: 2 }] },
      { id: 'crowded', label: '사람이 너무 많아 안전하게 돌아온다', result: '혼잡한 길을 피하고 가족에게 상황을 알렸어요.', tip: '혼잡하거나 위험한 곳에서는 무리하지 말고 다른 안전 경로를 찾아요.', effects: [{ risk: -3 }, { preparedness: 2 }] },
    ],
  },
  {
    id: 'farm-relief', disasters: 'all', icon: '📦', title: '골목의 구호 물품 상자', category: 'resources',
    description: '방수 포장된 구호 물품 상자가 안전한 공터에 놓여 있어요.',
    choices: [
      { id: 'check-label', label: '공식 배부 표시를 확인하고 연다', result: '빵 4개, 물 3개, 구급상자 1개를 찾았어요.', tip: '출처가 확인된 밀봉 물품만 사용하고 포장 손상을 살펴요.', effects: [{ item: 'bread', itemAmount: 4 }, { item: 'water', itemAmount: 3 }, { item: 'medkit', itemAmount: 1 }, { preparedness: 3 }] },
      { id: 'wet-box', label: '젖은 상자도 함께 가져온다', result: '포장이 손상되어 사용할 수 없는 물품은 남겨두었어요.', tip: '젖거나 열린 식품과 의약품은 사용하지 않아요.', effects: [{ risk: 4 }, { preparedness: 1 }] },
      { id: 'share-location', label: '이웃에게 안전한 위치를 알려준다', result: '물품 위치를 공유해 공동체 안전에 도움을 줬어요.', tip: '검증된 구호 정보를 이웃과 나누면 모두의 안전에 도움이 돼요.', effects: [{ rescue: 5 }, { preparedness: 2 }] },
    ],
  },
  {
    id: 'farm-vending', disasters: ['typhoon', 'earthquake'], icon: '🚰', title: '공공 급수대 발견', category: 'resources',
    description: '안전 점검 완료 표시가 붙은 공공 급수대를 발견했어요.',
    choices: [
      { id: 'sealed-water', label: '밀봉된 생수를 배부받는다', result: '물 4개를 받아 가족에게 돌아왔어요.', tip: '재난 시에는 안전 점검된 급수대와 밀봉된 생수를 이용해요.', effects: [{ item: 'water', itemAmount: 4 }, { preparedness: 2 }] },
      { id: 'unknown-tap', label: '점검 표시가 없는 수도를 사용한다', result: '안전 여부를 알 수 없어 사용하지 않았어요.', tip: '수질 확인 전에는 물을 마시지 않아요.', effects: [{ risk: 5 }] },
      { id: 'wait-notice', label: '다음 배부 시간을 기록한다', result: '배부 시간을 확인하고 안전하게 돌아왔어요.', tip: '공식 배부 시간과 이동 경로를 미리 기록해요.', effects: [{ preparedness: 3 }, { rescue: 2 }] },
    ],
  },
]
