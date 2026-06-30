import { useMemo, useState } from 'react'
import { pickRandomStrategies } from '../data/gameData'
import type { Choice, GameState, StrategyId } from '../types/game'

export interface StoryResult {
  before: GameState
  after: GameState
  choice: Choice
  action: 'prepare' | 'care' | 'explore' | 'caution'
}

export default function ResultStory({ story, onContinue }: { story: StoryResult; onContinue: (strategy: StrategyId) => void }) {
  const [step, setStep] = useState<'result' | 'reflect' | 'strategy'>('result')
  const strategyOptions = useMemo(() => pickRandomStrategies(3), [story.before.day, story.before.currentEvent.id])
  const changes = describeChanges(story.before, story.after)
  const actor = story.after.family.find((member, index) => {
    const before = story.before.family[index]
    return before && (member.health !== before.health || member.hunger !== before.hunger || member.thirst !== before.thirst)
  }) ?? story.after.family.find((member) => !member.unableToAct)
  const record = story.after.choiceHistory[story.after.choiceHistory.length - 1]
  const newBadges = story.after.badges.filter((badge) => !story.before.badges.some((beforeBadge) => beforeBadge.id === badge.id))

  return (
    <div className="story-backdrop" role="dialog" aria-modal="true" aria-labelledby="story-title">
      <article className={`story-card story-${story.action}`}>
        <div className="story-scene">
          <span className="story-burst">{story.action === 'explore' ? '🎒' : story.action === 'care' ? '💗' : story.action === 'caution' ? '⚠️' : '🛠️'}</span>
          <div className="story-actor" style={{ '--actor': actor?.color ?? '#70a893' } as React.CSSProperties}>
            <i>{actor?.emoji ?? '⭐'}</i>
            <b>{actor?.name ?? '가족'}</b>
          </div>
          <div className="motion-lines"><i /><i /><i /></div>
        </div>
        <div className="story-copy">
          <div className="learning-steps" aria-label="경험 학습 진행 단계">
            <i className={step === 'result' ? 'active' : 'done'}>1 경험</i>
            <i className={step === 'reflect' ? 'active' : step === 'strategy' ? 'done' : ''}>2 성찰</i>
            <i className={step === 'strategy' ? 'active' : ''}>3 실험</i>
          </div>
          {step === 'result' && (
            <>
              <span className="eyebrow">{story.before.day}일차 · 선택 결과</span>
              <h2 id="story-title">{story.choice.label}</h2>
              <p className="story-result">{record?.outcomeText ?? story.choice.result}</p>
              {record?.farmingOutcome && (
                <div className={`farming-outcome farming-${record.farmingOutcome}`}>
                  {record.farmingOutcome === 'success' ? '🎁 파밍 성공 · 물품을 찾았어요!' : '🔎 파밍 결과 · 이번에는 물품을 찾지 못했어요.'}
                </div>
              )}
              <div className="reward-banner">
                <span>⭐ 안전 경험치 <b>+{record?.xpEarned ?? 0}</b></span>
                <span>🔥 콤보 <b>{story.after.combo}</b></span>
                <span>Lv.{story.after.level}</span>
              </div>
              <div className="change-list" aria-label="상태 변화">
                {changes.length ? changes.map((change) => (
                  <span className={change.good ? 'change-good' : 'change-bad'} key={change.label}>
                    {change.icon} {change.label} <b>{change.value}</b>
                  </span>
                )) : <span className="change-neutral">✨ 상태 변화 없이 안전하게 마쳤어요</span>}
              </div>
              {newBadges.map((badge) => <div className="badge-unlocked" key={badge.id}>{badge.icon} 새 배지 획득! <b>{badge.name}</b></div>)}
              <p className="daily-use">하루 동안 가족이 빵과 물을 사용한 결과까지 반영됐어요.</p>
              <button className="primary-button continue-button" onClick={() => setStep('reflect')}>왜 이런 결과가 나왔는지 알아보기</button>
            </>
          )}
          {step === 'reflect' && (
            <section className="reflection-panel">
              <span className="eyebrow">성찰적 관찰 · 안전 원리</span>
              <h2 id="story-title">선택에서 무엇을 배웠을까요?</h2>
              <div className="principle-card"><span>💡</span><p>{story.choice.tip}</p></div>
              <p className="reflection-question">“같은 상황이 다시 온다면, 가족의 안전을 위해 무엇을 먼저 확인할까요?”</p>
              <div className={`quality-chip quality-${record?.quality ?? 'neutral'}`}>
                {record?.quality === 'safe' ? '안전 원리를 잘 실천한 선택이에요.' : record?.quality === 'risky' ? '다음에는 위험 요소를 먼저 살펴보면 더 좋아요.' : '좋은 출발이에요. 안전 정보를 한 번 더 확인해 봐요.'}
              </div>
              <button className="primary-button continue-button" onClick={() => setStep('strategy')}>내일의 전략 정하기</button>
            </section>
          )}
          {step === 'strategy' && (
            <section className="strategy-panel">
              <span className="eyebrow">능동적 실험 · 내일의 약속</span>
              <h2 id="story-title">어떤 전략을 실천할까요?</h2>
              <p>오늘 배운 원리를 내일의 행동으로 연결해 보세요.</p>
              <div className="strategy-list">
                {strategyOptions.map((strategy) => (
                  <button key={strategy.id} onClick={() => onContinue(strategy.id)}>
                    <span>{strategy.icon}</span><div><b>{strategy.title}</b><small>{strategy.description}</small></div><i>선택</i>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </div>
  )
}

function describeChanges(before: GameState, after: GameState) {
  const changes: Array<{ label: string; value: string; icon: string; good: boolean }> = []
  const resourceMeta = {
    bread: { label: '빵', icon: '🍞' },
    water: { label: '물', icon: '💧' },
    medkit: { label: '구급상자', icon: '🩹' },
  }
  ;(['bread', 'water', 'medkit'] as const).forEach((key) => {
    const delta = after.resources[key] - before.resources[key]
    if (delta) changes.push({ label: resourceMeta[key].label, icon: resourceMeta[key].icon, value: signed(delta), good: delta > 0 })
  })
  const scoreMeta = {
    risk: { label: '위험도', icon: '⚠️', inverse: true },
    preparedness: { label: '대비 점수', icon: '🛡️', inverse: false },
    rescue: { label: '구조 연결', icon: '📡', inverse: false },
  }
  ;(['risk', 'preparedness', 'rescue'] as const).forEach((key) => {
    const delta = after[key] - before[key]
    if (delta) changes.push({ label: scoreMeta[key].label, icon: scoreMeta[key].icon, value: signed(delta), good: scoreMeta[key].inverse ? delta < 0 : delta > 0 })
  })
  after.family.forEach((member, index) => {
    const healthDelta = member.health - before.family[index].health
    const hungerDelta = member.hunger - before.family[index].hunger
    const thirstDelta = member.thirst - before.family[index].thirst
    if (healthDelta) changes.push({ label: `${member.name} 체력`, icon: member.emoji, value: signed(healthDelta), good: healthDelta > 0 })
    if (hungerDelta) changes.push({ label: `${member.name} 배고픔`, icon: '🍽️', value: signed(hungerDelta), good: hungerDelta > 0 })
    if (thirstDelta) changes.push({ label: `${member.name} 갈증`, icon: '🥤', value: signed(thirstDelta), good: thirstDelta > 0 })
  })
  return changes
}

function signed(value: number) {
  return `${value > 0 ? '+' : ''}${value}`
}
