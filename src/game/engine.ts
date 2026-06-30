import { BADGES, DISASTERS, EVENTS, FAMILY, FARM_EVENTS } from '../data/gameData'
import type {
  CharacterState,
  Choice,
  DailyEvent,
  DisasterId,
  Effect,
  Ending,
  FamilyId,
  GameState,
  ItemKey,
  LearningCategory,
  LearningReport,
  LogEntry,
  Mood,
  StrategyId,
} from '../types/game'

export const clamp = (value: number) => Math.max(0, Math.min(100, value))

export function startingResources(count: number) {
  return { bread: count * 2, water: count * 2, medkit: count }
}

export function createCharacter(id: FamilyId): CharacterState {
  const definition = FAMILY.find((member) => member.id === id)
  if (!definition) throw new Error(`Unknown family id: ${id}`)
  return { ...definition, health: 100, hunger: 100, thirst: 100, mood: 'calm', unableToAct: false }
}

export function eventsFor(disaster: DisasterId, farming = false): DailyEvent[] {
  const source = farming ? FARM_EVENTS : EVENTS
  return source.filter((event) => event.disasters === 'all' || event.disasters.includes(disaster))
}

export function eventForDay(disaster: DisasterId, day: number, farming = false): DailyEvent {
  const pool = eventsFor(disaster, farming)
  return pool[(day - 1) % pool.length]
}

export function createGame(familyIds: FamilyId[], disaster: DisasterId): GameState {
  if (familyIds.length < 1 || familyIds.length > 3) throw new Error('가족은 1명부터 3명까지 선택해 주세요.')
  return {
    phase: 'playing',
    day: 1,
    disaster,
    family: familyIds.map(createCharacter),
    resources: startingResources(familyIds.length),
    risk: 22,
    preparedness: 0,
    rescue: 0,
    xp: 0,
    level: 1,
    combo: 0,
    bestCombo: 0,
    badges: [],
    choiceHistory: [],
    currentEvent: eventForDay(disaster, 1),
    logs: [{ day: 1, text: `${DISASTERS.find((item) => item.id === disaster)?.name} 대비를 시작했어요.`, tone: 'info' }],
  }
}

function updateMood(character: CharacterState): Mood {
  if (character.unableToAct) return 'hurt'
  if (character.health <= 40) return 'hurt'
  if (character.hunger <= 40 || character.thirst <= 40) return 'hungry'
  if (character.health <= 65) return 'worried'
  return 'calm'
}

function normalizeCharacter(character: CharacterState): CharacterState {
  const normalized = {
    ...character,
    health: clamp(character.health),
    hunger: clamp(character.hunger),
    thirst: clamp(character.thirst),
  }
  normalized.unableToAct = normalized.health <= 0
  normalized.mood = updateMood(normalized)
  return normalized
}

function applyEffect(state: GameState, effect: Effect, targetIndex: number): GameState {
  const resources = { ...state.resources }
  let family = state.family.map((member) => ({ ...member }))

  if (effect.item && effect.itemAmount) {
    const fixedFoodReward = state.currentEvent.id === 'farm-store' && (effect.item === 'bread' || effect.item === 'water')
    const bonus = effect.itemAmount > 0 && !fixedFoodReward && state.family.some((member) => member.ability === 'forager') ? 1 : 0
    resources[effect.item] = Math.max(0, resources[effect.item] + effect.itemAmount + bonus)
  }

  if (effect.stat && effect.amount) {
    const targetIds = effect.target === 'all'
      ? family.map((_, index) => index)
      : [Math.max(0, Math.min(family.length - 1, targetIndex))]
    family = family.map((member, index) => {
      if (!targetIds.includes(index) || member.unableToAct) return member
      let amount = effect.amount ?? 0
      if (effect.stat === 'health' && amount < 0 && state.family.some((item) => item.ability === 'guard')) amount += 5
      return normalizeCharacter({ ...member, [effect.stat!]: member[effect.stat!] + amount })
    })
  }

  const predictedRisk = state.family.some((member) => member.ability === 'predictor') ? -2 : 0
  return {
    ...state,
    resources,
    family,
    risk: clamp(state.risk + (effect.risk ?? 0) + (effect.risk ? predictedRisk : 0)),
    preparedness: clamp(state.preparedness + (effect.preparedness ?? 0)),
    rescue: clamp(state.rescue + (effect.rescue ?? 0)),
  }
}

export function consumeDailyResources(state: GameState): GameState {
  const resources = { ...state.resources }
  const family = state.family.map((member) => {
    if (member.unableToAct) return member
    let next = { ...member }
    if (resources.bread > 0) {
      resources.bread -= 1
      next.hunger = clamp(next.hunger + 30)
    } else {
      next.hunger = clamp(next.hunger - 20)
    }
    if (resources.water > 0) {
      resources.water -= 1
      next.thirst = clamp(next.thirst + 30)
    } else {
      next.thirst = clamp(next.thirst - 20)
    }
    if (next.hunger === 0) next.health = clamp(next.health - 50)
    if (next.thirst === 0) next.health = clamp(next.health - 50)
    return normalizeCharacter(next)
  })
  return { ...state, family, resources }
}

export function determineEnding(state: GameState): Ending {
  const active = state.family.filter((member) => !member.unableToAct).length
  if (active === 0) return { id: 'waiting', icon: '🛟', title: '함께 구조 대기', description: '가족은 안전 신호를 보내며 구조를 기다려요. 다음에는 물과 식량을 조금 더 일찍 준비해 봐요.' }
  if (state.rescue >= 25 && state.preparedness >= 25) return { id: 'best', icon: '🏆', title: '최고의 재난 대비 가족', description: '공식 정보를 확인하고 안전 수칙을 실천해 모두가 안전지원소와 연결되었어요!' }
  if (state.rescue >= 25) return { id: 'rescued', icon: '🚁', title: '구조 연결 성공', description: '라디오와 이웃의 정보 덕분에 안전한 구조 경로를 찾았어요.' }
  if (active === state.family.length) return { id: 'all-safe', icon: '🌈', title: '모두 함께 30일', description: '서로 돌보며 30일을 안전하게 보냈어요. 가족의 협력이 가장 큰 힘이었어요.' }
  if (state.resources.bread === 0 || state.resources.water === 0) return { id: 'supplies', icon: '🎒', title: '비상식량을 더 준비해요', description: '가족 일부는 구조를 기다리고 있어요. 인원수에 맞춘 물과 식량 준비가 중요해요.' }
  return { id: 'some-safe', icon: '🤝', title: '서로를 지킨 가족', description: '일부 가족은 구조를 기다리지만 안전 수칙으로 더 큰 위험을 막았어요.' }
}

export function resolveChoice(state: GameState, choice: Choice, targetIndex = 0, random: () => number = Math.random): GameState {
  const isFarming = state.currentEvent.id.startsWith('farm-')
  const attemptsItemGain = choice.effects.some((effect) => effect.item && (effect.itemAmount ?? 0) > 0)
  const farmingOutcome = isFarming && attemptsItemGain ? (random() < 0.5 ? 'success' : 'empty') : undefined
  const effectiveChoice = farmingOutcome === 'empty'
    ? { ...choice, effects: choice.effects.filter((effect) => !(effect.item && (effect.itemAmount ?? 0) > 0)) }
    : choice
  const outcomeText = farmingOutcome === 'empty'
    ? '주변을 안전하게 살펴보았지만 오늘은 필요한 물품을 찾지 못했어요.'
    : choice.result
  const quality = choice.quality ?? inferChoiceQuality(choice)
  const combo = quality === 'safe' ? state.combo + 1 : 0
  const xpEarned = quality === 'safe' ? 25 + state.combo * 5 : quality === 'neutral' ? 10 : 0
  const afterDailyConsumption = isFarming ? consumeDailyResources(state) : state
  let next = effectiveChoice.effects.reduce((current, effect) => applyEffect(current, effect, targetIndex), afterDailyConsumption)
  if (state.family.some((member) => member.ability === 'learner') && choice.effects.some((effect) => (effect.preparedness ?? 0) > 0)) {
    next = { ...next, preparedness: clamp(next.preparedness + 1) }
  }
  if (!isFarming) next = consumeDailyResources(next)
  const tone: LogEntry['tone'] = choice.effects.some((effect) => (effect.stat === 'health' && (effect.amount ?? 0) < 0) || (effect.risk ?? 0) > 5)
    ? 'warning'
    : 'good'
  next = {
    ...next,
    xp: state.xp + xpEarned,
    level: Math.floor((state.xp + xpEarned) / 100) + 1,
    combo,
    bestCombo: Math.max(state.bestCombo, combo),
    choiceHistory: [
      ...state.choiceHistory,
      {
        day: state.day,
        eventId: state.currentEvent.id,
        choiceId: choice.id,
        choiceLabel: choice.label,
        category: choice.category ?? state.currentEvent.category ?? 'preparedness',
        quality,
        principle: choice.tip,
        outcomeText,
        farmingOutcome,
        xpEarned,
        comboAfter: combo,
      },
    ],
    logs: [
      { day: state.day, text: `${outcomeText} 안전 경험치 +${xpEarned}${combo >= 2 ? ` · ${combo}콤보` : ''} 안전 한마디: ${choice.tip}`, tone },
      ...state.logs,
    ].slice(0, 8),
  }
  return { ...next, badges: unlockBadges(next) }
}

export function advanceDay(state: GameState): GameState {
  const allUnable = state.family.every((member) => member.unableToAct)
  if (state.day >= 30 || allUnable) return { ...state, phase: 'ending', ending: determineEnding(state) }
  const day = state.day + 1
  return {
    ...state,
    day,
    risk: clamp(state.risk + 3),
    currentEvent: eventForDay(state.disaster, day),
  }
}

export function applyStrategy(state: GameState, strategy: StrategyId): GameState {
  let next = { ...state, selectedStrategy: strategy }
  if (strategy === 'inspect') next = { ...next, risk: clamp(next.risk - 3) }
  if (strategy === 'supplies') next = { ...next, preparedness: clamp(next.preparedness + 2) }
  if (strategy === 'communicate') next = { ...next, rescue: clamp(next.rescue + 2) }
  if (strategy === 'recover') {
    next = {
      ...next,
      family: next.family.map((member) => member.unableToAct ? member : normalizeCharacter({ ...member, health: member.health + 3 })),
    }
  }
  if (strategy === 'weather') next = { ...next, risk: clamp(next.risk - 2), preparedness: clamp(next.preparedness + 1) }
  if (strategy === 'route') next = { ...next, rescue: clamp(next.rescue + 2), preparedness: clamp(next.preparedness + 1) }
  if (strategy === 'windows') next = { ...next, risk: clamp(next.risk - 4) }
  if (strategy === 'hygiene') {
    next = {
      ...next,
      preparedness: clamp(next.preparedness + 1),
      family: next.family.map((member) => member.unableToAct ? member : normalizeCharacter({ ...member, health: member.health + 2 })),
    }
  }
  if (strategy === 'neighbor') next = { ...next, rescue: clamp(next.rescue + 3) }
  if (strategy === 'radio-check') next = { ...next, rescue: clamp(next.rescue + 2), risk: clamp(next.risk - 1) }
  const labels: Record<StrategyId, string> = {
    inspect: '위험을 먼저 살피는 전략',
    supplies: '비상물품을 점검하는 전략',
    communicate: '가족과 정보를 나누는 전략',
    recover: '마음과 몸을 돌보는 전략',
    weather: '기상 정보를 다시 확인하는 전략',
    route: '대피 경로를 그려보는 전략',
    windows: '집 안 위험 요소를 점검하는 전략',
    hygiene: '위생과 건강을 챙기는 전략',
    neighbor: '이웃과 안전 정보를 공유하는 전략',
    'radio-check': '라디오 주파수를 확인하는 전략',
  }
  const withLog = {
    ...next,
    logs: [{ day: state.day, text: `성찰 후 ${labels[strategy]}을 내일의 약속으로 정했어요.`, tone: 'info' as const }, ...next.logs].slice(0, 8),
  }
  return { ...withLog, badges: unlockBadges(withLog) }
}

export function useMedkit(state: GameState, familyId: FamilyId): GameState {
  if (state.resources.medkit <= 0) return state
  const healerBonus = state.family.some((member) => member.ability === 'healer') ? 10 : 0
  return {
    ...state,
    resources: { ...state.resources, medkit: state.resources.medkit - 1 },
    family: state.family.map((member) => member.id === familyId && !member.unableToAct
      ? normalizeCharacter({ ...member, health: member.health + 30 + healerBonus, mood: 'relieved' })
      : member),
    logs: [{ day: state.day, text: '구급상자를 사용해 몸을 돌봤어요.', tone: 'good' as const }, ...state.logs].slice(0, 8),
  }
}

export function chooseFarmEvent(state: GameState, random: () => number = Math.random): GameState {
  const pool = eventsFor(state.disaster, true)
  const index = Math.min(pool.length - 1, Math.floor(random() * pool.length))
  return { ...state, currentEvent: pool[index] }
}

export function getHint(state: GameState): string | undefined {
  if (!state.family.some((member) => member.ability === 'hint')) return undefined
  const choice = state.currentEvent.choices.reduce((best, current) => {
    const score = (item: Choice) => item.effects.reduce((sum, effect) => sum + (effect.preparedness ?? 0) - Math.max(0, effect.risk ?? 0), 0)
    return score(current) > score(best) ? current : best
  })
  return `할머니의 힌트: “${choice.label}” 선택을 천천히 생각해 보자.`
}

export function resourceLabel(key: ItemKey) {
  return { bread: '빵', water: '물', medkit: '구급상자' }[key]
}

export function safetyGrade(level: number) {
  if (level >= 5) return '안전 리더'
  if (level >= 4) return '재난 대비 달인'
  if (level >= 3) return '안전 탐험가'
  if (level >= 2) return '준비 연습생'
  return '안전 새싹'
}

export function createLearningReport(state: GameState): LearningReport {
  const labels: Record<LearningCategory, string> = {
    preparedness: '사전 대비',
    information: '정보 확인',
    evacuation: '안전 대피',
    resources: '물품 관리',
    community: '공동체 협력',
  }
  const categoryIds = Object.keys(labels) as LearningCategory[]
  const categories = categoryIds.map((category) => {
    const records = state.choiceHistory.filter((record) => record.category === category)
    const safe = records.filter((record) => record.quality === 'safe').length
    return {
      category,
      label: labels[category],
      safe,
      total: records.length,
      score: records.length ? Math.round((safe / records.length) * 100) : 0,
    }
  })
  const totalChoices = state.choiceHistory.length
  const safeChoices = state.choiceHistory.filter((record) => record.quality === 'safe').length
  const attempted = categories.filter((category) => category.total > 0)
  return {
    totalChoices,
    safeChoices,
    mastery: totalChoices ? Math.round((safeChoices / totalChoices) * 100) : 0,
    categories,
    strengths: [...attempted].sort((a, b) => b.score - a.score).slice(0, 2),
    growthAreas: [...attempted].sort((a, b) => a.score - b.score).slice(0, 2),
  }
}

function inferChoiceQuality(choice: Choice) {
  const healthRisk = choice.effects.some((effect) => effect.stat === 'health' && (effect.amount ?? 0) < 0)
  const risky = choice.effects.some((effect) => (effect.risk ?? 0) > 0 && (effect.preparedness ?? 0) < 2)
  if (healthRisk || risky) return 'risky' as const
  const safe = choice.effects.some((effect) => (effect.preparedness ?? 0) >= 2 || (effect.rescue ?? 0) >= 3 || (effect.risk ?? 0) < 0)
  return safe ? 'safe' as const : 'neutral' as const
}

function unlockBadges(state: GameState) {
  const unlocked = new Set(state.badges.map((badge) => badge.id))
  const shouldUnlock: Record<string, boolean> = {
    'first-step': state.choiceHistory.some((record) => record.quality === 'safe'),
    'combo-3': state.bestCombo >= 3,
    'prepared-20': state.preparedness >= 20,
    'community-10': state.rescue >= 10,
    'level-3': state.level >= 3,
  }
  return [...state.badges, ...BADGES.filter((badge) => shouldUnlock[badge.id] && !unlocked.has(badge.id))]
}
