import { describe, expect, it } from 'vitest'
import { COMPOUND_SCENARIOS, EVENTS, FARM_EVENTS, pickRandomStrategies } from '../data/gameData'
import { advanceDay, applyStrategy, chooseFarmEvent, clamp, consumeDailyResources, createGame, createLearningReport, determineEnding, resolveChoice, safetyGrade, startingResources } from './engine'

describe('게임 초기 상태', () => {
  it('선택 인원에 따라 비상 물품을 준비한다', () => {
    expect(startingResources(1)).toEqual({ bread: 2, water: 2, medkit: 1 })
    expect(startingResources(3)).toEqual({ bread: 6, water: 6, medkit: 3 })
  })

  it('세 명의 상태를 100으로 시작한다', () => {
    const game = createGame(['mom', 'dad', 'me'], 'typhoon')
    expect(game.day).toBe(1)
    expect(game.family.every((member) => member.health === 100 && member.hunger === 100 && member.thirst === 100)).toBe(true)
  })

  it('가족 선택 범위를 확인한다', () => {
    expect(() => createGame([], 'rain')).toThrow()
    expect(() => createGame(['mom', 'dad', 'me', 'sister'], 'rain')).toThrow()
  })
})

describe('상태와 물품 경계', () => {
  it('상태값을 0에서 100 사이로 제한한다', () => {
    expect(clamp(-10)).toBe(0)
    expect(clamp(120)).toBe(100)
  })

  it('없는 물품은 음수가 되지 않는다', () => {
    const game = createGame(['me'], 'rain')
    game.resources.bread = 0
    const choice = {
      id: 'share',
      label: '나누기',
      result: '안전하게 나눴어요.',
      tip: '먼저 물품을 확인해요.',
      effects: [{ item: 'bread' as const, itemAmount: -3 }],
    }
    const next = resolveChoice(game, choice)
    expect(next.resources.bread).toBe(0)
  })
})

describe('일일 생존 규칙', () => {
  it('음식과 물이 없으면 배고픔과 갈증이 20 감소한다', () => {
    const game = createGame(['me'], 'earthquake')
    game.resources = { bread: 0, water: 0, medkit: 0 }
    const next = consumeDailyResources(game)
    expect(next.family[0].hunger).toBe(80)
    expect(next.family[0].thirst).toBe(80)
  })

  it('빵과 물을 먹으면 배고픔과 갈증이 각각 30 회복된다', () => {
    const game = createGame(['me'], 'typhoon')
    game.family[0].hunger = 40
    game.family[0].thirst = 50
    game.resources = { bread: 1, water: 1, medkit: 0 }
    const next = consumeDailyResources(game)
    expect(next.family[0].hunger).toBe(70)
    expect(next.family[0].thirst).toBe(80)
  })

  it('배고픔과 갈증이 0이면 체력이 각각 50 감소해 행동 불가가 된다', () => {
    const game = createGame(['me'], 'earthquake')
    game.resources = { bread: 0, water: 0, medkit: 0 }
    game.family[0].hunger = 10
    game.family[0].thirst = 10
    const next = consumeDailyResources(game)
    expect(next.family[0].health).toBe(0)
    expect(next.family[0].unableToAct).toBe(true)
  })

  it('행동 불가 가족은 이후 물품을 소비하지 않는다', () => {
    const game = createGame(['mom', 'me'], 'typhoon')
    game.family[0].health = 0
    game.family[0].unableToAct = true
    const next = consumeDailyResources(game)
    expect(next.resources.bread).toBe(3)
    expect(next.resources.water).toBe(3)
  })
})

describe('엔딩', () => {
  it('30일의 행동을 마치면 엔딩 화면으로 이동한다', () => {
    const game = createGame(['grandma'], 'typhoon')
    game.day = 30
    game.resources = { bread: 40, water: 40, medkit: 1 }
    const result = resolveChoice(game, game.currentEvent.choices[0])
    expect(result.day).toBe(30)
    const next = advanceDay(result)
    expect(next.phase).toBe('ending')
    expect(next.ending).toBeDefined()
  })

  it('선택 결과를 확인하기 전에는 다음 날로 자동 진행하지 않는다', () => {
    const game = createGame(['me'], 'typhoon')
    const result = resolveChoice(game, game.currentEvent.choices[0])
    expect(result.day).toBe(1)
    expect(advanceDay(result).day).toBe(2)
  })

  it('모두 행동 불가이면 구조 대기 엔딩을 고른다', () => {
    const game = createGame(['me'], 'rain')
    game.family[0].health = 0
    game.family[0].unableToAct = true
    expect(determineEnding(game).id).toBe('waiting')
  })
})

describe('게이미피케이션', () => {
  it('안전한 선택을 연속으로 하면 콤보 경험치와 레벨이 오른다', () => {
    let game = createGame(['me'], 'typhoon')
    game.resources = { bread: 100, water: 100, medkit: 1 }
    const safeChoice = game.currentEvent.choices[0]
    game = resolveChoice(game, safeChoice)
    expect(game.xp).toBe(25)
    expect(game.combo).toBe(1)
    game = resolveChoice(game, safeChoice)
    game = resolveChoice(game, safeChoice)
    game = resolveChoice(game, safeChoice)
    expect(game.xp).toBe(130)
    expect(game.level).toBe(2)
    expect(game.bestCombo).toBe(4)
    expect(game.badges.map((badge) => badge.id)).toEqual(expect.arrayContaining(['first-step', 'combo-3']))
    expect(safetyGrade(game.level)).toBe('준비 연습생')
  })

  it('위험한 선택은 콤보를 초기화하고 선택 기록에 남긴다', () => {
    let game = createGame(['me'], 'typhoon')
    game.resources = { bread: 10, water: 10, medkit: 1 }
    game = resolveChoice(game, game.currentEvent.choices[0])
    game = resolveChoice(game, game.currentEvent.choices[1])
    expect(game.combo).toBe(0)
    expect(game.choiceHistory[1].quality).toBe('risky')
    expect(game.choiceHistory[1].xpEarned).toBe(0)
  })

  it('성찰 후 선택한 전략이 다음 날 상태에 반영된다', () => {
    const game = createGame(['mom'], 'rain')
    expect(applyStrategy(game, 'inspect').risk).toBe(19)
    expect(applyStrategy(game, 'supplies').preparedness).toBe(2)
    expect(applyStrategy(game, 'communicate').rescue).toBe(2)
    game.family[0].health = 80
    expect(applyStrategy(game, 'recover').family[0].health).toBe(83)
  })
})

describe('학습 리포트와 시나리오 확장', () => {
  it('선택 기록을 영역별 학습 리포트로 집계한다', () => {
    let game = createGame(['grandma'], 'typhoon')
    game.resources = { bread: 10, water: 10, medkit: 1 }
    game = resolveChoice(game, game.currentEvent.choices[0])
    const report = createLearningReport(game)
    expect(report.totalChoices).toBe(1)
    expect(report.safeChoices).toBe(1)
    expect(report.mastery).toBe(100)
    expect(report.strengths[0].category).toBe('preparedness')
  })

  it('복합 재난 시나리오가 사건 체인과 위험 요소를 제공한다', () => {
    const typhoonScenario = COMPOUND_SCENARIOS.find((scenario) => scenario.id === 'typhoon-blackout')
    expect(typhoonScenario?.eventIds).toEqual(['window', 'blackout', 'radio'])
    expect(typhoonScenario?.hazards).toContain('blackout')
    expect(EVENTS.find((event) => event.id === 'window')?.scenario?.nextEventIds).toContain('blackout')
  })
})

describe('파밍 50:50 획득 판정', () => {
  it('난수가 0.5 미만이면 물품 획득에 성공한다', () => {
    let game = createGame(['me'], 'typhoon')
    game.resources = { bread: 0, water: 0, medkit: 0 }
    game = chooseFarmEvent(game, () => 0)
    const result = resolveChoice(game, game.currentEvent.choices[0], 0, () => 0.49)
    expect(result.resources.bread).toBe(4)
    expect(result.resources.water).toBe(3)
    expect(result.choiceHistory[0].farmingOutcome).toBe('success')
  })

  it('세 명이 파밍해도 성공 보상이 소비되지 않고 비상 물품에 저장된다', () => {
    let game = createGame(['mom', 'dad', 'me'], 'typhoon')
    game.resources = { bread: 0, water: 0, medkit: 0 }
    game = chooseFarmEvent(game, () => 0)
    const result = resolveChoice(game, game.currentEvent.choices[0], 0, () => 0.1)
    expect(result.resources.bread).toBe(4)
    expect(result.resources.water).toBe(3)
  })

  it('난수가 0.5 이상이면 물품을 얻지 못한다', () => {
    let game = createGame(['me'], 'typhoon')
    game.resources = { bread: 0, water: 0, medkit: 0 }
    game = chooseFarmEvent(game, () => 0)
    const result = resolveChoice(game, game.currentEvent.choices[0], 0, () => 0.5)
    expect(result.resources.bread).toBe(0)
    expect(result.resources.water).toBe(0)
    expect(result.choiceHistory[0].farmingOutcome).toBe('empty')
    expect(result.choiceHistory[0].outcomeText).toContain('찾지 못했어요')
  })

  it('파밍 사건이 여러 장소와 구급상자 획득 선택을 포함한다', () => {
    expect(FARM_EVENTS.length).toBeGreaterThanOrEqual(6)
    const eventIds = new Set(FARM_EVENTS.map((event) => event.id))
    expect(eventIds.size).toBe(FARM_EVENTS.length)
    const hasMedkitFarming = FARM_EVENTS.some((event) => event.choices.some((choice) => choice.effects.some((effect) => effect.item === 'medkit' && (effect.itemAmount ?? 0) > 0)))
    expect(hasMedkitFarming).toBe(true)
  })

  it('파밍 출발 때 난수에 따라 다른 사건을 선택한다', () => {
    const game = createGame(['me'], 'typhoon')
    const first = chooseFarmEvent(game, () => 0).currentEvent.id
    const last = chooseFarmEvent(game, () => 0.999).currentEvent.id
    expect(first).not.toBe(last)
  })
})

describe('랜덤 전략 제안', () => {
  it('전체 전략 중 중복 없는 세 가지를 제시한다', () => {
    const options = pickRandomStrategies(3, () => 0)
    expect(options).toHaveLength(3)
    expect(new Set(options.map((strategy) => strategy.id)).size).toBe(3)
  })

  it('난수에 따라 다른 전략 조합을 만든다', () => {
    const first = pickRandomStrategies(3, () => 0).map((strategy) => strategy.id)
    const second = pickRandomStrategies(3, () => 0.999).map((strategy) => strategy.id)
    expect(first).not.toEqual(second)
  })
})
